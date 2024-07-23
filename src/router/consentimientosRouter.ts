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
        this.router.get('/consentimiento/pdf', async (req: Request, res: Response, next: NextFunction) => {
            var response = await this.service.GenerarConsentimiento();
            if(response){
                res.status(200).send(true)
            }else{
                res.status(500).send(false)
            }
        });
    }
}

export default new ConsentimientoRouter();