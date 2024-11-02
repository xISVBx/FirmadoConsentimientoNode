"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
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
const swaggerDocs = (0, swagger_jsdoc_1.default)(swaggerOptions);
exports.default = { swaggerUi: swagger_ui_express_1.default, swaggerDocs };
