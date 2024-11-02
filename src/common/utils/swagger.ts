import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

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
                url: 'http://localhost:3000', // Cambia esto según tu entorno
            },
        ],
    },
    apis: ['./src/routes/*.ts'], // Ruta donde se encuentran tus archivos de rutas
};

const swaggerDocs = swaggerJSDoc(swaggerOptions);

export default { swaggerUi, swaggerDocs };
