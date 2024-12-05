"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const cors_1 = __importDefault(require("cors"));
const airTableRouter_js_1 = __importDefault(require("./router/routes/airTableRouter.js"));
const consentimientosRouter_js_1 = __importDefault(require("./router/routes/consentimientosRouter.js"));
const errorRouter_js_1 = __importDefault(require("./router/routes/errorRouter.js"));
const dotenv_1 = __importDefault(require("dotenv"));
const swagger_js_1 = require("./common/utils/swagger.js");
const uuid_1 = require("uuid");
const sqlite_js_1 = require("./infraestructure/persistence/context/sqlite.js");
const response_js_1 = require("./common/models/response.js");
// Creamos la función "configurable" que genera el middleware
function logRequestToDatabase(options = {}) {
    return function (req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            // Si se pasa la opción blacklist, verificar si la URL está en la lista negra
            const urlIsBlacklisted = (_a = options.blacklist) === null || _a === void 0 ? void 0 : _a.includes(req.originalUrl);
            const methodIsBlacklisted = (_b = options.ignoreMethods) === null || _b === void 0 ? void 0 : _b.includes(req.method);
            // Si la URL o el método están en la lista negra, omitir el registro
            if (urlIsBlacklisted || methodIsBlacklisted) {
                return next(); // No registrar, solo pasa al siguiente middleware
            }
            // Si no está en la lista negra, registrar la solicitud en la base de datos
            const requestId = (0, uuid_1.v4)();
            const startTime = Date.now();
            req.requestId = requestId;
            req.requestStartTime = startTime;
            // Registrar en la base de datos
            const db = yield (0, sqlite_js_1.getDb)();
            yield db.run('INSERT INTO requests (id, method, url, start_time, request_params) VALUES (?, ?, ?, ?, ?)', [
                requestId,
                req.method,
                req.originalUrl,
                new Date(startTime).toISOString(),
                JSON.stringify(req.body)
            ]);
            // Cuando la respuesta finalice, actualizamos la duración y el estado de la respuesta
            res.on('finish', () => __awaiter(this, void 0, void 0, function* () {
                const duration = Date.now() - startTime;
                const responseStatus = res.statusCode;
                yield db.run('UPDATE requests SET duration = ?, response_status = ? WHERE id = ?', [
                    duration,
                    responseStatus,
                    requestId
                ]);
            }));
            next();
        });
    };
}
class Server {
    constructor() {
        // Lista negra de rutas o métodos
        this.blacklist = [
            '/api/error',
        ];
        this.errorHandler = (err, req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const errorDetails = {
                request_id: req.requestId,
                message: err.message,
                stack: err.stack
            };
            yield (0, sqlite_js_1.getDb)().then(db => {
                db.run('INSERT INTO errors (request_id, message, stack) VALUES (?, ?, ?)', [
                    req.requestId,
                    errorDetails.message,
                    errorDetails.stack
                ]);
            });
            res.status(err.status || 500).send(response_js_1.ResponseGeneric.Error(err.message || 'Algo salió mal!'));
        });
        this.app = (0, express_1.default)();
        this.config()
            .then(() => {
            this.routes();
            this.start();
        });
    }
    setupDatabase() {
        return __awaiter(this, void 0, void 0, function* () {
            const db = yield (0, sqlite_js_1.getDb)();
            yield db.exec(`CREATE TABLE IF NOT EXISTS requests (
            id TEXT PRIMARY KEY,
            method TEXT,
            url TEXT,
            start_time TEXT,
            duration INTEGER,
            response_status INTEGER,
            request_params TEXT
        )`);
            yield db.exec(`CREATE TABLE IF NOT EXISTS errors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            request_id TEXT,
            message TEXT,
            stack TEXT
        )`);
            yield db.exec(`CREATE INDEX IF NOT EXISTS idx_start_time ON requests(start_time)`);
        });
    }
    config() {
        return __awaiter(this, void 0, void 0, function* () {
            dotenv_1.default.config();
            yield this.setupDatabase();
            //'https://www.jecopainsurance.com'
            this.app.use((0, cors_1.default)({
                origin: 'https://www.jecopainsurance.com', // Permitir solo este dominio
                methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
                credentials: true, // Si necesitas enviar cookies o encabezados de autorización
            }));
            //this.app.options('*', cors()); // Esto maneja las preflight requests CORS
            this.app.use(express_1.default.json());
            this.app.use('/api-docs', swagger_js_1.swaggerUi.serve, swagger_js_1.swaggerUi.setup(swagger_js_1.swaggerDocs));
            this.app.get('/docs.json', (req, res) => {
                res.setHeader('Content-Type', 'application/json');
                res.send(swagger_js_1.swaggerDocs);
            });
            this.app.use(logRequestToDatabase({
                blacklist: ['/api/error'],
            }));
            this.app.use((0, morgan_1.default)('dev'));
        });
    }
    routes() {
        this.app.use('/api', consentimientosRouter_js_1.default.router);
        this.app.use('/api', errorRouter_js_1.default.router);
        this.app.use('/api', airTableRouter_js_1.default.router);
        this.app.get('/api', (req, res) => {
            res.status(200).send({ message: 'API is running' });
        });
    }
    start() {
        this.app.use(this.errorHandler);
        const port = process.env.PORT || 3000;
        this.app.listen(parseInt(port), () => {
            console.log(`Listening on http://:${port}/`);
        });
    }
}
new Server();
