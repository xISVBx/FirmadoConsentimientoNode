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
Object.defineProperty(exports, "__esModule", { value: true });
const token_1 = require("../utils/token");
const email_1 = require("../infraestructure/email");
const consentimientosRepository_1 = require("../repository/consentimientosRepository");
const CrearConsentimiento_1 = require("../utils/CrearConsentimiento");
const uuid_1 = require("uuid");
const Idioma_1 = require("../domain/Idioma");
class ConsentimientosService {
    GenerarConsentimiento(base64Image, nombreTitular, telefonoTitular, correoTitular, fechaNacimiento, agente, idioma) {
        return __awaiter(this, void 0, void 0, function* () {
            let response = {
                data: false,
                isSucces: false,
                message: ""
            };
            try {
                var consentimientoId = (0, uuid_1.v4)();
                var pdfResponse;
                console.log(idioma);
                console.log(Idioma_1.Idioma.Español === 'es');
                console.log(Idioma_1.Idioma.Inglés === 'en');
                if (idioma === Idioma_1.Idioma.Español) {
                    pdfResponse = yield (0, CrearConsentimiento_1.generatePdf)(base64Image, nombreTitular, telefonoTitular, correoTitular, fechaNacimiento, agente.nombreAgente, agente.numeroProductor, agente.telefonoAgente, agente.correoAgente, consentimientoId);
                }
                else if (idioma === Idioma_1.Idioma.Inglés) {
                    pdfResponse = yield (0, CrearConsentimiento_1.generateEnglishPdf)(base64Image, nombreTitular, telefonoTitular, correoTitular, fechaNacimiento, agente.nombreAgente, agente.numeroProductor, agente.telefonoAgente, agente.correoAgente, consentimientoId);
                }
                if (pdfResponse == undefined) {
                    return response;
                }
                var correoResponse = yield (0, email_1.enviarCorreo)([correoTitular, agente.correoAgente], "Envio de consentimiento", "", "", "ConsentimientoFirmado.pdf", pdfResponse[0]);
                if (!correoResponse) {
                    response.message = "No se pudo enviar el correo!!!";
                    return response;
                }
                var result = yield (0, consentimientosRepository_1.GuardarConsentimiento)(pdfResponse[0], nombreTitular, telefonoTitular, correoTitular, fechaNacimiento, consentimientoId, pdfResponse[1]);
                if (result) {
                    response.data = true;
                    response.isSucces = true;
                    response.message = "PDF Almacenado!!!";
                }
                return response;
            }
            catch (e) {
                if (e instanceof Error) {
                    response.message = e.message;
                }
                else {
                    response.message = "Error desconocido";
                }
                return response;
            }
        });
    }
    GenerarStatements(base64Image, nombreTitular, telefonoTitular, correoTitular, fechaNacimiento, agente, idioma) {
        return __awaiter(this, void 0, void 0, function* () {
            let response = {
                data: false,
                isSucces: false,
                message: ""
            };
            try {
                var consentimientoId = (0, uuid_1.v4)();
                var pdfResponse;
                console.log(idioma);
                console.log(Idioma_1.Idioma.Español === 'es');
                console.log(Idioma_1.Idioma.Inglés === 'en');
                if (idioma === Idioma_1.Idioma.Español) {
                    pdfResponse = yield (0, CrearConsentimiento_1.generateStatementsPdf)(base64Image, nombreTitular, telefonoTitular, correoTitular, fechaNacimiento, agente.nombreAgente, agente.numeroProductor, agente.telefonoAgente, agente.correoAgente, consentimientoId);
                }
                else if (idioma === Idioma_1.Idioma.Inglés) {
                    pdfResponse = yield (0, CrearConsentimiento_1.generateStatementsPdf)(base64Image, nombreTitular, telefonoTitular, correoTitular, fechaNacimiento, agente.nombreAgente, agente.numeroProductor, agente.telefonoAgente, agente.correoAgente, consentimientoId);
                }
                if (pdfResponse == undefined) {
                    return response;
                }
                //var correoResponse = await enviarCorreo([correoTitular, agente.correoAgente], "Envio de consentimiento", "", "", "ConsentimientoFirmado.pdf", pdfResponse[0])
                //if (!correoResponse) {
                //    response.message = "No se pudo enviar el correo!!!"
                //    return response
                //}
                /*
                var result = await GuardarConsentimiento(pdfResponse[0], nombreTitular, telefonoTitular, correoTitular, fechaNacimiento, consentimientoId, pdfResponse[1])
                if (result) {
                    response.data = true;
                    response.isSucces = true;
                    response.message = "PDF Almacenado!!!";
                }*/
                //TODO: QUITAR ESTO Y QUITAR COMENTARIOS DE ARRIBA
                response.data = true;
                response.isSucces = true;
                response.message = "PDF Almacenado!!!";
                return response;
            }
            catch (e) {
                console.log(e);
                if (e instanceof Error) {
                    response.message = e.message;
                }
                else {
                    response.message = "Error desconocido";
                }
                return response;
            }
        });
    }
    EnviarFormularioConsentimiento(nombreAgente, numeroProductor, telefonoAgente, correoAgente, destinatario) {
        return __awaiter(this, void 0, void 0, function* () {
            let response = {
                data: false,
                isSucces: false,
                message: ""
            };
            try {
                var payload = {
                    correoAgente: correoAgente,
                    nombreAgente: nombreAgente,
                    numeroProductor: numeroProductor,
                    telefonoAgente: telefonoAgente
                };
                var token = (0, token_1.generateToken)(payload);
                response.data = yield (0, email_1.enviarFormularioCorreo)(destinatario, "Formulario de consentimiento", token);
                if (response.data) {
                    response.isSucces = true;
                    response.message = "Correo enviado correctamente!!!";
                }
            }
            catch (e) {
                response.message = `${e}`;
            }
            return response;
        });
    }
}
exports.default = ConsentimientosService;
