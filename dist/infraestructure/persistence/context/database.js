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
exports.getConnection = void 0;
const promise_1 = __importDefault(require("mysql2/promise"));
const getConnection = () => __awaiter(void 0, void 0, void 0, function* () {
    const host = process.env.DB_HOST || "";
    const port = parseInt(process.env.DB_PORT || "3306");
    const user = process.env.DB_USER || "";
    const password = process.env.DB_PASS || "";
    const database = process.env.DB_DATABASE || "";
    if (!host || isNaN(port) || !user || !password || !database) {
        throw new Error('Invalid database configuration');
    }
    return promise_1.default.createConnection({
        host,
        port,
        user,
        password,
        database,
    });
});
exports.getConnection = getConnection;
