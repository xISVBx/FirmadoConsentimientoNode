import { ResponseGeneric } from "../common/response";
import { enviarCorreo } from "../infraestructure/email";
import { GuardarConsentimiento } from "../repository/consentimientosRepository";
import { generatePdf } from "../utils/CrearConsentimiento";
import { v4 as uuidv4 } from 'uuid';


export default class ConsentimientosService {
    async GenerarConsentimiento(base64Image: string, nombreTitular: string, telefonoTitular: string,
        correoTitular: string, fechaNacimiento: string, nombreAgente: string, numeroAgente: string,
        telefonoAgente: string, correoAgente: string): Promise<ResponseGeneric<boolean>> {

        let response: ResponseGeneric<boolean> = {
            data: false,
            isSucces: false,
            message: ""
        }
        try {
            var consentimientoId = uuidv4()
            var pdfResponse = await generatePdf(base64Image, nombreTitular, telefonoTitular, correoTitular,
                fechaNacimiento, nombreAgente, numeroAgente, telefonoAgente, correoAgente,
                consentimientoId);

            var correoResponse = await enviarCorreo(correoTitular, "Envio de consentimiento", "", "", "ConsentimientoFirmado.pdf", pdfResponse[0])

            if(!correoResponse){
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
}