import { Router } from "express";
import ConsentimientosService from "../Services/consentimientosService";
import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/token";
import { v4 as uuidv4 } from 'uuid';

class ConsentimientoRouter {

    router: Router;
    private service: ConsentimientosService;

    constructor() {
        this.service = new ConsentimientosService();
        this.router = Router();
        this.config();
    }

    private config() {
        this.router.post('/consentimiento', async (req: Request, res: Response, next: NextFunction) => {
            const { base64Image, nombreTitular, telefonoTitular, correoTitular, fechaNacimiento, token, idioma } = req.body
            if(!base64Image){
                res.status(400).send('Se debe firmar el formulario requerido!!!')
                return
            }
            if(!token){
                console.log(token)
                res.status(400).send('No se envio el token!!!')
                return
            }
            var decodedToken = verifyToken(token)
            
            if(decodedToken == null){
                res.status(400).send('Token no valido!!!')
                return
            }
            console.log(decodedToken)
            var response = await this.service.GenerarConsentimiento(base64Image, nombreTitular, telefonoTitular, correoTitular, fechaNacimiento, decodedToken!, idioma);
            if(response){
                res.status(200).send(response)
                return
            }else{
                res.status(500).send(response)
                return
            }
        });

        this.router.post('/statements', async (req: Request, res: Response, next: NextFunction) => {
            const { base64Image, plan, codigoPostal, correoTitular, compania, ingresoAnual, nombreConsumidor, token, idioma } = req.body
            if(!base64Image){
                res.status(400).send('Se debe firmar el formulario requerido!!!')
                return
            }
            if(!token){
                console.log(token)
                res.status(400).send('No se envio el token!!!')
                return
            }
            var decodedToken = verifyToken(token)
            console.log(decodedToken)
            if(decodedToken == null){
                res.status(400).send('Token no valido!!!')
                return
            }
            
            var response = await this.service.GenerarStatements(base64Image, idioma, correoTitular, decodedToken!, {
                plan,
                codigoPostal,
                compania,
                idConsentimiento: uuidv4(),
                ingresoAnual,
                nombreConsumidor
            });
            if(response){
                res.status(200).send(response)
                return
            }else{
                res.status(500).send(response)
                return
            }
        });


        this.router.post('/consentimiento/correo', async (req:Request, res: Response, next: NextFunction) =>{
            const { nombreAgente, numeroProductor, telefonoAgente, correoAgente, destinatario } = req.body
            var response = await this.service.EnviarFormularioConsentimiento(nombreAgente, numeroProductor, telefonoAgente, correoAgente, destinatario);
            if(response){
                res.status(200).send(response)
            }else{
                res.status(500).send(response)
            }
        })
    }
}

export default new ConsentimientoRouter();