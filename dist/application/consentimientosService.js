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
const token_1 = require("../common/utils/token");
const response_1 = require("../common/models/response");
const email_1 = require("../infraestructure/infraestructure/email");
const consentimientosRepository_1 = require("../infraestructure/persistence/repository/consentimientosRepository");
const crearConsentimiento_1 = require("../common/utils/crearConsentimiento");
const uuid_1 = require("uuid");
const Idioma_1 = require("../domain/enums/Idioma");
const CustomError_1 = require("../common/errors/CustomError");
class ConsentimientosService {
    GenerarConsentimiento(base64Image, nombreTitular, telefonoTitular, correoTitular, fechaNacimiento, agente, idioma) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                var consentimientoId = (0, uuid_1.v4)();
                var pdfResponse;
                if (idioma === Idioma_1.Idioma.Español) {
                    pdfResponse = yield (0, crearConsentimiento_1.generatePdf)(base64Image, nombreTitular, telefonoTitular, correoTitular, fechaNacimiento, agente.nombreAgente, agente.numeroProductor, agente.telefonoAgente, agente.correoAgente, consentimientoId);
                }
                else if (idioma === Idioma_1.Idioma.Inglés) {
                    pdfResponse = yield (0, crearConsentimiento_1.generateEnglishPdf)(base64Image, nombreTitular, telefonoTitular, correoTitular, fechaNacimiento, agente.nombreAgente, agente.numeroProductor, agente.telefonoAgente, agente.correoAgente, consentimientoId);
                }
                if (pdfResponse == undefined) {
                    throw CustomError_1.CustomError.BadRequest('No se pudo general el Pdf correctamente, intente mas tarde');
                }
                var correoResponse = yield (0, email_1.enviarCorreo)([correoTitular, 'consent@jecopagroup.com'], "Envio de consentimiento", "", "", "ConsentimientoFirmado.pdf", pdfResponse[0]);
                if (!correoResponse) {
                    throw CustomError_1.CustomError.InternalServerError("No se pudo enviar el correo!!!");
                }
                var result = yield (0, consentimientosRepository_1.GuardarConsentimiento)(pdfResponse[0], nombreTitular, telefonoTitular, correoTitular, fechaNacimiento, consentimientoId, pdfResponse[1]);
                if (!result) {
                    throw CustomError_1.CustomError.InternalServerError("No se pudo almacenar la informacion correctamente");
                }
            }
            catch (e) {
                throw CustomError_1.CustomError.InternalServerError(`${e}`);
            }
            return response_1.ResponseGeneric.Success(true, 'Pdf Almacenado!!!');
        });
    }
    GenerarStatements(base64Image, idioma, correoTitular, agente, statement) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                var consentimientoId = (0, uuid_1.v4)();
                var pdfResponse;
                if (idioma === Idioma_1.Idioma.Español) {
                    pdfResponse = yield (0, crearConsentimiento_1.generateStatementsPdf)(base64Image, agente.nombreAgente, statement, consentimientoId);
                }
                else if (idioma === Idioma_1.Idioma.Inglés) {
                    pdfResponse = yield (0, crearConsentimiento_1.generateStatementsEnglishPdf)(base64Image, agente.nombreAgente, statement, consentimientoId);
                }
                if (pdfResponse == undefined) {
                    throw CustomError_1.CustomError.BadRequest('No se pudo general el Pdf correctamente, intente mas tarde');
                }
                var correoResponse = yield (0, email_1.enviarCorreo)([correoTitular, 'consent@jecopagroup.com'], "Envio de consentimiento", "", "", "ConsentimientoFirmado.pdf", pdfResponse[0]);
                if (!correoResponse) {
                    throw CustomError_1.CustomError.BadRequest('No se pudo enviar el correo!!!');
                }
                var result = yield (0, consentimientosRepository_1.GuardarStatement)(pdfResponse[0], pdfResponse[1], statement);
                if (!result) {
                    throw CustomError_1.CustomError.InternalServerError("No se pudo almacenar la informacion correctamente");
                }
            }
            catch (e) {
                console.log('si entro aca eres un crqack');
                throw CustomError_1.CustomError.InternalServerError(`${e}`);
            }
            return response_1.ResponseGeneric.Success(true, 'Pdf Almacenado!!!');
        });
    }
    EnviarFormularioConsentimiento(nombreAgente, numeroProductor, telefonoAgente, correoAgente, destinatario) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                var payload = {
                    correoAgente: correoAgente,
                    nombreAgente: nombreAgente,
                    numeroProductor: numeroProductor,
                    telefonoAgente: telefonoAgente
                };
                var token = (0, token_1.generateToken)(payload);
                var response = yield (0, email_1.enviarFormularioCorreo)(destinatario, "Formulario de consentimiento", token);
                if (!response) {
                    throw CustomError_1.CustomError.BadRequest('No se pudo enviar el correo!!!');
                }
            }
            catch (e) {
                throw CustomError_1.CustomError.InternalServerError(`${e}`);
            }
            return response_1.ResponseGeneric.Success(true, 'Correo enviado correctamente!!!');
        });
    }
    EnviarFormularioAfirmaciones(nombreAgente, numeroProductor, telefonoAgente, correoAgente, destinatario) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                var payload = {
                    correoAgente: correoAgente,
                    nombreAgente: nombreAgente,
                    numeroProductor: numeroProductor,
                    telefonoAgente: telefonoAgente
                };
                var token = (0, token_1.generateToken)(payload);
                var response = yield (0, email_1.enviarFormularioAfirmacionesCorreo)(destinatario, "Formulario de consentimiento", token);
                if (!response) {
                    throw CustomError_1.CustomError.BadRequest('No se pudo enviar el correo!!!');
                }
            }
            catch (e) {
                throw CustomError_1.CustomError.InternalServerError(`${e}`);
            }
            return response_1.ResponseGeneric.Success(true, 'Correo enviado correctamente!!!');
        });
    }
}
exports.default = ConsentimientosService;
