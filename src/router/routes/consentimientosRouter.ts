import { Router } from "express";
import ConsentimientosService from "../../application/consentimientosService";
import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../../common/utils/token";
import { v4 as uuidv4 } from 'uuid';
import { CustomError } from "../../common/errors/CustomError";
import path from 'path';
import { Readable } from "stream";

import fs from 'fs';
import archiver from 'archiver';

function slugify(s: string) {
  return (s || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')   // quita acentos
    .replace(/[^a-zA-Z0-9._-]+/g, '_')                 // separadores seguros
    .replace(/^_+|_+$/g, '')
    .substring(0, 100);
}

function yyyymmdd(date?: Date | string | null) {
  const d = date ? new Date(date) : new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}${m}${day}`;
}

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

        this.router.get('/consentimientos', async (req: Request, res: Response, next: NextFunction) => {
            try {
                const response = await this.service.ObtenerTodosLosConsentimientos();
                res.status(200).send(response);
            } catch (error) {
                next(error);
            }
        });

        this.router.get('/imagen', async (req: Request, res: Response, next: NextFunction) => {
            try {
                const { path: imagePath } = req.query;

                if (!imagePath || typeof imagePath !== 'string') {
                    throw CustomError.BadRequest("Se debe proporcionar el parámetro 'path'");
                }

                const resolvedPath = path.resolve(imagePath); // Asegura seguridad de la ruta

                res.sendFile(resolvedPath, (err) => {
                    if (err) {
                        next(CustomError.NotFound("No se pudo cargar la imagen"));
                    }
                });
            } catch (err) {
                next(err);
            }
        });


        this.router.get('/consentimientos/descargar-todos', async (req, res, next) => {
            try {
                const items = await this.service.ObtenerTodosLosConsentimientos(); // ResponseGeneric<any[]>
                const data = items.data ?? items; // por si viene envuelto en ResponseGeneric

                res.setHeader('Content-Type', 'application/zip');
                res.setHeader('Content-Disposition', `attachment; filename="consentimientos_${yyyymmdd(new Date())}.zip"`);

                const archive = archiver('zip', { zlib: { level: 9 } });
                archive.on('error', err => next(err));
                archive.pipe(res);

                let added = 0;

                for (const row of data as any[]) {
                    const id = row.consentimiento_id || row.id || 'sinid';

                    // nombre + email: consentimientos usan dc.nombre + dc.correo; statements usan da.nombreConsumidor (no hay correo en tu esquema)
                    const nombre = row.nombre_titular || row.nombreConsumidor || 'sin_nombre';
                    const email = row.correo || 'sinemail';

                    // idioma: si tienes columna c.idioma, úsala; si no, default ES
                    const idioma = (row.idioma || '').toString().toUpperCase() || 'ES';

                    // fecha: usa c.created si está; si no, hoy
                    const fecha = yyyymmdd(row.created || new Date());

                    // filename final
                    const filename = `${slugify(nombre)}_${fecha}_${idioma}_${slugify(email)}_${id}.pdf`;

                    // preferencia: archivo en disco
                    const filePath = row.path_consentimiento as string | undefined;
                    let appended = false;

                    if (filePath && fs.existsSync(filePath)) {
                        archive.file(filePath, { name: filename });
                        appended = true;
                    } else if (row.consentimiento) {
                        // fallback: BLOB desde BD
                        const buffer: Buffer = Buffer.isBuffer(row.consentimiento)
                            ? row.consentimiento
                            : Buffer.from(row.consentimiento);

                        const stream = Readable.from(buffer);
                        archive.append(stream, { name: filename });
                        appended = true;
                    }

                    if (appended) added++;
                }

                // cierra el zip (streaming)
                archive.finalize();

                // (opcional) log de conteo
                archive.on('end', () => {
                    console.log(`ZIP generado: ${added} PDFs`);
                });
            } catch (err) {
                next(err);
            }
        });
    }
}

export default new ConsentimientoRouter();