import nodemailer from 'nodemailer';

export async function enviarCorreo(destinatario: string, asunto: string, texto: string,
    html: string, fileName: string, uint8Array: Uint8Array): Promise<boolean> {

    const transporter = nodemailer.createTransport({
        host: 'jecopainsurance.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const pdfBytes = Buffer.from(uint8Array);

    const mailOptions: nodemailer.SendMailOptions = {
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
        const info = await transporter.sendMail(mailOptions);
        console.log('Correo enviado: %s', info.messageId);
        return true;
    } catch (error) {
        console.error('Error enviando correo: ', error);
        return false;
    }
}
