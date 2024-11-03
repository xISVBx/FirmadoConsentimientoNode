import { HttpMethod } from "domain/enums/httpMethods";
import { RequestError } from "../../../domain/entities/RequestError";
import { getDb } from "../context/sqlite";
import { ErrorDetail } from "domain/entities/ErrorsDetail";

export const getRequestsWithPagination = async (
    status: number | null = null,
    method: HttpMethod | null = null,
    page: number = 1,
    limit: number = 10
): Promise<Array<RequestError>> => {
    const db = await getDb();
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM requests';
    const params: Array<number | string | null> = []; // Aseguramos que los parámetros sean del tipo correcto

    // Filtro por status
    if (status !== null) {
        query += ' WHERE response_status = ?';
        params.push(status);
    }

    // Filtro por method
    if (method !== null) {
        query += status !== null ? ' AND' : ' WHERE'; // Usar AND si ya hay un filtro
        query += ' method = ?';
        params.push(method);
    }

    query += ' ORDER BY start_time DESC'; // Ordenar por start_time en orden descendente
    query += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);

    return await db.all(query, params);
};

export const getErrorsByRequestId = async (requestId: string): Promise<ErrorDetail[]> => {
    const db = await getDb();

    const query = `
        SELECT e.*
        FROM errors e
        INNER JOIN requests r ON e.request_id = r.id
        WHERE r.id = ?
    `;

    const params = [requestId];

    const rows = await db.all(query, params);

    // Devolver solo los campos necesarios de los errores
    return rows;
};

export const getRequestById = async (requestId: string): Promise<RequestError | null> => {
    const db = await getDb();
    const query = 'SELECT * FROM requests WHERE id = ?';
    const params = [requestId];

    const result = await db.get(query, params);
    return result ? { ...result } : null;
};
