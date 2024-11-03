import { Router } from "express";
import { NextFunction, Request, Response } from "express";
import { CustomError } from "../../common/errors/CustomError";
import ErrorService from "../../application/errorService";
import { HttpMethod } from "../../domain/enums/httpMethods";

class ErrorRouter {
    router: Router;
    private service: ErrorService;

    constructor() {
        this.service = new ErrorService();
        this.router = Router();
        this.config();
    }

    private config() {
        this.router.get('/errors', async (req: Request, res: Response, next: NextFunction) => {
            try {
                const { status, method, page = 1, limit = 10 } = req.query;

                const statusFilter = typeof status === 'string' ? parseInt(status) : null;
                const methodFilter = typeof method === 'string' ? method as HttpMethod : null; // Asegura que sea un método válido
                const pageNumber: number = typeof page === 'string' ? Number(page) : 1;
                const limitNumber: number = typeof limit === 'string' ? Number(limit) : 10;

                if (statusFilter !== null && isNaN(statusFilter)) {
                    throw CustomError.BadRequest('El estado debe ser un número válido.');
                }

                var response = await this.service.getFilteredRequests(statusFilter, methodFilter, pageNumber, limitNumber);
                if (response) {
                    res.status(200).send(response);
                    return;
                } else {
                    throw CustomError.BadRequest('Error al obtener los errores.');
                }
            } catch (error) {
                next(error);
            }
        });

        this.router.get('/errors/:id', async (req: Request, res: Response, next: NextFunction) => {
            try {
                const requestId = req.params.id;
                const response = await this.service.getErrorsForRequest(requestId);
                res.status(200).send(response);
            } catch (error) {
                next(error);
            }
        });
    }
}

export default new ErrorRouter();
