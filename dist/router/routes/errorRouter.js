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
const CustomError_1 = require("../../common/errors/CustomError");
const errorService_1 = __importDefault(require("../../application/errorService"));
const email_1 = require("../../infraestructure/infraestructure/email");
class ErrorRouter {
    constructor() {
        this.service = new errorService_1.default();
        this.router = (0, express_1.Router)();
        this.config();
    }
    config() {
        this.router.get('/errors', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { status, method, page = 1, limit = 10 } = req.query;
                const statusFilter = typeof status === 'string' ? parseInt(status) : null;
                const methodFilter = typeof method === 'string' ? method : null; // Asegura que sea un método válido
                const pageNumber = typeof page === 'string' ? Number(page) : 1;
                const limitNumber = typeof limit === 'string' ? Number(limit) : 10;
                if (statusFilter !== null && isNaN(statusFilter)) {
                    throw CustomError_1.CustomError.BadRequest('El estado debe ser un número válido.');
                }
                var response = yield this.service.getFilteredRequests(statusFilter, methodFilter, pageNumber, limitNumber);
                if (response) {
                    res.status(200).send(response);
                    return;
                }
                else {
                    throw CustomError_1.CustomError.BadRequest('Error al obtener los errores.');
                }
            }
            catch (error) {
                next(error);
            }
        }));
        this.router.get('/pruebas', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const requestId = req.params.id;
                (0, email_1.enviarFormularioCorreo)('ivansantiagovb@gmail.com', 'subject', 'body');
                res.status(200).send("pasamos mano");
            }
            catch (error) {
                next(error);
            }
        }));
        this.router.get('/errors/:id', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const requestId = req.params.id;
                const response = yield this.service.getErrorsForRequest(requestId);
                res.status(200).send(response);
            }
            catch (error) {
                next(error);
            }
        }));
    }
}
exports.default = new ErrorRouter();
