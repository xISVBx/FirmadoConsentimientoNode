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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRequestById = exports.getErrorsByRequestId = exports.getRequestsWithPagination = void 0;
const sqlite_1 = require("../context/sqlite");
const getRequestsWithPagination = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (status = null, method = null, page = 1, limit = 10) {
    const db = yield (0, sqlite_1.getDb)();
    const offset = (page - 1) * limit;
    let query = 'SELECT * FROM requests';
    const params = []; // Aseguramos que los parámetros sean del tipo correcto
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
    return yield db.all(query, params);
});
exports.getRequestsWithPagination = getRequestsWithPagination;
const getErrorsByRequestId = (requestId) => __awaiter(void 0, void 0, void 0, function* () {
    const db = yield (0, sqlite_1.getDb)();
    const query = `
        SELECT e.*
        FROM errors e
        INNER JOIN requests r ON e.request_id = r.id
        WHERE r.id = ?
    `;
    const params = [requestId];
    const rows = yield db.all(query, params);
    // Devolver solo los campos necesarios de los errores
    return rows;
});
exports.getErrorsByRequestId = getErrorsByRequestId;
const getRequestById = (requestId) => __awaiter(void 0, void 0, void 0, function* () {
    const db = yield (0, sqlite_1.getDb)();
    const query = 'SELECT * FROM requests WHERE id = ?';
    const params = [requestId];
    const result = yield db.get(query, params);
    return result ? Object.assign({}, result) : null;
});
exports.getRequestById = getRequestById;
