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
                url: 'https://api.jecopainsurance.com', // Cambia esto si tu servidor está en otra dirección
            },
        ],
    },
    apis: ['./src/router/routes/*.ts'], // Ruta donde se encuentran tus archivos de rutas
};

const swaggerDocs = swaggerJSDoc(swaggerOptions);

export { swaggerUi, swaggerDocs };
