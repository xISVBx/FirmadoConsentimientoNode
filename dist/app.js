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
            origin: '*',
            credentials: true
        }));
        this.app.use(express_1.default.json());
        this.app.use((0, morgan_1.default)('dev'));
    }
    routes() {
        this.app.use('/api', consentimientosRouter_js_1.default.router);
        this.app.get('/', (req, res) => {
            res.status(200).send({ message: 'API is running' });
        });
    }
    start() {
        // Usar el puerto proporcionado por el entorno (por ejemplo, por cPanel)
        const port = process.env.PORT || 80; // Usa el puerto de entorno o 80 por defecto
        const host = '0.0.0.0'; // cPanel usa 0.0.0.0 para aceptar conexiones desde cualquier IP
        this.app.listen(parseInt(port), host, () => {
            console.log(`Listening on http://${host}:${port}/`);
        });
    }
}
new Server();