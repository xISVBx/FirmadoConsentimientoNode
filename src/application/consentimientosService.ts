import { generateToken, Agente } from "../common/utils/token";
import { ResponseGeneric } from "../common/models/response";
import { enviarCorreo, enviarFormularioAfirmacionesCorreo, enviarFormularioCorreo } from "../infraestructure/infraestructure/email";
import { GuardarConsentimiento, GuardarStatement } from "../infraestructure/persistence/repository/consentimientosRepository";
import { generateEnglishPdf, generatePdf, generateStatementsEnglishPdf, generateStatementsPdf } from "../common/utils/crearConsentimiento";
import { v4 as uuidv4 } from 'uuid';
import { Idioma } from '../domain/enums/Idioma';
import { IStatement } from "../domain/entities/IStatement";
import { CustomError } from "../common/errors/CustomError";


export default class ConsentimientosService {

    async GenerarConsentimiento(base64Image: string, nombreTitular: string, telefonoTitular: string,
        correoTitular: string, fechaNacimiento: string, agente: Agente, idioma: string): Promise<ResponseGeneric<boolean>> {

        try {
            var consentimientoId = uuidv4()

            var pdfResponse;

            if (idioma === Idioma.Español) {
                pdfResponse = await generatePdf(base64Image, nombreTitular, telefonoTitular, correoTitular,
                    fechaNacimiento, agente.nombreAgente, agente.numeroProductor, agente.telefonoAgente, agente.correoAgente,
                    consentimientoId);

            } else if (idioma === Idioma.Inglés) {
                pdfResponse = await generateEnglishPdf(base64Image, nombreTitular, telefonoTitular, correoTitular,
                    fechaNacimiento, agente.nombreAgente, agente.numeroProductor, agente.telefonoAgente, agente.correoAgente,
                    consentimientoId);
            }
            if (pdfResponse == undefined) {
                throw CustomError.BadRequest('No se pudo general el Pdf correctamente, intente mas tarde');
            }

            var correoResponse = await enviarCorreo([correoTitular, 'consent@jecopagroup.com'], "Envio de consentimiento", "", "", "ConsentimientoFirmado.pdf", pdfResponse[0])

            if (!correoResponse) {
                throw CustomError.InternalServerError("No se pudo enviar el correo!!!");
            }

            var result = await GuardarConsentimiento(pdfResponse[0], nombreTitular, telefonoTitular, correoTitular, fechaNacimiento, consentimientoId, pdfResponse[1])

            if (!result) {
                throw CustomError.InternalServerError("No se pudo almacenar la informacion correctamente");
            }
        } catch (e) {
            throw CustomError.InternalServerError(`${e}`);
        }
        return ResponseGeneric.Success(true, 'Pdf Almacenado!!!');
    }

    async GenerarStatements(base64Image: string, idioma: Idioma, correoTitular: string, agente: Agente, statement: IStatement): Promise<ResponseGeneric<boolean>> {

        try {
            var consentimientoId = uuidv4()
            var pdfResponse;

            if (idioma === Idioma.Español) {
                pdfResponse = await generateStatementsPdf(base64Image, agente.nombreAgente, statement, consentimientoId);

            } else if (idioma === Idioma.Inglés) {
                pdfResponse = await generateStatementsEnglishPdf(base64Image, agente.nombreAgente, statement, consentimientoId);
            }
            if (pdfResponse == undefined) {
                throw CustomError.BadRequest('No se pudo general el Pdf correctamente, intente mas tarde');
            }

            var correoResponse = await enviarCorreo([correoTitular, 'consent@jecopagroup.com'], "Envio de consentimiento", "", "", "ConsentimientoFirmado.pdf", pdfResponse[0])

            if (!correoResponse) {
                throw CustomError.BadRequest('No se pudo enviar el correo!!!');
            }

            var result = await GuardarStatement(pdfResponse[0], pdfResponse[1], statement);

            if (!result) {
                throw CustomError.InternalServerError("No se pudo almacenar la informacion correctamente");
            }
        } catch (e) {
            throw CustomError.InternalServerError(`${e}`);
        }
        return ResponseGeneric.Success(true, 'Pdf Almacenado!!!');
    }

    async EnviarFormularioConsentimiento(nombreAgente: string, numeroProductor: string,
        telefonoAgente: string, correoAgente: string, destinatario: string): Promise<ResponseGeneric<boolean>> {
        try {
            var payload: Agente = {
                correoAgente: correoAgente,
                nombreAgente: nombreAgente,
                numeroProductor: numeroProductor,
                telefonoAgente: telefonoAgente
            }
            var token = generateToken(payload)
            var response = await enviarFormularioCorreo(destinatario, "Formulario de consentimiento", token)

            if(!response){
                throw CustomError.BadRequest('No se pudo enviar el correo!!!');
            }
        } catch (e) {
            throw CustomError.InternalServerError(`${e}`);
        }
        return ResponseGeneric.Success(true, 'Correo enviado correctamente!!!');
    }

    async EnviarFormularioAfirmaciones(nombreAgente: string, numeroProductor: string,
        telefonoAgente: string, correoAgente: string, destinatario: string): Promise<ResponseGeneric<boolean>> {
        try {
            var payload: Agente = {
                correoAgente: correoAgente,
                nombreAgente: nombreAgente,
                numeroProductor: numeroProductor,
                telefonoAgente: telefonoAgente
            }
            var token = generateToken(payload)
            var response = await enviarFormularioAfirmacionesCorreo(destinatario, "Formulario de consentimiento", token)

            if(!response){
                throw CustomError.BadRequest('No se pudo enviar el correo!!!');
            }
        } catch (e) {
            throw CustomError.InternalServerError(`${e}`);

        }
        return ResponseGeneric.Success(true, 'Correo enviado correctamente!!!');
    }
}
