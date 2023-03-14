import swaggerUi from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'SECURE-NODEJS-AUTH-API',
            version: '1.0.0',
            description: 'boilerplate code for a secure node js auth system ',
            license: {
                name: 'MIT',
                url: 'https://opensource.org/licenses/MIT'
            },
            contact: {
                name: 'Ogubuike Emejuru',
                email: 'ogubuike245@gmail.com'
            }
        },
        servers: [
            {
                url: 'http://localhost:5000/',
                description: 'MIND'
            }
        ]
    },
    apis: ['./src/routes/*.js']
};

const specs = swaggerJsDoc(options);

export const swaggerDoc = (app) => {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
};
