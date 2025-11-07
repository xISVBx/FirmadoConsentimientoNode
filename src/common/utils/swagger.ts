import path from 'path';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "API de Consentimientos",
      version: "1.0.0",
      description: "Documentación de la API para manejar consentimientos y atestamientos.",
    },
    servers: [
      { url: "https://api.jecopainsurance.com/api" }, // PROD con /api
      { url: "http://localhost:3000/api" },           // Local
    ],
    components: {
      schemas: {
        ResponseGeneric: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            message: { type: "string" },
            data: {},
          },
        },
        Idioma: {
          type: "string",
          enum: ["Español", "Inglés"],
          example: "Español",
        },
        ConsentimientoSend: {
          type: "object",
          properties: {
            correoAgente: { type: "string", format: "email" },
            nombreAgente: { type: "string" },
            numeroProductor: { type: "string" },
            telefonoAgente: { type: "string" },
            consentimientoId: { type: "string", format: "uuid" },
          },
          required: ["correoAgente","nombreAgente","numeroProductor","telefonoAgente","consentimientoId"],
        },
        StatementSend: {
          type: "object",
          properties: {
            nombreAgente: { type: "string" },
            codigoPostal: { type: "string" },
            ingresoAnual: { type: "string" },
            compania: { type: "string" },
            plan: { type: "string" },
            consentimientoId: { type: "string", format: "uuid" },
          },
          required: ["nombreAgente","codigoPostal","ingresoAnual","compania","plan","consentimientoId"],
        },
        IStatement: {
          type: "object",
          properties: {
            nombreConsumidor: { type: "string" },
            // agrega más campos si existen
          },
          required: ["nombreConsumidor"],
        },
        ConsentimientoItem: {
          type: "object",
          properties: {
            consentimiento_id: { type: "string" },
            path_consentimiento: { type: "string" },
            created: { type: "string", format: "date-time" },
            viewed: { type: "string", format: "date-time", nullable: true },
            enviado: { type: "string", format: "date-time", nullable: true },
            ip: { type: "string", nullable: true },
            location: { type: "string", nullable: true },
            estado: { type: "string", example: "created" },
            qr_code: { type: "string", nullable: true },
            consentimiento_base64: { type: "string", nullable: true },
            idioma: { $ref: "#/components/schemas/Idioma" },
            nombre_titular: { type: "string", nullable: true },
            telefono: { type: "string", nullable: true },
            correo: { type: "string", nullable: true },
            fecha_nacimiento: { type: "string", format: "date", nullable: true },
            codigoPostal: { type: "string", nullable: true },
            ingresoAnual: { type: "string", nullable: true },
            compania: { type: "string", nullable: true },
            plan: { type: "string", nullable: true },
            nombreConsumidor: { type: "string", nullable: true },
          },
        },
      },
    },
  },
  apis: [
    path.join(process.cwd(), "src/router/routes/*.ts"),  // dev
    path.join(process.cwd(), "dist/router/routes/*.js"), // prod compilado
    path.join(process.cwd(), "src/server.ts"),           // 👈 agrega esto (ajusta nombre si difiere)
    path.join(process.cwd(), "dist/server.js"),          // 👈 para producción compilada
  ],
};

const swaggerDocs = swaggerJSDoc(swaggerOptions);
export { swaggerUi, swaggerDocs };