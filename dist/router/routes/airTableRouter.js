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
             * /api/airtable:
             *   get:
             *     summary: Obtiene registros de Airtable con filtros opcionales.
             *     description: Este endpoint permite obtener registros filtrados por estado, aseguradora y agente.
             *     parameters:
             *       - in: query
             *         name: estado
             *         description: El estado para filtrar los registros (opcional).
             *         required: false
             *         schema:
             *           type: string
             *       - in: query
             *         name: aseguradora
             *         description: La aseguradora para filtrar los registros (opcional).
             *         required: false
             *         schema:
             *           type: string
             *       - in: query
             *         name: agente
             *         description: El nombre del agente para filtrar los registros (opcional).
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
             *                   nombre:
             *                     type: string
             *                   estado:
             *                     type: string
             *                   aseguradora:
             *                     type: string
             *                   agente:
             *                     type: string
             *       400:
             *         description: Error en los parámetros.
             */
        this.router.get('/airtable', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const estado = req.query.estado || null;
                const aseguradora = req.query.aseguradora || null;
                const agente = req.query.agente || null;
                console.log(estado);
                console.log(aseguradora);
                console.log(agente);
                var response = yield this.service.Prueba(estado, aseguradora, agente);
                res.send(response);
            }
            catch (err) {
                next(err);
            }
        }));
    }
}
exports.default = new AirTableRouter();
