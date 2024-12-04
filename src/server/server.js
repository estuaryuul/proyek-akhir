require('dotenv').config();

const Hapi = require("@hapi/hapi");
const routes = require("../server/routes");
const loadModel = require('../services/loadModel');
const InputError = require('../exceptions/InputError');

(async () => {
    const server = Hapi.server({
        port: 3000,
        host: '0.0.0.0',
        routes: {
            cors: {
                origin: ['*']
            }
        }
    });

    const model = await loadModel();
    server.app.model = model;

    server.route(routes);

    server.ext('onPreResponse', (request, h) => {
        const response = request.response;

        if(response instanceof InputError) {
            const newRespose  = h.response({
                status: 'fail',
                message: 'Terjadi kesalahan dalam melakukan prediksi'
            })
            newRespose.code(response.statusCode);
            return newRespose;
        }

        if (response.isBoom && response.output.statusCode === 413) {
            // Custom response for 413
            const customResponse = {
                status: 'fail',
                message: 'Payload content length greater than maximum allowed: 1000000',
            };
            return h.response(customResponse).code(413);
        }     

        return h.continue;
    });

    await server.start();
    console.log(`Server start at: ${server.info.uri}`);    
})();