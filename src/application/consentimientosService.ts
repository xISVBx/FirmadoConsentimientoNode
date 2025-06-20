import { generateToken, ConsentimientoSend, StatementSend } from "../common/utils/token";
import { ResponseGeneric } from "../common/models/response";
import { enviarCorreo, enviarFormularioAfirmacionesCorreo, enviarFormularioCorreo } from "../infraestructure/infraestructure/email";
import { createConsentimiento, getConsentimientoById, GuardarConsentimiento, GuardarStatement } from "../infraestructure/persistence/repository/consentimientosRepository";
import { generateEnglishPdf, generatePdf, generateStatementsEnglishPdf, generateStatementsPdf } from "../common/utils/crearConsentimiento";
import { v4 as uuidv4 } from 'uuid';
import { Idioma } from '../domain/enums/Idioma';
import { IStatement } from "../domain/entities/IStatement";
import { CustomError } from "../common/errors/CustomError";


export default class ConsentimientosService {

    async GenerarConsentimiento(base64Image: string, nombreTitular: string, telefonoTitular: string,
        correoTitular: string, fechaNacimiento: string, agente: ConsentimientoSend, idioma: string, ip: string): Promise<ResponseGeneric<boolean>> {

        try {
            var pdfResponse;

            const createdDate = new Date();

            var consentimiento = await getConsentimientoById(agente.consentimientoId)

            if (consentimiento.estado == 'created') {
                throw CustomError.BadRequest('El consentimiento ya fue firmado');
            }

            if (idioma === Idioma.Español) {
                pdfResponse = await generatePdf(base64Image, nombreTitular, telefonoTitular, correoTitular,
                    fechaNacimiento, agente.nombreAgente, agente.numeroProductor, agente.telefonoAgente, agente.correoAgente,
                    agente.consentimientoId, createdDate, consentimiento, ip);

            } else if (idioma === Idioma.Inglés) {
                pdfResponse = await generateEnglishPdf(base64Image, nombreTitular, telefonoTitular, correoTitular,
                    fechaNacimiento, agente.nombreAgente, agente.numeroProductor, agente.telefonoAgente, agente.correoAgente,
                    agente.consentimientoId, createdDate, consentimiento, ip);
            }
            if (pdfResponse == undefined) {
                throw CustomError.BadRequest('No se pudo general el Pdf correctamente, intente mas tarde');
            }

            var correoResponse = await enviarCorreo([correoTitular, 'consent@jecopagroup.com'], "Envio de consentimiento", "", "", "ConsentimientoFirmado.pdf", pdfResponse[0])

            if (!correoResponse) {
                throw CustomError.InternalServerError("No se pudo enviar el correo!!!");
            }

            var result = await GuardarConsentimiento(pdfResponse[0], nombreTitular, telefonoTitular, correoTitular, fechaNacimiento, agente.consentimientoId, pdfResponse[1], ip, '', '')

            if (!result) {
                throw CustomError.InternalServerError("No se pudo almacenar la informacion correctamente");
            }
        } catch (e) {
            if (e instanceof CustomError) {
                // Si el error es una instancia de CustomError, solo lanzamos el mensaje original
                throw e;
            } else {
                // Si es un error inesperado, lo envolvemos en un error interno del servidor
                throw CustomError.InternalServerError(`Error inesperado: ${e || e}`);
            }
        }
        return ResponseGeneric.Success(true, 'Pdf Almacenado!!!');
    }

    async GenerarStatements(base64Image: string, idioma: Idioma, correoTitular: string, agente: StatementSend, statement: IStatement, ip: string): Promise<ResponseGeneric<boolean>> {

        try {
            var pdfResponse;

            const createdDate = new Date();

            var consentimiento = await getConsentimientoById(agente.consentimientoId)

            if (consentimiento.estado == 'created') {
                throw CustomError.BadRequest('El consentimiento ya fue firmado');
            }

            if (idioma === Idioma.Español) {

                pdfResponse = await generateStatementsPdf(base64Image, agente, statement, correoTitular, createdDate, consentimiento, ip);

            } else if (idioma === Idioma.Inglés) {

                pdfResponse = await generateStatementsEnglishPdf(base64Image, agente, statement, correoTitular, createdDate, consentimiento, ip);
            }
            if (pdfResponse == undefined) {
                throw CustomError.BadRequest('No se pudo general el Pdf correctamente, intente mas tarde');
            }

            var correoResponse = await enviarCorreo([correoTitular, 'consent@jecopagroup.com'], "Envio de consentimiento", "", "", "ConsentimientoFirmado.pdf", pdfResponse[0])

            if (!correoResponse) {
                throw CustomError.BadRequest('No se pudo enviar el correo!!!');
            }

            var result = await GuardarStatement(pdfResponse[0], pdfResponse[1], statement, agente);

            if (!result) {
                throw CustomError.InternalServerError("No se pudo almacenar la informacion correctamente");
            }
        } catch (e) {
            if (e instanceof CustomError) {
                // Si el error es una instancia de CustomError, solo lanzamos el mensaje original
                throw e;
            } else {
                // Si es un error inesperado, lo envolvemos en un error interno del servidor
                throw CustomError.InternalServerError(`Error inesperado: ${e || e}`);
            }
        }
        return ResponseGeneric.Success(true, 'Pdf Almacenado!!!');
    }

    async EnviarFormularioConsentimiento(nombreAgente: string, numeroProductor: string,
        telefonoAgente: string, correoAgente: string, destinatario: string): Promise<ResponseGeneric<boolean>> {
        try {
            var consentimientoId = uuidv4()

            var payload: ConsentimientoSend = {
                correoAgente: correoAgente,
                nombreAgente: nombreAgente,
                numeroProductor: numeroProductor,
                telefonoAgente: telefonoAgente,
                consentimientoId: consentimientoId
            }


            var token = generateToken(payload)

            var creationSuccess = await createConsentimiento(consentimientoId)
            if (!creationSuccess) {
                throw CustomError.BadRequest("No se pudo crear el consentimiento");
            }
            var response = await enviarFormularioCorreo(destinatario, "Formulario de consentimiento", token)

            if (!response) {
                throw CustomError.BadRequest('No se pudo enviar el correo!!!');
            }
        } catch (e) {
            console.log(e)
            throw CustomError.InternalServerError(`${e}`);
        }
        return ResponseGeneric.Success(true, 'Correo enviado correctamente!!!');
    }

    async EnviarFormularioAfirmaciones(nombreAgente: string, codigoPostal: string,
        ingresoAnual: string, compania: string, destinatario: string, plan: string): Promise<ResponseGeneric<boolean>> {
        try {
            var consentimientoId = uuidv4()

            var payload: StatementSend = {
                nombreAgente: nombreAgente,
                codigoPostal: codigoPostal,
                ingresoAnual: ingresoAnual,
                compania: compania,
                plan: plan,
                consentimientoId: consentimientoId
            }
            var token = generateToken(payload);

            var responseCreate = await createConsentimiento(consentimientoId);
            if (!responseCreate) {
                throw CustomError.BadRequest('No se pudo crear el consentimiento!!!');
            }
            
            var response = await enviarFormularioAfirmacionesCorreo(destinatario, "Formulario de Atestamiento", token)

            if (!response) {
                throw CustomError.BadRequest('No se pudo enviar el correo!!!');
            }
        } catch (e) {
            throw CustomError.InternalServerError(`${e}`);

        }
        return ResponseGeneric.Success(true, 'Correo enviado correctamente!!!');
    }

    async GetDocumentooById(id: string) {

    }
}
