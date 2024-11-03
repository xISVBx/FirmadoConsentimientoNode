export interface RequestError {
    id: string;                 // ID único del request
    method: string;             // Método HTTP (GET, POST, etc.)
    url: string;                // URL del request
    start_time: string;         // Hora de inicio en formato ISO
    duration: number;           // Duración del request en milisegundos
    response_status: number;    // Código de estado de la respuesta
    request_params: string;     // Parámetros del request en formato JSON (o string)
}
