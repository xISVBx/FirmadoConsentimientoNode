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
const airTableService_1 = __importDefault(require("../../application/airTableService"));
class AirTableRouter {
    constructor() {
        this.service = new airTableService_1.default();
        this.router = (0, express_1.Router)();
        this.config();
    }
    config() {
        /**
         * @openapi
         * /api/airtable/reportes:
         *   get:
         *     summary: Obtiene registros de Airtable con filtros opcionales.
         *     description: Este endpoint permite obtener registros de Airtable basados en los parámetros de estado, aseguradora y agente.
         *     parameters:
         *       - in: query
         *         name: estado
         *         description: Filtro para buscar registros según el estado (opcional).
         *         required: false
         *         schema:
         *           type: string
         *       - in: query
         *         name: producerName
         *         description: Filtro para buscar registros según la aseguradora (opcional).
         *         required: false
         *         schema:
         *           type: string
         *       - in: query
         *         name: suscriberName
         *         description: Filtro para buscar registros según el nombre del agente (opcional).
         *         required: false
         *         schema:
         *           type: string
         *     responses:
         *       200:
         *         description: Registros obtenidos exitosamente.
         *         content:
         *           application/json:
         *             schema:
         *               type: array
         *               items:
         *                 type: object
         *                 properties:
         *                   id:
         *                     type: string
         *                     description: Identificador único del registro.
         *                   nombre:
         *                     type: string
         *                     description: Nombre del titular o asegurado.
         *                   estado:
         *                     type: string
         *                     description: Estado del registro.
         *                   aseguradora:
         *                     type: string
         *                     description: Nombre de la aseguradora.
         *                   agente:
         *                     type: string
         *                     description: Nombre del agente asociado al registro.
         *       400:
         *         description: Error en los parámetros de la solicitud.
         *       500:
         *         description: Error interno del servidor.
         */
        this.router.get("/airtable/reportes", (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const estado = req.query.estado || null;
                const producerName = req.query.producerName || null;
                const suscriberName = req.query.suscriberName || null;
                var response = yield this.service.GetReportes(estado, producerName, suscriberName);
                res.send(response);
            }
            catch (err) {
                next(err);
            }
        }));
        /**
         * @openapi
         * /api/airtable/usuarios:
         *   get:
         *     summary: Obtiene la lista de usuarios registrados en Airtable.
         *     description: Este endpoint recupera los registros de la tabla "Lista de Usuarios Registrados" en Airtable.
         *     responses:
         *       200:
         *         description: Lista de usuarios obtenida exitosamente.
         *         content:
         *           application/json:
         *             schema:
         *               type: array
         *               items:
         *                 type: object
         *                 properties:
         *                   Nombre Completo:
         *                     type: string
         *                     description: Nombre completo del usuario registrado.
         *       500:
         *         description: Error interno del servidor.
         */
        this.router.get("/airtable/usuarios", (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                var response = yield this.service.GetUsuarios();
                res.send(response);
            }
            catch (err) {
                next(err);
            }
        }));
        /**
         * @openapi
         * /api/airtable/titulares:
         *   get:
         *     summary: Obtiene la lista de titulares registrados en Airtable.
         *     description: Este endpoint recupera los registros de la tabla "Lista de Titulares Registrados" en Airtable.
         *     responses:
         *       200:
         *         description: Lista de titulares obtenida exitosamente.
         *         content:
         *           application/json:
         *             schema:
         *               type: array
         *               items:
         *                 type: string
         *                 description: Nombre completo del titular registrado.
         *       500:
         *         description: Error interno del servidor.
         */
        this.router.get("/airtable/titulares", (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                var response = yield this.service.GetTitulares();
                res.send(response);
            }
            catch (err) {
                next(err);
            }
        }));
        /**
         * @openapi
         * /api/airtable/seguros:
         *   get:
         *     summary: Obtiene la lista de seguros activos en Airtable.
         *     description: Este endpoint recupera los registros de la tabla "Lista de Seguros Activos" en Airtable.
         *     responses:
         *       200:
         *         description: Lista de seguros obtenida exitosamente.
         *         content:
         *           application/json:
         *             schema:
         *               type: array
         *               items:
         *                 type: string
         *                 description: Nombre del seguro activo.
         *       500:
         *         description: Error interno del servidor.
         */
        this.router.get("/airtable/seguros", (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                var response = yield this.service.GetSeguros();
                res.send(response);
            }
            catch (err) {
                next(err);
            }
        }));
    }
}
exports.default = new AirTableRouter();
