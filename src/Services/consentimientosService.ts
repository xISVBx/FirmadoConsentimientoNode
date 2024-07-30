import { generateToken, Agente } from "../utils/token";
import { ResponseGeneric } from "../common/response";
import { enviarCorreo, enviarFormularioCorreo } from "../infraestructure/email";
import { GuardarConsentimiento } from "../repository/consentimientosRepository";
import { generatePdf } from "../utils/crearConsentimiento";
import { v4 as uuidv4 } from 'uuid';


export default class ConsentimientosService {

    async GenerarConsentimiento(base64Image: string, nombreTitular: string, telefonoTitular: string,
        correoTitular: string, fechaNacimiento: string, agente: Agente): Promise<ResponseGeneric<boolean>> {

        let response: ResponseGeneric<boolean> = {
            data: false,
            isSucces: false,
            message: ""
        }
        try {
            var consentimientoId = uuidv4()
            var pdfResponse = await generatePdf(base64Image, nombreTitular, telefonoTitular, correoTitular,
                fechaNacimiento, agente.nombreAgente, agente.numeroProductor, agente.telefonoAgente, agente.correoAgente,
                consentimientoId);

            var correoResponse = await enviarCorreo(correoTitular, "Envio de consentimiento", "", "", "ConsentimientoFirmado.pdf", pdfResponse[0])

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
}
