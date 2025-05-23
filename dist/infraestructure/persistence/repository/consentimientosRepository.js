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
exports.createConsentimiento = exports.GuardarStatement = exports.getConsentimientoById = exports.GuardarConsentimiento = void 0;
const database_1 = require("../context/database");
const CustomError_1 = require("../../../common/errors/CustomError");
const GuardarConsentimiento = (base64Consentimiento, nombreTitular, telefonoTitular, correoTitular, fechaNacimiento, idConsentimiento, pathConsentimiento, ip, location, qrCode) => __awaiter(void 0, void 0, void 0, function* () {
    var conn = yield (0, database_1.getConnection)();
    yield conn.beginTransaction();
    try {
        const bufferConsentimiento = Buffer.from(base64Consentimiento);
        const resultConsentimiento = yield conn.execute(`UPDATE consentimientos
            SET 
                path_consentimiento = ?, 
                consentimiento = ?, 
                created = ?, 
                ip = ?, 
                location = ?, 
                estado = 'created', 
                qr_code = ?
            WHERE id = ?;`, [
            pathConsentimiento, // Nuevo path del consentimiento
            bufferConsentimiento, // Consentimiento en formato binario (Buffer)
            new Date(), // Fecha y hora actual para el campo 'created'
            ip, // IP desde donde se actualiza
            location, // Location desde donde se actualiza
            qrCode, // El código QR generado
            idConsentimiento // ID del consentimiento que queremos actualizar
        ]);
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
const getConsentimientoById = (idConsentimiento) => __awaiter(void 0, void 0, void 0, function* () {
    const conn = yield (0, database_1.getConnection)(); // Establecer conexión con la base de datos
    try {
        // Realizar la consulta para obtener todos los campos de la tabla 'consentimientos'
        const [rows] = yield conn.execute(`SELECT id, path_consentimiento, consentimiento, created, viewed, enviado, ip, location, estado, qr_code 
            FROM consentimientos
            WHERE id = ?`, [idConsentimiento]);
        // Verificar si se ha obtenido algún resultado
        if (rows.length === 0) {
            throw new Error("Consentimiento no encontrado");
        }
        // Retornar el primer resultado de la consulta
        return rows[0];
    }
    catch (error) {
        console.error("Error al obtener el consentimiento:", error);
        throw CustomError_1.CustomError.InternalServerError(`Error al obtener el consentimiento: ${error}`);
    }
});
exports.getConsentimientoById = getConsentimientoById;
const GuardarStatement = (base64Consentimiento, path, statement, agente) => __awaiter(void 0, void 0, void 0, function* () {
    var conn = yield (0, database_1.getConnection)();
    yield conn.beginTransaction();
    try {
        const bufferConsentimiento = Buffer.from(base64Consentimiento);
        const resultConsentimiento = yield conn.execute(`UPDATE consentimientos
            SET 
                path_consentimiento = ?, 
                consentimiento = ?, 
                created = ?, 
                ip = ?, 
                location = ?, 
                estado = 'created', 
                qr_code = ?
            WHERE id = ?;`, [
            path,
            bufferConsentimiento,
            new Date(),
            '',
            '',
            '',
            agente.consentimientoId
        ]);
        const resultDatos = yield conn.execute(`INSERT INTO datos_afirmaciones
            (id_consentimiento, codigoPostal, ingresoAnual, compania, plan, nombreConsumidor)
            VALUES (?, ?, ?, ?, ?, ?);`, [agente.consentimientoId, agente.codigoPostal, agente.ingresoAnual, agente.compania, agente.plan, statement.nombreConsumidor]);
        yield conn.commit();
        return true;
    }
    catch (e) {
        yield conn.rollback();
        throw CustomError_1.CustomError.InternalServerError(`${e}`);
    }
});
exports.GuardarStatement = GuardarStatement;
//CREAR UN CONSENTMIENTO
// CREAR UN CONSENTIMIENTO
const createConsentimiento = (idConsentimiento) => __awaiter(void 0, void 0, void 0, function* () {
    const conn = yield (0, database_1.getConnection)();
    try {
        // Intentar inserción sin transacción (solo 1 operación)
        const [result] = yield conn.execute(`INSERT INTO consentimientos (id, estado, enviado)
             VALUES (?, 'sended', ?)`, [idConsentimiento, new Date()]);
        // Verificar inserción exitosa (affectedRows en MySQL)
        if (result.affectedRows === 1) {
            return true;
        }
        throw new Error("No se insertó el registro");
    }
    catch (e) {
        // Manejar error de clave duplicada (aunque UUIDv4 es único)
        if (e.code === 'ER_DUP_ENTRY') {
            console.error(`ID duplicado: ${idConsentimiento}`);
            throw CustomError_1.CustomError.BadRequest("Error: ID ya existe");
        }
        // Errores generales de base de datos
        console.error(`Error en createConsentimiento: ${e.message}`);
        throw CustomError_1.CustomError.InternalServerError(`Error de base de datos: ${e.message}`);
    }
});
exports.createConsentimiento = createConsentimiento;
