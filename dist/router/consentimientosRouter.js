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
class ConsentimientoRouter {
    constructor() {
        this.service = new consentimientosService_1.default();
        this.router = (0, express_1.Router)();
        this.config();
    }
    config() {
        this.router.post('/consentimiento', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const { base64Image, nombreTitular, telefonoTitular, correoTitular, fechaNacimiento } = req.body;
            if (!base64Image) {
                res.status(400).send('El parámetro base64Image es requerido');
                return;
            }
            var nombreAgente = "Carlos";
            var numeroAgente = "12365484321";
            var telefonoAgente = "32116546";
            var correoAgente = "agente@agente.com";
            var response = yield this.service.GenerarConsentimiento(base64Image, nombreTitular, telefonoTitular, correoTitular, fechaNacimiento, nombreAgente, numeroAgente, telefonoAgente, correoAgente);
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
