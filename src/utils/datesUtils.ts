export const convertirFecha = (fechaStr: string): string => {
    // La fecha debe estar en formato yyyy-mm-dd
    const [year, month, day] = fechaStr.split('-').map(num => parseInt(num, 10));

    // Formatear la fecha en dd/mm/yyyy
    const fechaFormateada = `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;

    return fechaFormateada;
}
export const obtenerFechaActualDDMMYYYY = (): string => {
    const fechaActual = new Date();
    const dia = String(fechaActual.getDate()).padStart(2, '0');
    const mes = String(fechaActual.getMonth() + 1).padStart(2, '0'); // Los meses en JS son 0-indexados
    const año = fechaActual.getFullYear();
    return `${dia}/${mes}/${año}`;
}

function getCurrentHour(): string {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const period = hours >= 12 ? 'PM' : 'AM';

    // Convert to 12-hour format
    if (hours > 12) {
        hours -= 12;
    } else if (hours === 0) {
        hours = 12;
    }

    // Format minutes to always have two digits
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

    return `${hours}:${formattedMinutes} ${period}`;
}