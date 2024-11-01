import { generateToken, Agente } from "../utils/token";
import { ResponseGeneric } from "../common/response";
import { enviarCorreo, enviarFormularioAfirmacionesCorreo, enviarFormularioCorreo } from "../infraestructure/email";
import { GuardarConsentimiento, GuardarStatement } from "../repository/consentimientosRepository";
import { generateEnglishPdf, generatePdf, generateStatementsEnglishPdf, generateStatementsPdf } from "../utils/CrearConsentimiento";
import { v4 as uuidv4 } from 'uuid';
import { Idioma } from '../domain/Idioma';
import { IStatement } from "domain/IStatement";


export default class ConsentimientosService {

    async GenerarConsentimiento(base64Image: string, nombreTitular: string, telefonoTitular: string,
        correoTitular: string, fechaNacimiento: string, agente: Agente, idioma: string): Promise<ResponseGeneric<boolean>> {

        let response: ResponseGeneric<boolean> = {
            data: false,
            isSucces: false,
            message: ""
        }
        try {
            var consentimientoId = uuidv4()

            var pdfResponse;
            console.log(idioma)
            console.log(Idioma.Español === 'es')
            console.log(Idioma.Inglés === 'en')

            if (idioma === Idioma.Español) {
                pdfResponse = await generatePdf(base64Image, nombreTitular, telefonoTitular, correoTitular,
                    fechaNacimiento, agente.nombreAgente, agente.numeroProductor, agente.telefonoAgente, agente.correoAgente,
                    consentimientoId);

            } else if (idioma === Idioma.Inglés) {
                pdfResponse = await generateEnglishPdf(base64Image, nombreTitular, telefonoTitular, correoTitular,
                    fechaNacimiento, agente.nombreAgente, agente.numeroProductor, agente.telefonoAgente, agente.correoAgente,
                    consentimientoId);
            }
            if(pdfResponse == undefined){
                return response;
            }

            var correoResponse = await enviarCorreo([correoTitular, 'consent@jecopagroup.com'], "Envio de consentimiento", "", "", "ConsentimientoFirmado.pdf", pdfResponse[0])

            if (!correoResponse) {
                response.message = "No se pudo enviar el correo!!!"
                return response
            }

            var result = await GuardarConsentimiento(pdfResponse[0], nombreTitular, telefonoTitular, correoTitular, fechaNacimiento, consentimientoId, pdfResponse[1])
            if (result) {
                response.data = true;
                response.isSucces = true;
                response.message = "PDF Almacenado!!!";
            }
            return response;
        } catch (e) {
            if (e instanceof Error) {
                response.message = e.message;
            } else {
                response.message = "Error desconocido";
            }
            return response
        }
    }

    async GenerarStatements(base64Image: string, idioma: Idioma, correoTitular: string, agente: Agente, statement: IStatement): Promise<ResponseGeneric<boolean>> {

        let response: ResponseGeneric<boolean> = {
            data: false,
            isSucces: false,
            message: ""
        }
        try {
            var pdfResponse;
            if (idioma === Idioma.Español) {
                pdfResponse = await generateStatementsPdf(base64Image, agente.nombreAgente, statement);

            } else if (idioma === Idioma.Inglés) {
                pdfResponse = await generateStatementsEnglishPdf(base64Image, agente.nombreAgente, statement);
            }
            if(pdfResponse == undefined){
                return response;
            }

            //var correoResponse = await enviarCorreo([correoTitular, agente.correoAgente], "Envio de consentimiento", "", "", "ConsentimientoFirmado.pdf", pdfResponse[0])
            var correoResponse = await enviarCorreo([correoTitular, 'consent@jecopagroup.com'], "Envio de consentimiento", "", "", "ConsentimientoFirmado.pdf", pdfResponse[0])

            //if (!correoResponse) {
            //    response.message = "No se pudo enviar el correo!!!"
            //    return response
            //}
            
            var result = await GuardarStatement(pdfResponse[0], pdfResponse[1], statement);

            if (result) {
                response.data = true;
                response.isSucces = true;
                response.message = "PDF Almacenado!!!";
            }

           //TODO: QUITAR ESTO Y QUITAR COMENTARIOS DE ARRIBA
                response.data = true;
                response.isSucces = true;
                response.message = "PDF Almacenado!!!";
            return response;
        } catch (e) {
            console.log(e);
            if (e instanceof Error) {
                response.message = e.message;
            } else {
                response.message = "Error desconocido";
            }
            return response
        }
    }

    async EnviarFormularioConsentimiento(nombreAgente: string, numeroProductor: string,
        telefonoAgente: string, correoAgente: string, destinatario: string): Promise<ResponseGeneric<boolean>> {
        let response: ResponseGeneric<boolean> = {
            data: false,
            isSucces: false,
            message: ""
        }
        try {
            var payload: Agente = {
                correoAgente: correoAgente,
                nombreAgente: nombreAgente,
                numeroProductor: numeroProductor,
                telefonoAgente: telefonoAgente
            }
            var token = generateToken(payload)
            response.data = await enviarFormularioCorreo(destinatario, "Formulario de consentimiento", token)
            if (response.data) {
                response.isSucces = true
                response.message = "Correo enviado correctamente!!!"
            }
        } catch (e) {
            response.message = `${e}`
        }
        return response
    }

    async EnviarFormularioAfirmaciones(nombreAgente: string, numeroProductor: string,
        telefonoAgente: string, correoAgente: string, destinatario: string): Promise<ResponseGeneric<boolean>> {
        let response: ResponseGeneric<boolean> = {
            data: false,
            isSucces: false,
            message: ""
        }
        try {
            var payload: Agente = {
                correoAgente: correoAgente,
                nombreAgente: nombreAgente,
                numeroProductor: numeroProductor,
                telefonoAgente: telefonoAgente
            }
            var token = generateToken(payload)
            response.data = await enviarFormularioAfirmacionesCorreo(destinatario, "Formulario de consentimiento", token)
            if (response.data) {
                response.isSucces = true
                response.message = "Correo enviado correctamente!!!"
            }
        } catch (e) {
            response.message = `${e}`
        }
        return response
    }
}
