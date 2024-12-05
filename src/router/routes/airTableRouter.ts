import { Router } from "express";
import { NextFunction, Request, Response } from "express";
import AirTableService from "../../application/airTableService";

class AirTableRouter {

    router: Router;
    private service: AirTableService;

    constructor() {
        this.service = new AirTableService();
        this.router = Router();
        this.config();
    }

    private config() {

    /**
 * @openapi
 * /api/airtable:
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
 *         name: aseguradora
 *         description: Filtro para buscar registros según la aseguradora (opcional).
 *         required: false
 *         schema:
 *           type: string
 *       - in: query
 *         name: agente
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

        this.router.get('/airtable', async (req: Request, res: Response, next: NextFunction) => {
            try {

                const estado = req.query.estado as string || null;
                const aseguradora = req.query.aseguradora as string || null;
                const agente = req.query.agente as string || null;

                console.log(estado)
                console.log(aseguradora)
                console.log(agente)

                var response = await this.service.Prueba(estado, aseguradora, agente);

                res.send(response);

            } catch (err) {
                next(err)
            }
        })
    }
}

export default new AirTableRouter();