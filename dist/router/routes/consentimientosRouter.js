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
const express_1 = require("express");
const consentimientosService_1 = __importDefault(require("../../application/consentimientosService"));
const token_1 = require("../../common/utils/token");
const uuid_1 = require("uuid");
const CustomError_1 = require("../../common/errors/CustomError");
const path_1 = __importDefault(require("path"));
class ConsentimientoRouter {
    constructor() {
        this.service = new consentimientosService_1.default();
        this.router = (0, express_1.Router)();
        this.config();
    }
    config() {
        this.router.post('/consentimiento', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { base64Image, nombreTitular, telefonoTitular, correoTitular, fechaNacimiento, token, idioma } = req.body;
                if (!base64Image) {
                    throw CustomError_1.CustomError.BadRequest('Se debe firmar el formulario requerido!!!');
                }
                if (!token) {
                    throw CustomError_1.CustomError.BadRequest('No se envio el token!!!');
                }
                var decodedToken = (0, token_1.verifyToken)(token);
                if (decodedToken == null) {
                    throw CustomError_1.CustomError.BadRequest('Token no valido!!!');
                }
                // Obtener las coordenadas desde los headers
                const latitude = req.headers['x-latitude'];
                const longitude = req.headers['x-longitude'];
                // Obtener el valor de 'x-forwarded-for'
                const xForwardedFor = req.headers['x-forwarded-for'];
                // Verificar si 'x-forwarded-for' es una cadena o un array
                const ipCliente = Array.isArray(xForwardedFor)
                    ? xForwardedFor[0] // Si es un array, tomamos la primera IP
                    : (xForwardedFor ? xForwardedFor.split(',')[0] : req.socket.remoteAddress);
                var response = yield this.service.GenerarConsentimiento(base64Image, nombreTitular, telefonoTitular, correoTitular, fechaNacimiento, decodedToken, idioma, ipCliente !== null && ipCliente !== void 0 ? ipCliente : '');
                if (response) {
                    res.status(200).send(response);
                    return;
                }
                else {
                    throw CustomError_1.CustomError.BadRequest('Error');
                }
            }
            catch (error) {
                next(error);
            }
        }));
        this.router.post('/consentimiento/correo', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('Entro');
                const { nombreAgente, numeroProductor, telefonoAgente, correoAgente, destinatario } = req.body;
                var response = yield this.service.EnviarFormularioConsentimiento(nombreAgente, numeroProductor, telefonoAgente, correoAgente, destinatario);
                if (response) {
                    res.status(200).send(response);
                    return;
                }
                else {
                    throw CustomError_1.CustomError.BadRequest(response);
                }
            }
            catch (err) {
                next(err);
            }
        }));
        this.router.post('/statements', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { base64Image, correoTitular, nombreConsumidor, token, idioma } = req.body;
                if (!base64Image) {
                    throw CustomError_1.CustomError.BadRequest('Se debe firmar el formulario requerido!!!');
                }
                if (!token) {
                    throw CustomError_1.CustomError.BadRequest('No se envio el token!!!');
                }
                var decodedToken = (0, token_1.verifyToken)(token);
                if (decodedToken == null) {
                    throw CustomError_1.CustomError.BadRequest('Token no valido!!!');
                }
                // Obtener el valor de 'x-forwarded-for'
                const xForwardedFor = req.headers['x-forwarded-for'];
                // Verificar si 'x-forwarded-for' es una cadena o un array
                const ipCliente = Array.isArray(xForwardedFor)
                    ? xForwardedFor[0] // Si es un array, tomamos la primera IP
                    : (xForwardedFor ? xForwardedFor.split(',')[0] : req.socket.remoteAddress);
                var response = yield this.service.GenerarStatements(base64Image, idioma, correoTitular, decodedToken, {
                    idConsentimiento: (0, uuid_1.v4)(),
                    nombreConsumidor
                }, ipCliente !== null && ipCliente !== void 0 ? ipCliente : '');
                if (response) {
                    res.status(200).send(response);
                    return;
                }
                else {
                    throw CustomError_1.CustomError.BadRequest('Error');
                }
            }
            catch (err) {
                next(err);
            }
        }));
        this.router.post('/statements/correo', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { nombreAgente, codigoPostal, ingresoAnual, compania, destinatario, plan } = req.body;
                var response = yield this.service.EnviarFormularioAfirmaciones(nombreAgente, codigoPostal, ingresoAnual, compania, destinatario, plan);
                if (response) {
                    res.status(200).send(response);
                }
                else {
                    throw CustomError_1.CustomError.BadRequest(response);
                }
            }
            catch (err) {
                next(err);
            }
        }));
        this.router.get('/documento_firmado/:id', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const filePath = path_1.default.join(__dirname, '../../../', 'consentimientos', `${id}`, `formulario_consentimiento.pdf`);
                // Establecer el nombre del archivo a mostrar cuando se descargue
                const downloadName = 'documento.pdf';
                // Configurar el encabezado para indicar que se va a hacer una descarga
                res.setHeader('Content-Disposition', `attachment; filename="${downloadName}"`);
                // Enviar el archivo
                res.sendFile(filePath, (err) => {
                    if (err) {
                        next(err); // Pasar el error al siguiente manejador de errores
                    }
                });
            }
            catch (err) {
                next(err);
            }
        }));
        this.router.get('/consentimientos', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.service.ObtenerTodosLosConsentimientos();
                res.status(200).send(response);
            }
            catch (error) {
                next(error);
            }
        }));
        this.router.get('/imagen', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { path: imagePath } = req.query;
                if (!imagePath || typeof imagePath !== 'string') {
                    throw CustomError_1.CustomError.BadRequest("Se debe proporcionar el parámetro 'path'");
                }
                const resolvedPath = path_1.default.resolve(imagePath); // Asegura seguridad de la ruta
                res.sendFile(resolvedPath, (err) => {
                    if (err) {
                        next(CustomError_1.CustomError.NotFound("No se pudo cargar la imagen"));
                    }
                });
            }
            catch (err) {
                next(err);
            }
        }));
    }
}
exports.default = new ConsentimientoRouter();
