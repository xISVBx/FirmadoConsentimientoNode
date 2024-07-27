// mailer.js
import nodemailer from 'nodemailer';

// Configura el transportador
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'vasquezballesterosivansantiago@gmail.com', // Tu correo
        pass: 'tu-contraseña' // Tu contraseña de aplicación
    }
});

// Función para enviar correos
export async function enviarCorreo(destinatario, asunto, texto, html) {
    const mailOptions = {
        from: 'tu-email@gmail.com', // Remitente
        to: destinatario, // Destinatario
        subject: asunto, // Asunto
        text: texto, // Texto en formato plano
        html: html // Texto en formato HTML
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Correo enviado: %s', info.messageId);
        return true;
    } catch (error) {
        console.error('Error enviando correo: ', error);
        return false;
    }
}
