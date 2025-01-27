const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Restaurant Management API',
            version: '1.0.0',
            description: 'Restaurant yönetim sistemi API dokümantasyonu',
        },
        servers: [
            {
                url: process.env.API_URL || 'http://localhost:3000',
                description: 'API Server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
    },
    apis: ['./routes/*.js'], // routes klasöründeki tüm dosyaları tara
};

const specs = swaggerJsdoc(options);

module.exports = specs; 