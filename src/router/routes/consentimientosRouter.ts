import { Router } from "express";
import ConsentimientosService from "../../application/consentimientosService";
import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../../common/utils/token";
import { v4 as uuidv4 } from 'uuid';
import { CustomError } from "../../common/errors/CustomError";
import path from 'path';

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
                    throw CustomError.BadRequest('No se envio el token!!!');
                }
                var decodedToken = verifyToken(token)

                if (decodedToken == null) {
                    throw CustomError.BadRequest('Token no valido!!!');
                }

                // Obtener las coordenadas desde los headers
                const latitude = req.headers['x-latitude'];
                const longitude = req.headers['x-longitude'];

                // Obtener el valor de 'x-forwarded-for'
                const xForwardedFor = req.headers['x-forwarded-for'];

                // Verificar si 'x-forwarded-for' es una cadena o un array
                const ipCliente = Array.isArray(xForwardedFor)
                    ? xForwardedFor[0] // Si es un array, tomamos la primera IP
                    : (xForwardedFor ? xForwardedFor.split(',')[0] : req.socket.remoteAddress);

                var response = await this.service.GenerarConsentimiento(base64Image, nombreTitular, telefonoTitular, correoTitular, fechaNacimiento, decodedToken!, idioma, ipCliente ?? '');
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
                console.log('Entro')
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
                const { base64Image, correoTitular, nombreConsumidor, token, idioma } = req.body
                if (!base64Image) {
                    throw CustomError.BadRequest('Se debe firmar el formulario requerido!!!');
                }
                if (!token) {
                    throw CustomError.BadRequest('No se envio el token!!!');
                }
                var decodedToken = verifyToken(token)
                if (decodedToken == null) {
                    throw CustomError.BadRequest('Token no valido!!!');
                }

                // Obtener el valor de 'x-forwarded-for'
                const xForwardedFor = req.headers['x-forwarded-for'];

                // Verificar si 'x-forwarded-for' es una cadena o un array
                const ipCliente = Array.isArray(xForwardedFor)
                    ? xForwardedFor[0] // Si es un array, tomamos la primera IP
                    : (xForwardedFor ? xForwardedFor.split(',')[0] : req.socket.remoteAddress);

                var response = await this.service.GenerarStatements(base64Image, idioma, correoTitular, decodedToken!, {
                    idConsentimiento: uuidv4(),
                    nombreConsumidor
                }, ipCliente ?? '');
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
                const { nombreAgente, codigoPostal, ingresoAnual, compania, destinatario, plan } = req.body
                var response = await this.service.EnviarFormularioAfirmaciones(nombreAgente, codigoPostal, ingresoAnual, compania, destinatario, plan);
                if (response) {
                    res.status(200).send(response)
                } else {
                    throw CustomError.BadRequest(response);
                }
            } catch (err) {
                next(err)
            }
        })

        this.router.get('/documento_firmado/:id', async (req: Request, res: Response, next: NextFunction) => {
            try {
                const { id } = req.params;

                const filePath = path.join(__dirname, '../../../', 'consentimientos', `${id}`, `formulario_consentimiento.pdf`);
                // Establecer el nombre del archivo a mostrar cuando se descargue
                const downloadName = 'documento.pdf';

                // Configurar el encabezado para indicar que se va a hacer una descarga
                res.setHeader('Content-Disposition', `attachment; filename="${downloadName}"`);

                // Enviar el archivo
                res.sendFile(filePath, (err) => {
                    if (err) {
                        next(err);  // Pasar el error al siguiente manejador de errores
                    }
                });
            } catch (err) {
                next(err)
            }
        })
    }
}

export default new ConsentimientoRouter();