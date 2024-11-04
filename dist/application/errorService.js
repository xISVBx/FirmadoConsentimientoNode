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
const CustomError_1 = require("../common/errors/CustomError");
const response_1 = require("../common/models/response");
const errorsRepository_1 = require("../infraestructure/persistence/repository/errorsRepository");
class ErrorService {
    getFilteredRequests() {
        return __awaiter(this, arguments, void 0, function* (status = null, method = null, page = 1, limit = 10) {
            try {
                const response = yield (0, errorsRepository_1.getRequestsWithPagination)(status, method, page, limit);
                return response_1.ResponseGeneric.Success(response);
            }
            catch (err) {
                throw CustomError_1.CustomError.InternalServerError(`Error al obtener las solicitudes: ${err}`);
            }
        });
    }
    getErrorsForRequest(requestId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const request = yield (0, errorsRepository_1.getRequestById)(requestId);
                if (!request) {
                    throw CustomError_1.CustomError.NotFound('Solicitud no encontrada.');
                }
                const errors = yield (0, errorsRepository_1.getErrorsByRequestId)(requestId);
                return response_1.ResponseGeneric.Success({ request, errors });
            }
            catch (err) {
                throw CustomError_1.CustomError.InternalServerError(`Error al obtener los errores: ${err}`);
            }
        });
    }
}
exports.default = ErrorService;
