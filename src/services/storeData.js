const { Firestore } = require('@google-cloud/firestore');

async function storeData(id, data) {
    const db = new Firestore();

    const preditCollection = db.collection('predictions');
    return preditCollection.doc(id).set(data);
}

module.exports = storeData;