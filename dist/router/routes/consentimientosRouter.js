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
                var response = yield this.service.GenerarConsentimiento(base64Image, nombreTitular, telefonoTitular, correoTitular, fechaNacimiento, decodedToken, idioma);
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
                const { base64Image, codigoPostal, correoTitular, compania, ingresoAnual, nombreConsumidor, token, idioma } = req.body;
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
                var response = yield this.service.GenerarStatements(base64Image, idioma, correoTitular, decodedToken, {
                    codigoPostal,
                    compania,
                    idConsentimiento: (0, uuid_1.v4)(),
                    ingresoAnual,
                    nombreConsumidor
                });
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
                const { nombreAgente, numeroProductor, telefonoAgente, correoAgente, destinatario, plan } = req.body;
                var response = yield this.service.EnviarFormularioAfirmaciones(nombreAgente, numeroProductor, telefonoAgente, correoAgente, destinatario, plan);
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
    }
}
exports.default = new ConsentimientoRouter();
