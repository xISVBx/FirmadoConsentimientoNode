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
            const { base64Image } = req.body
            if(!base64Image){
                res.status(400).send('El parámetro image es requerido')
                return
            }
            var response = await this.service.GenerarConsentimiento(base64Image);
            if(response){
                res.status(200).send(true)
            }else{
                res.status(500).send(false)
            }
        });
    }
}

export default new ConsentimientoRouter();