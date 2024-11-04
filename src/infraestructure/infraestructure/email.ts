import nodemailer from 'nodemailer';

export async function enviarCorreo(destinatario: string[], asunto: string, texto: string,
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
        const info = await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Error enviando correo: ', error);
        return false;
    }
}

export async function enviarFormularioCorreo(destinatario: string, asunto: string, token: string): Promise<boolean> {

    const transporter = nodemailer.createTransport({
        host: 'jecopainsurance.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
    const link = `https://www.jecopainsurance.com/consentimiento/?token=${token}`
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
        <h4 class="text">Acción requerida.</h4>
        <h4 class="text">Requerimos su autorización para actuar como su agente o corredor de seguros de salud, con el fin de inscribirlo en un plan de salud calificado ofrecido en el mercado y facilitado por el gobierno federal.</h4>
        <div class="center">
            <a href="${link}" class="button">Rellenar Formulario</a>
        </div>

    </div>
</body>
</html>
`
    const mailOptions: nodemailer.SendMailOptions = {
        from: process.env.EMAIL_USER,
        to: destinatario,
        subject: asunto,
        html,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        return false;
    }
}

export async function enviarFormularioAfirmacionesCorreo(destinatario: string, asunto: string, token: string): Promise<boolean> {
    const transporter = nodemailer.createTransport({
        host: 'jecopainsurance.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
    const link = `https://www.jecopainsurance.com/afirmaciones/?token=${token}`
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
        <h4 class="text">Acción requerida.</h4>
        <h4 class="text">Requerimos su autorización para actuar como su agente o corredor de seguros de salud, con el fin de inscribirlo en un plan de salud calificado ofrecido en el mercado y facilitado por el gobierno federal.</h4>
        <div class="center">
            <a href="${link}" class="button">Rellenar Formulario</a>
        </div>

    </div>
</body>
</html>
`
    const mailOptions: nodemailer.SendMailOptions = {
        from: process.env.EMAIL_USER,
        to: destinatario,
        subject: asunto,
        html,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        return false;
    }
}