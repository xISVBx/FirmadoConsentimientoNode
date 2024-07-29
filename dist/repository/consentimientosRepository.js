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
exports.GuardarConsentimiento = void 0;
const database_1 = require("../database/database");
const GuardarConsentimiento = (base64Consentimiento, nombreTitular, telefonoTitular, correoTitular, fechaNacimiento, idConsentimiento, pathConsentimiento) => __awaiter(void 0, void 0, void 0, function* () {
    var conn = yield (0, database_1.getConnection)();
    yield conn.beginTransaction();
    try {
        // Convertir Uint8Array a Buffer
        const bufferConsentimiento = Buffer.from(base64Consentimiento);
        // Usar new Date() para el campo TIMESTAMP
        const resultConsentimiento = yield conn.execute(`INSERT INTO consentimientos
            (id, path_consentimiento, consentimiento, created)
            VALUES (?, ?, ?, ?);`, [idConsentimiento, pathConsentimiento, bufferConsentimiento, new Date()]);
        // Convertir fechaNacimiento a un objeto Date y manejar valores inválidos
        let fechaNacimientoDate;
        if (fechaNacimiento) {
            fechaNacimientoDate = new Date(fechaNacimiento);
            if (isNaN(fechaNacimientoDate.getTime())) {
                fechaNacimientoDate = null; // O el valor que prefieras para fechas inválidas
            }
        }
        else {
            fechaNacimientoDate = null; // O el valor que prefieras si fechaNacimiento es nulo o vacío
        }
        const resultDatos = yield conn.execute(`INSERT INTO datos_consentimientos
            (id_consentimiento, nombre, telefono, correo, fecha_nacimiento)
            VALUES (?, ?, ?, ?, ?);`, [idConsentimiento, nombreTitular, telefonoTitular, correoTitular, fechaNacimientoDate]);
        //console.log(resultConsentimiento)
        //console.log(resultDatos)
        yield conn.commit();
        return true;
    }
    catch (e) {
        console.log(e);
        yield conn.rollback();
        return false;
    }
});
exports.GuardarConsentimiento = GuardarConsentimiento;
