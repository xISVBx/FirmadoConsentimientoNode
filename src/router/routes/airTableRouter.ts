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

    this.router.get(
      "/airtable/reportes",
      async (req: Request, res: Response, next: NextFunction) => {
        try {
          const estado = (req.query.estado as string) || null;
          const producerName = (req.query.producerName as string) || null;
          const suscriberName = (req.query.suscriberName as string) || null;
          const compania = (req.query.compania as string) || null;

          var response = await this.service.GetReportes(
            estado,
            producerName,
            suscriberName,
            compania
          );

          res.send(response);
        } catch (err) {
          next(err);
        }
      }
    );

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
    this.router.get(
      "/airtable/usuarios",
      async (req: Request, res: Response, next: NextFunction) => {
        try {
          var response = await this.service.GetUsuarios();

          res.send(response);
        } catch (err) {
          next(err);
        }
      }
    );

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
    this.router.get(
      "/airtable/titulares",
      async (req: Request, res: Response, next: NextFunction) => {
        try {
          var response = await this.service.GetTitulares();

          res.send(response);
        } catch (err) {
          next(err);
        }
      }
    );

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
    this.router.get(
      "/airtable/seguros",
      async (req: Request, res: Response, next: NextFunction) => {
        try {
          var response = await this.service.GetSeguros();

          res.send(response);
        } catch (err) {
          next(err);
        }
      }
    );
  }
}

export default new AirTableRouter();
