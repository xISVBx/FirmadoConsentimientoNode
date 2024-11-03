import { HttpMethod } from "domain/enums/httpMethods";
import { CustomError } from "../common/errors/CustomError";
import { ResponseGeneric } from "../common/models/response";
import { RequestError } from "../domain/entities/RequestError";
import { getErrorsByRequestId, getRequestById, getRequestsWithPagination } from "../infraestructure/persistence/repository/errorsRepository";
import { ErrorDetail } from "domain/entities/ErrorsDetail";

export default class ErrorService {
    async getFilteredRequests(
        status: number | null = null,
        method: HttpMethod | null = null,
        page: number = 1,
        limit: number = 10
    ): Promise<ResponseGeneric<Array<RequestError>>> {
        try {
            const response = await getRequestsWithPagination(status, method, page, limit);
            return ResponseGeneric.Success(response);
        } catch (err) {
            throw CustomError.InternalServerError(`Error al obtener las solicitudes: ${err}`);
        }
    }

    async getErrorsForRequest(requestId: string): Promise<ResponseGeneric<{ request: RequestError; errors: ErrorDetail[] }>> {
        try {
            const request = await getRequestById(requestId);
            if (!request) {
                throw CustomError.NotFound('Solicitud no encontrada.');
            }
    
            const errors = await getErrorsByRequestId(requestId);
    
            return ResponseGeneric.Success({ request, errors });
        } catch (err) {
            throw CustomError.InternalServerError(`Error al obtener los errores: ${err}`);
        }
    }
    
}