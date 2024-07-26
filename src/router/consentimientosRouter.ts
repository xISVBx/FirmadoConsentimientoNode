import { Router } from "express";
import ConsentimientosService from "../Services/consentimientosService";
import { NextFunction, Request, Response } from "express";

class ConsentimientoRouter {

    router: Router;
    private service: ConsentimientosService;

    constructor() {
        this.service = new ConsentimientosService();
        this.router = Router();
        this.config();
    }

    private config() {
        this.router.post('/consentimiento/pdf', async (req: Request, res: Response, next: NextFunction) => {
            const { base64Image, nombreTitular, telefonoTitular, correoTitular, fechaNacimiento } = req.body
            if(!base64Image){
                res.status(400).send('El parámetro base64Image es requerido')
                return
            }
            var nombreAgente:string = "Carlos";
            var numeroAgente:string = "12365484321"
            var telefonoAgente:string = "32116546"
            var correoAgente:string = "agente@agente.com"
            var response = await this.service.GenerarConsentimiento(base64Image, nombreTitular, telefonoTitular, correoTitular, fechaNacimiento, nombreAgente, numeroAgente, telefonoAgente, correoAgente);
            if(response){
                res.status(200).send(response)
            }else{
                res.status(500).send(response)
            }
        });
    }
}

export default new ConsentimientoRouter();