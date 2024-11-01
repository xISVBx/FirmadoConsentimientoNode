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
const consentimientosService_1 = __importDefault(require("../Services/consentimientosService"));
const token_1 = require("../utils/token");
const uuid_1 = require("uuid");
class ConsentimientoRouter {
    constructor() {
        this.service = new consentimientosService_1.default();
        this.router = (0, express_1.Router)();
        this.config();
    }
    config() {
        this.router.post('/consentimiento', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const { base64Image, nombreTitular, telefonoTitular, correoTitular, fechaNacimiento, token, idioma } = req.body;
            if (!base64Image) {
                res.status(400).send('Se debe firmar el formulario requerido!!!');
                return;
            }
            if (!token) {
                console.log(token);
                res.status(400).send('No se envio el token!!!');
                return;
            }
            var decodedToken = (0, token_1.verifyToken)(token);
            if (decodedToken == null) {
                res.status(400).send('Token no valido!!!');
                return;
            }
            console.log(decodedToken);
            var response = yield this.service.GenerarConsentimiento(base64Image, nombreTitular, telefonoTitular, correoTitular, fechaNacimiento, decodedToken, idioma);
            if (response) {
                res.status(200).send(response);
                return;
            }
            else {
                res.status(500).send(response);
                return;
            }
        }));
        this.router.post('/statements', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const { base64Image, plan, codigoPostal, correoTitular, compania, ingresoAnual, nombreConsumidor, token, idioma } = req.body;
            if (!base64Image) {
                res.status(400).send('Se debe firmar el formulario requerido!!!');
                return;
            }
            if (!token) {
                console.log(token);
                res.status(400).send('No se envio el token!!!');
                return;
            }
            var decodedToken = (0, token_1.verifyToken)(token);
            console.log(decodedToken);
            if (decodedToken == null) {
                res.status(400).send('Token no valido!!!');
                return;
            }
            var response = yield this.service.GenerarStatements(base64Image, idioma, correoTitular, decodedToken, {
                plan,
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
                res.status(500).send(response);
                return;
            }
        }));
        this.router.post('/consentimiento/correo', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const { nombreAgente, numeroProductor, telefonoAgente, correoAgente, destinatario } = req.body;
            var response = yield this.service.EnviarFormularioConsentimiento(nombreAgente, numeroProductor, telefonoAgente, correoAgente, destinatario);
            if (response) {
                res.status(200).send(response);
            }
            else {
                res.status(500).send(response);
            }
        }));
    }
}
exports.default = new ConsentimientoRouter();
