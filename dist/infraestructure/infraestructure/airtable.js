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
exports.GetSeguros = exports.GetTitulares = exports.GetUsuarios = exports.GetReportes = void 0;
const Airtable = require('airtable');
const API_KEY = 'patGuLU79HDlj9kEj.d2a7ded3b0c432a29082f6190d5e87904090d07771cb79a8a30df45f9567a1f5';
const BASE_ID = 'app4F1V8lFD3ud9Aw';
const base = new Airtable({ apiKey: API_KEY }).base(BASE_ID);
const GetReportes = (estado, aseguradora, agente) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let filterFormula = '';
        console.log(estado);
        console.log(aseguradora);
        console.log(agente);
        if (estado) {
            filterFormula += `{Estado} = "${estado}"`;
        }
        if (aseguradora) {
            if (filterFormula)
                filterFormula += ' AND ';
            filterFormula += `{Member ID} = "${aseguradora}"`;
        }
        if (agente) {
            if (filterFormula)
                filterFormula += ' AND ';
            filterFormula += `{Producer_Name} = "${agente}"`;
        }
        if (!filterFormula) {
            filterFormula = '1';
        }
        const records = yield base('Reportes').select({
            filterByFormula: filterFormula,
            sort: [],
        }).all();
        const fields = records.map((record) => record.fields);
        return fields;
    }
    catch (err) {
        console.error('Error al obtener los registros:', err);
    }
});
exports.GetReportes = GetReportes;
const GetUsuarios = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const records = yield base('Lista de Usuarios Registrados')
            .select({
            fields: ['Nombre Completo'],
        })
            .all();
        // Mapeamos para extraer solo los nombres completos
        const nombres = records.map((record) => record.fields['Nombre Completo']);
        nombres.sort((a, b) => a.localeCompare(b));
        return nombres;
    }
    catch (err) {
        console.error('Error al obtener los registros:', err);
        throw err; // Opcional: lanzar el error para manejarlo en el nivel superior
    }
});
exports.GetUsuarios = GetUsuarios;
const GetTitulares = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const records = yield base('Titulares')
            .select({
            fields: ['Nombre y Apellido'],
        }).all();
        // Mapeamos para extraer solo los nombres completos
        const nombres = records.map((record) => record.fields['Nombre y Apellido']);
        nombres.sort((a, b) => a.localeCompare(b));
        return nombres;
    }
    catch (err) {
        console.error('Error al obtener los registros:', err);
        throw err; // Opcional: lanzar el error para manejarlo en el nivel superior
    }
});
exports.GetTitulares = GetTitulares;
const GetSeguros = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const records = yield base('Seguros')
            .select({
            fields: ['Nombre'],
        })
            .all();
        // Mapeamos para extraer solo los nombres completos
        const nombres = records.map((record) => record.fields['Nombre']);
        nombres.sort((a, b) => a.localeCompare(b));
        return nombres;
    }
    catch (err) {
        console.error('Error al obtener los registros:', err);
        throw err; // Opcional: lanzar el error para manejarlo en el nivel superior
    }
});
exports.GetSeguros = GetSeguros;
