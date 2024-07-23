import { generatePdf } from "../utils/CrearConsentimiento";

export default class ConsentimientosService {
    async GenerarConsentimiento() {
        try {
            await generatePdf();
            return true
        } catch (e) {
            console.log('Error al generar y modificar el PDF:', e)
            return false
        }
    }
}