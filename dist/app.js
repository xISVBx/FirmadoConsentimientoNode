"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const cors_1 = __importDefault(require("cors"));
const consentimientosRouter_js_1 = __importDefault(require("./router/consentimientosRouter.js"));
const dotenv_1 = __importDefault(require("dotenv"));
class Server {
    constructor() {
        this.app = (0, express_1.default)();
        this.config();
        this.routes();
        this.start();
    }
    config() {
        dotenv_1.default.config();
        this.app.use((0, cors_1.default)({
            origin: '*', // Cambia esto según tu política de CORS
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization'],
            credentials: true
        }));
        this.app.use(express_1.default.json());
        this.app.use((0, morgan_1.default)('dev'));
    }
    routes() {
        this.app.use('/api', consentimientosRouter_js_1.default.router);
        this.app.get('/api', (req, res) => {
            res.status(200).send({ message: 'API is running' });
        });
        this.app.post('/api', (req, res) => {
            res.status(200).send({ message: 'post passed' });
        });
    }
    start() {
        // Usar el puerto proporcionado por el entorno (por ejemplo, por cPanel)
        const port = process.env.PORT || 3000; // Usa el puerto de entorno o 80 por defecto
        this.app.listen(parseInt(port), () => {
            console.log(`Listening on http://:${port}/`);
        });
    }
}
new Server();
