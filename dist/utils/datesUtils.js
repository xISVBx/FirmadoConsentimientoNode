"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.obtenerFechaActualDDMMYYYY = exports.convertirFecha = void 0;
const convertirFecha = (fechaStr) => {
    // La fecha debe estar en formato yyyy-mm-dd
    const [year, month, day] = fechaStr.split('-').map(num => parseInt(num, 10));
    // Formatear la fecha en dd/mm/yyyy
    const fechaFormateada = `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
    return fechaFormateada;
};
exports.convertirFecha = convertirFecha;
const obtenerFechaActualDDMMYYYY = () => {
    const fechaActual = new Date();
    const dia = String(fechaActual.getDate()).padStart(2, '0');
    const mes = String(fechaActual.getMonth() + 1).padStart(2, '0'); // Los meses en JS son 0-indexados
    const año = fechaActual.getFullYear();
    return `${dia}/${mes}/${año}`;
};
exports.obtenerFechaActualDDMMYYYY = obtenerFechaActualDDMMYYYY;
