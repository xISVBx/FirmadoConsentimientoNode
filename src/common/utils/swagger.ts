import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const prod = 'https://api.jecopainsurance.com'
const prueba = 'http://localhost:3000'

const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'API de Consentimientos',
            version: '1.0.0',
            description: 'Documentación de la API para manejar consentimientos.',
        },
        servers: [
            {
                url: prueba, 
            },
        ],
    },
    apis: ['./src/router/routes/*.ts'], 
};

const swaggerDocs = swaggerJSDoc(swaggerOptions);

export { swaggerUi, swaggerDocs };
