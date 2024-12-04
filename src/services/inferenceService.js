const tf = require('@tensorflow/tfjs-node');
const InputError = require('../exceptions/InputError');
const sharp = require('sharp');


async function predictClassification(model, image) {
    try{
        const metadata = await sharp(image).metadata();
        const decodedImage = tf.node.decodeJpeg(image, 3);

        // Validate image properties
        
        if (metadata.channels !== 3) {
            throw new InputError(
                `Image dimensions or color format are invalid. Expected (224x224x3), but got (${width}x${height}x${channels})`
            );
        }

        // Preprocess the image
        const tensor = decodedImage
            .resizeNearestNeighbor([224, 224]) // Ensure size is correct (optional redundancy)
            .expandDims()
            .toFloat();

        const prediction = model.predict(tensor);
        const score = await prediction.data();
        console.log(score * 100);
        
        const label = score * 100 > 50 ? 'Cancer' : 'Non-cancer';
    
        let suggestion;
    
        if (label === 'Cancer') {
            suggestion = 'Segera periksa ke dokter!';
        }
    
        if (label === 'Non-cancer') {
            suggestion = 'Penyakit kanker tidak terdeteksi.';
        }
    
        return {label, suggestion};
    } catch(error) {
        throw new InputError('Terjadi kesalahan dalam melakukan prediksi')
    }
}

module.exports = predictClassification;