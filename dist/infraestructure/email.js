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
            to: destinatario,
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
