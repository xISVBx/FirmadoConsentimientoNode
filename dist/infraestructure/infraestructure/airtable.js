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
exports.getFilteredData = void 0;
const Airtable = require('airtable');
// Usa tu API Key aquí
const API_KEY = 'patGuLU79HDlj9kEj.d2a7ded3b0c432a29082f6190d5e87904090d07771cb79a8a30df45f9567a1f5';
const BASE_ID = 'app4F1V8lFD3ud9Aw'; // ID de tu base
const TABLE_NAME = 'Reportes'; // Nombre de tu tabla
// Configuración de la base
const base = new Airtable({ apiKey: API_KEY }).base(BASE_ID);
// Función para obtener los datos de Airtable
const getFilteredData = (estado, aseguradora, agente) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let filterFormula = '';
        // Filtro por Estado
        if (estado) {
            filterFormula += `{Estado} = "${estado}"`;
        }
        // Filtro por Aseguradora (si existe el valor para aseguradora)
        if (aseguradora) {
            if (filterFormula)
                filterFormula += ' AND '; // Si ya hay un filtro, agregar "AND"
            filterFormula += `{Member ID} = "${aseguradora}"`;
        }
        // Filtro por Agente
        if (agente) {
            if (filterFormula)
                filterFormula += ' AND '; // Si ya hay un filtro, agregar "AND"
            filterFormula += `{Producer_Name} = "${agente}"`;
        }
        // Si no hay filtros, devolvemos todos los registros
        if (!filterFormula) {
            filterFormula = '1'; // Esto devuelve todos los registros
        }
        // Realizamos la consulta a la tabla con la fórmula de filtro
        const records = yield base(TABLE_NAME).select({
            filterByFormula: filterFormula, // Usamos la fórmula dinámica construida
            sort: [], // Orden por nombre (puedes cambiar este campo)
            maxRecords: 10, // Limita la cantidad de registros
            pageSize: 5, // Tamaño de la página
        }).all();
        // Extraer los campos de cada registro
        const fields = records.map((record) => record.fields);
        console.log(fields); // Muestra los campos obtenidos
        return fields; // Devuelve los registros filtrados
    }
    catch (err) {
        console.error('Error al obtener los registros:', err);
    }
});
exports.getFilteredData = getFilteredData;
