"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const consentimientosService_1 = __importDefault(require("../../application/consentimientosService"));
const token_1 = require("../../common/utils/token");
const uuid_1 = require("uuid");
const CustomError_1 = require("../../common/errors/CustomError");
const path_1 = __importDefault(require("path"));
const stream_1 = require("stream");
const fs_1 = __importDefault(require("fs"));
const archiver_1 = __importDefault(require("archiver"));
function slugify(s) {
    return (s || '')
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // quita acentos
        .replace(/[^a-zA-Z0-9._-]+/g, '_') // separadores seguros
        .replace(/^_+|_+$/g, '')
        .substring(0, 100);
}
function yyyymmdd(date) {
    const d = date ? new Date(date) : new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}${m}${day}`;
}
class ConsentimientoRouter {
    constructor() {
        this.service = new consentimientosService_1.default();
        this.router = (0, express_1.Router)();
        this.config();
    }
    config() {
        /**
 * @openapi
 * /api/consentimiento:
 *   post:
 *     summary: Genera y almacena un consentimiento firmado (PDF)
 *     tags: [Consentimientos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [base64Image, token, idioma, nombreTitular, telefonoTitular, correoTitular]
 *             properties:
 *               base64Image: { type: string, description: "Firma en base64 (PNG/JPG en base64)" }
 *               nombreTitular: { type: string }
 *               telefonoTitular: { type: string }
 *               correoTitular: { type: string, format: email }
 *               fechaNacimiento: { type: string, format: date, nullable: true }
 *               token: { type: string, description: "Token JWT generado con datos del agente (ConsentimientoSend)" }
 *               idioma: { $ref: "#/components/schemas/Idioma" }
 *     responses:
 *       200:
 *         description: PDF almacenado y correo enviado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ResponseGeneric"
 *       400: { description: Error de validación o token inválido }
 *       500: { description: Error interno }
 */
        this.router.post('/consentimiento', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { base64Image, nombreTitular, telefonoTitular, correoTitular, fechaNacimiento, token, idioma } = req.body;
                if (!base64Image) {
                    throw CustomError_1.CustomError.BadRequest('Se debe firmar el formulario requerido!!!');
                }
                if (!token) {
                    throw CustomError_1.CustomError.BadRequest('No se envio el token!!!');
                }
                var decodedToken = (0, token_1.verifyToken)(token);
                if (decodedToken == null) {
                    throw CustomError_1.CustomError.BadRequest('Token no valido!!!');
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
                var response = yield this.service.GenerarConsentimiento(base64Image, nombreTitular, telefonoTitular, correoTitular, fechaNacimiento, decodedToken, idioma, ipCliente !== null && ipCliente !== void 0 ? ipCliente : '');
                if (response) {
                    res.status(200).send(response);
                    return;
                }
                else {
                    throw CustomError_1.CustomError.BadRequest('Error');
                }
            }
            catch (error) {
                next(error);
            }
        }));
        /**
 * @openapi
 * /api/consentimiento/correo:
 *   post:
 *     summary: Envía el formulario de consentimiento por correo al destinatario
 *     tags: [Consentimientos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombreAgente, numeroProductor, telefonoAgente, correoAgente, destinatario]
 *             properties:
 *               nombreAgente: { type: string }
 *               numeroProductor: { type: string }
 *               telefonoAgente: { type: string }
 *               correoAgente: { type: string, format: email }
 *               destinatario: { type: string, format: email }
 *     responses:
 *       200:
 *         description: Correo enviado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ResponseGeneric"
 *       400: { description: No se pudo crear o enviar }
 *       500: { description: Error interno }
 */
        this.router.post('/consentimiento/correo', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('Entro');
                const { nombreAgente, numeroProductor, telefonoAgente, correoAgente, destinatario } = req.body;
                var response = yield this.service.EnviarFormularioConsentimiento(nombreAgente, numeroProductor, telefonoAgente, correoAgente, destinatario);
                if (response) {
                    res.status(200).send(response);
                    return;
                }
                else {
                    throw CustomError_1.CustomError.BadRequest(response);
                }
            }
            catch (err) {
                next(err);
            }
        }));
        /**
 * @openapi
 * /api/statements:
 *   post:
 *     summary: Genera y almacena un atestamiento (Statements) firmado (PDF)
 *     tags: [Atestamientos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [base64Image, token, idioma, correoTitular, nombreConsumidor]
 *             properties:
 *               base64Image: { type: string, description: "Firma en base64" }
 *               correoTitular: { type: string, format: email }
 *               nombreConsumidor: { type: string }
 *               token: { type: string, description: "Token JWT generado con StatementSend del agente" }
 *               idioma: { $ref: "#/components/schemas/Idioma" }
 *     responses:
 *       200:
 *         description: PDF almacenado y correo enviado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ResponseGeneric"
 *       400: { description: Error de validación o token inválido }
 *       500: { description: Error interno }
 */
        this.router.post('/statements', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { base64Image, correoTitular, nombreConsumidor, token, idioma } = req.body;
                if (!base64Image) {
                    throw CustomError_1.CustomError.BadRequest('Se debe firmar el formulario requerido!!!');
                }
                if (!token) {
                    throw CustomError_1.CustomError.BadRequest('No se envio el token!!!');
                }
                var decodedToken = (0, token_1.verifyToken)(token);
                if (decodedToken == null) {
                    throw CustomError_1.CustomError.BadRequest('Token no valido!!!');
                }
                // Obtener el valor de 'x-forwarded-for'
                const xForwardedFor = req.headers['x-forwarded-for'];
                // Verificar si 'x-forwarded-for' es una cadena o un array
                const ipCliente = Array.isArray(xForwardedFor)
                    ? xForwardedFor[0] // Si es un array, tomamos la primera IP
                    : (xForwardedFor ? xForwardedFor.split(',')[0] : req.socket.remoteAddress);
                var response = yield this.service.GenerarStatements(base64Image, idioma, correoTitular, decodedToken, {
                    idConsentimiento: (0, uuid_1.v4)(),
                    nombreConsumidor
                }, ipCliente !== null && ipCliente !== void 0 ? ipCliente : '');
                if (response) {
                    res.status(200).send(response);
                    return;
                }
                else {
                    throw CustomError_1.CustomError.BadRequest('Error');
                }
            }
            catch (err) {
                next(err);
            }
        }));
        /**
 * @openapi
 * /api/statements/correo:
 *   post:
 *     summary: Envía el formulario de atestamiento por correo al destinatario
 *     tags: [Atestamientos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombreAgente, codigoPostal, ingresoAnual, compania, destinatario, plan]
 *             properties:
 *               nombreAgente: { type: string }
 *               codigoPostal: { type: string }
 *               ingresoAnual: { type: string }
 *               compania: { type: string }
 *               destinatario: { type: string, format: email }
 *               plan: { type: string }
 *     responses:
 *       200:
 *         description: Correo enviado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ResponseGeneric"
 *       400: { description: No se pudo crear o enviar }
 *       500: { description: Error interno }
 */
        this.router.post('/statements/correo', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { nombreAgente, codigoPostal, ingresoAnual, compania, destinatario, plan } = req.body;
                var response = yield this.service.EnviarFormularioAfirmaciones(nombreAgente, codigoPostal, ingresoAnual, compania, destinatario, plan);
                if (response) {
                    res.status(200).send(response);
                }
                else {
                    throw CustomError_1.CustomError.BadRequest(response);
                }
            }
            catch (err) {
                next(err);
            }
        }));
        /**
 * @openapi
 * /api/documento_firmado/{id}:
 *   get:
 *     summary: Descarga un consentimiento puntual por ID (archivo PDF)
 *     tags: [Descargas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: ID del consentimiento
 *     responses:
 *       200:
 *         description: PDF
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       404: { description: No encontrado }
 *       500: { description: Error interno }
 */
        this.router.get('/documento_firmado/:id', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const filePath = path_1.default.join(__dirname, '../../../', 'consentimientos', `${id}`, `formulario_consentimiento.pdf`);
                // Establecer el nombre del archivo a mostrar cuando se descargue
                const downloadName = 'documento.pdf';
                // Configurar el encabezado para indicar que se va a hacer una descarga
                res.setHeader('Content-Disposition', `attachment; filename="${downloadName}"`);
                // Enviar el archivo
                res.sendFile(filePath, (err) => {
                    if (err) {
                        next(err); // Pasar el error al siguiente manejador de errores
                    }
                });
            }
            catch (err) {
                next(err);
            }
        }));
        /**
 * @openapi
 * /api/consentimientos:
 *   get:
 *     summary: Lista consentimientos y atestamientos (incluye metadatos y, opcionalmente, base64)
 *     tags: [Consentimientos]
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ResponseGeneric"
 *             examples:
 *               ejemplo:
 *                 value:
 *                   success: true
 *                   message: "Consentimientos obtenidos correctamente."
 *                   data:
 *                     - $ref: "#/components/schemas/ConsentimientoItem"
 *       500: { description: Error interno }
 */
        this.router.get('/consentimientos', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.service.ObtenerTodosLosConsentimientos();
                res.status(200).send(response);
            }
            catch (error) {
                next(error);
            }
        }));
        /**
 * @openapi
 * /api/imagen:
 *   get:
 *     summary: Sirve una imagen local por ruta absoluta validada
 *     tags: [Utilidades]
 *     parameters:
 *       - in: query
 *         name: path
 *         required: true
 *         schema: { type: string }
 *         description: Ruta absoluta segura al archivo
 *     responses:
 *       200:
 *         description: Imagen
 *         content:
 *           image/*:
 *             schema:
 *               type: string
 *               format: binary
 *       400: { description: Parámetro inválido }
 *       404: { description: No se pudo cargar la imagen }
 *       500: { description: Error interno }
 */
        this.router.get('/imagen', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { path: imagePath } = req.query;
                if (!imagePath || typeof imagePath !== 'string') {
                    throw CustomError_1.CustomError.BadRequest("Se debe proporcionar el parámetro 'path'");
                }
                const resolvedPath = path_1.default.resolve(imagePath); // Asegura seguridad de la ruta
                res.sendFile(resolvedPath, (err) => {
                    if (err) {
                        next(CustomError_1.CustomError.NotFound("No se pudo cargar la imagen"));
                    }
                });
            }
            catch (err) {
                next(err);
            }
        }));
        /**
 * @openapi
 * /api/consentimientos/zips:
 *   get:
 *     summary: Descarga todos los PDFs (consentimientos y atestamientos) en un ZIP
 *     description: |
 *       Si el archivo existe en disco, se usa path_consentimiento.
 *       Si no existe, pero hay BLOB en BD, se usa BLOB.
 *       El nombre de cada PDF en el ZIP sigue el patrón:
 *       `<nombre>_<YYYYMMDD>_<idioma>_<email>_<id>.pdf`.
 *     tags: [Descargas]
 *     responses:
 *       200:
 *         description: ZIP generado
 *         content:
 *           application/zip:
 *             schema:
 *               type: string
 *               format: binary
 *       204: { description: Sin contenido }
 *       500: { description: Error interno }
 */
        const handleZip = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const items = yield this.service.ObtenerTodosLosConsentimientos();
                const data = (_a = items === null || items === void 0 ? void 0 : items.data) !== null && _a !== void 0 ? _a : items;
                res.status(200);
                res.setHeader('Content-Type', 'application/zip');
                res.setHeader('Content-Disposition', `attachment; filename="consentimientos_${yyyymmdd(new Date())}.zip"`);
                res.setHeader('Cache-Control', 'no-store');
                res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
                const archive = (0, archiver_1.default)('zip', { zlib: { level: 9 } });
                archive.on('warning', (e) => console.warn('[ZIP warn]', (e === null || e === void 0 ? void 0 : e.message) || e));
                archive.on('error', (e) => { try {
                    res.end();
                }
                catch (_a) { } next(e); });
                archive.pipe(res);
                let appended = 0;
                for (const row of data) {
                    const id = row.consentimiento_id || row.id || 'sinid';
                    const nombre = row.nombre_titular || row.nombreConsumidor || 'sin_nombre';
                    const email = row.correo || 'sinemail';
                    const idioma = (row.idioma || '').toString().toUpperCase() || 'ES';
                    const fecha = yyyymmdd(row.created || new Date());
                    const filename = `${slugify(nombre)}_${fecha}_${idioma}_${slugify(email)}_${id}.pdf`;
                    const filePath = row.path_consentimiento;
                    if (filePath && fs_1.default.existsSync(filePath)) {
                        archive.file(filePath, { name: filename });
                        appended++;
                    }
                    else if (row.consentimiento) {
                        const buf = Buffer.isBuffer(row.consentimiento) ? row.consentimiento : Buffer.from(row.consentimiento);
                        archive.append(stream_1.Readable.from(buf), { name: filename });
                        appended++;
                    }
                }
                if (appended === 0) {
                    archive.destroy();
                    return res.status(204).end();
                }
                archive.finalize();
            }
            catch (err) {
                next(err);
            }
        });
        this.router.get('/consentimientos/zips', handleZip);
        this.router.get('/consentimientos/descargar-todos', handleZip);
    }
}
exports.default = new ConsentimientoRouter();
