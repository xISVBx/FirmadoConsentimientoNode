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
exports.GuardarStatement = exports.GuardarConsentimiento = void 0;
const database_1 = require("../context/database");
const CustomError_1 = require("../../../common/errors/CustomError");
const GuardarConsentimiento = (base64Consentimiento, nombreTitular, telefonoTitular, correoTitular, fechaNacimiento, idConsentimiento, pathConsentimiento) => __awaiter(void 0, void 0, void 0, function* () {
    var conn = yield (0, database_1.getConnection)();
    yield conn.beginTransaction();
    try {
        const bufferConsentimiento = Buffer.from(base64Consentimiento);
        const resultConsentimiento = yield conn.execute(`INSERT INTO consentimientos
            (id, path_consentimiento, consentimiento, created)
            VALUES (?, ?, ?, ?);`, [idConsentimiento, pathConsentimiento, bufferConsentimiento, new Date()]);
        let fechaNacimientoDate;
        if (fechaNacimiento) {
            fechaNacimientoDate = new Date(fechaNacimiento);
            if (isNaN(fechaNacimientoDate.getTime())) {
                fechaNacimientoDate = null;
            }
        }
        else {
            fechaNacimientoDate = null;
        }
        const resultDatos = yield conn.execute(`INSERT INTO datos_consentimientos
            (id_consentimiento, nombre, telefono, correo, fecha_nacimiento)
            VALUES (?, ?, ?, ?, ?);`, [idConsentimiento, nombreTitular, telefonoTitular, correoTitular, fechaNacimientoDate]);
        yield conn.commit();
        return true;
    }
    catch (e) {
        yield conn.rollback();
        throw CustomError_1.CustomError.InternalServerError(`${e}`);
    }
});
exports.GuardarConsentimiento = GuardarConsentimiento;
const GuardarStatement = (base64Consentimiento, path, statement, agente) => __awaiter(void 0, void 0, void 0, function* () {
    var conn = yield (0, database_1.getConnection)();
    yield conn.beginTransaction();
    try {
        const bufferConsentimiento = Buffer.from(base64Consentimiento);
        const resultConsentimiento = yield conn.execute(`INSERT INTO consentimientos
            (id, path_consentimiento, consentimiento, created)
            VALUES (?, ?, ?, ?);`, [statement.idConsentimiento, path, bufferConsentimiento, new Date()]);
        const resultDatos = yield conn.execute(`INSERT INTO datos_afirmaciones
            (id_consentimiento, codigoPostal, ingresoAnual, compania, plan, nombreConsumidor)
            VALUES (?, ?, ?, ?, ?, ?);`, [statement.idConsentimiento, statement.codigoPostal, statement.ingresoAnual, statement.compania, agente.plan, statement.nombreConsumidor]);
        yield conn.commit();
        return true;
    }
    catch (e) {
        yield conn.rollback();
        throw CustomError_1.CustomError.InternalServerError(`${e}`);
    }
});
exports.GuardarStatement = GuardarStatement;
