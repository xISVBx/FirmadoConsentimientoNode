import { Router } from "express";
import ConsentimientosService from "../../application/consentimientosService";
import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../../common/utils/token";
import { v4 as uuidv4 } from 'uuid';
import { CustomError } from "../../common/errors/CustomError";

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
            try {
                const { base64Image, nombreTitular, telefonoTitular, correoTitular, fechaNacimiento, token, idioma } = req.body
                if (!base64Image) {
                    throw CustomError.BadRequest('Se debe firmar el formulario requerido!!!');
                }
                if (!token) {
                    console.log(token)
                    throw CustomError.BadRequest('No se envio el token!!!');
                }
                var decodedToken = verifyToken(token)

                if (decodedToken == null) {
                    throw CustomError.BadRequest('Token no valido!!!');
                }
                var response = await this.service.GenerarConsentimiento(base64Image, nombreTitular, telefonoTitular, correoTitular, fechaNacimiento, decodedToken!, idioma);
                if (response) {
                    res.status(200).send(response)
                    return
                } else {
                    throw CustomError.BadRequest('Error');
                }
            } catch (error) {
                next(error);
            }
        });

        this.router.post('/consentimiento/correo', async (req: Request, res: Response, next: NextFunction) => {
            try {
                const { nombreAgente, numeroProductor, telefonoAgente, correoAgente, destinatario } = req.body
                var response = await this.service.EnviarFormularioConsentimiento(nombreAgente, numeroProductor, telefonoAgente, correoAgente, destinatario);
                if (response) {
                    res.status(200).send(response)
                    return;
                } else {
                    throw CustomError.BadRequest(response);
                }
            } catch (err) {
                next(err);
            }
        })

        this.router.post('/statements', async (req: Request, res: Response, next: NextFunction) => {
            try {
                const { base64Image, plan, codigoPostal, correoTitular, compania, ingresoAnual, nombreConsumidor, token, idioma } = req.body
                if (!base64Image) {
                    throw CustomError.BadRequest('Se debe firmar el formulario requerido!!!');
                }
                if (!token) {
                    console.log(token)
                    throw CustomError.BadRequest('No se envio el token!!!');
                }
                var decodedToken = verifyToken(token)
                if (decodedToken == null) {
                    throw CustomError.BadRequest('Token no valido!!!');
                }

                var response = await this.service.GenerarStatements(base64Image, idioma, correoTitular, decodedToken!, {
                    plan,
                    codigoPostal,
                    compania,
                    idConsentimiento: uuidv4(),
                    ingresoAnual,
                    nombreConsumidor
                });
                if (response) {
                    res.status(200).send(response)
                    return
                } else {
                    throw CustomError.BadRequest('Error');
                }
            } catch (err) {
                next(err)
            }
        });

        this.router.post('/statements/correo', async (req: Request, res: Response, next: NextFunction) => {
            try {
                const { nombreAgente, numeroProductor, telefonoAgente, correoAgente, destinatario } = req.body
                var response = await this.service.EnviarFormularioAfirmaciones(nombreAgente, numeroProductor, telefonoAgente, correoAgente, destinatario);
                if (response) {
                    res.status(200).send(response)
                } else {
                    throw CustomError.BadRequest(response);
                }
            } catch (err) {
                next(err)
            }
        })

    }
}

export default new ConsentimientoRouter();