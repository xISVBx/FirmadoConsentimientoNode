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
exports.enviarCorreo = enviarCorreo;
exports.enviarFormularioCorreo = enviarFormularioCorreo;
const nodemailer_1 = __importDefault(require("nodemailer"));
function enviarCorreo(destinatario, asunto, texto, html, fileName, uint8Array) {
    return __awaiter(this, void 0, void 0, function* () {
        const transporter = nodemailer_1.default.createTransport({
            host: 'jecopainsurance.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
        const pdfBytes = Buffer.from(uint8Array);
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: destinatario.join(','),
            subject: asunto,
            text: texto,
            html: html,
            attachments: [
                {
                    filename: fileName,
                    content: pdfBytes
                }
            ]
        };
        try {
            const info = yield transporter.sendMail(mailOptions);
            console.log('Correo enviado: %s', info.messageId);
            return true;
        }
        catch (error) {
            console.error('Error enviando correo: ', error);
            return false;
        }
    });
}
function enviarFormularioCorreo(destinatario, asunto, token) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(destinatario);
        const transporter = nodemailer_1.default.createTransport({
            host: 'jecopainsurance.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
        const link = `https://www.jecopainsurance.com/consentimiento/?token=${token}`;
        const html = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Correo Electrónico</title>
    <style>
        /* Asegúrate de incluir CSS básico para compatibilidad con la mayoría de los clientes de correo */
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #0056b3;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #EF6A1A;
            border-radius: 8px;
            overflow: hidden;
            padding: 20px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            font-size: 16px;
            font-weight: bold;
            color: #ffffff;
            background-color: #2574c9;
            text-decoration: none;
            border-radius: 5px;
            text-align: center;
            cursor: pointer;
        }
        .button:hover {
            background-color: #0056b3;
        }
        .center {
            text-align: center;
        }
        .text {
            color: #ffffff;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1 class="center">Formulario de consentimiento</h1>
        <h4 class="text">Dale click al boton para ir a llenar el formulario del consentimiento, despues de llenarlo te llegara un correo junto con una copia del documento</h4>
        <div class="center">
            <a href="${link}" class="button">Rellenar Formulario</a>
        </div>

    </div>
</body>
</html>
`;
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: destinatario,
            subject: asunto,
            html,
        };
        try {
            const info = yield transporter.sendMail(mailOptions);
            console.log('Correo enviado: %s', info.messageId);
            return true;
        }
        catch (error) {
            console.error('Error enviando correo: ', error);
            return false;
        }
    });
}
