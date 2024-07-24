import { generatePdf } from "../utils/CrearConsentimiento";

export default class ConsentimientosService {
    async GenerarConsentimiento(base64Image:String) {
        try {
            await generatePdf(base64Image);
            return true
        } catch (e) {
            console.log('Error al generar y modificar el PDF:', e)
            return false
        }
    }
}