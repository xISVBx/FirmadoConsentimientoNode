import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

export async function generatePdf(base64Image: string, nombreTitular: string, telefonoTitular: string, correoTitular: string, fechaNacimiento: string,
  nombreAgente: string, numeroAgente: string, telefonoAgente: string, correoAgente: string, consentimientoId: string): Promise<Uint8Array> {

  //Crear la carpeta
  const folderPath = path.resolve(__dirname, `${process.env.CONSENTIMIENTOS_PATH}/${consentimientoId}`);
  fs.mkdir(folderPath, { recursive: true }, (err) => {
    if (err) {
      console.error('Error creating directory:', err);
    } else {
      console.log(`Directory created successfully! ${folderPath}`);
    }
  });

  // Crear un nuevo documento PDF
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage();
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);

  //imagebyte to embebed
  const imageBytes = Buffer.from(base64Image, 'base64')
  // Incorporar la imagen al documento PDF
  const embeddedImage = await pdfDoc.embedPng(imageBytes);
  // Definir el contenido del formulario
  const consentText = `
    FORMULARIO DE CONSENTIMIENTO Y AUTORIZACIÓN

    Yo, _____________________________________________ fecha de nacimiento: __________________
    doy mi consentimiento a _________________________________________ para que actúe como agente o
    corredor de seguros de salud para mí y para toda mi familia, si corresponde, con el fin de inscribirme en un
    Plan de Salud Calificado que se ofrece en el Mercado facilitado por el Gobierno Federal (FFM, por sus
    siglas en inglés). Al aceptar este acuerdo, autorizo al Agente mencionado anteriormente a ver y utilizar la
    información confidencial proporcionada por mí por escrito, electrónicamente o por teléfono solo para los
    fines de uno o más de los siguientes:
    1. Búsqueda de una póliza existente en el Mercado;
    2. Completar una solicitud de elegibilidad e inscripción en un Plan de Salud Calificado del Mercado u
    otros programas gubernamentales de asequibilidad de seguros, como Medicaid y CHIP o créditos fiscales
    anticipados para ayudar a pagar las primas del Mercado;
    3. Brindar mantenimiento continuo de la cuenta y asistencia para la inscripción, según sea necesario; o
    4. Responder a consultas del Mercado con respecto a mi póliza del Mercado.

    Entiendo que el Agente no usará ni compartirá mi información de identificación personal (PII, por sus
    siglas en inglés) para fines distintos a los enumerados anteriormente. El Agente se asegurará de que mi PII
    se mantenga privada y segura cuando recopilar, almacenar y usar mi PII para los fines mencionados
    anteriormente.

    Confirmo que la información que proporciono para ingresar en mi solicitud de inscripción y elegibilidad
    del Mercado será verdadera según mi leal saber y entender. Entiendo que no tengo que compartir
    información personal adicional sobre mí o mi salud con mi Agente, más allá de lo que se requiere en la
    solicitud para propósitos de elegibilidad e inscripción. Entiendo que mi consentimiento permanecerá
    vigente hasta que yo lo revoque por escrito. Puedo revocar o modificar mi consentimiento en cualquier
    momento informando a mi agente por escrito y enviando la carta de revocación/modificación a la dirección
    comercial del agente por correo certificado de USPS.

    Nombre del agente de escritura principal:            ____________________________________
    Número de Productor Nacional del agente:          ____________________________________
    Número de teléfono:                                             ____________________________________
    Dirección de correo electrónico:                           ____________________________________
    Nombre del titular y/o representante autorizado:  ____________________________________
    Número de teléfono:                                              ____________________________________
    Correo electrónico:                                                ____________________________________

    Firma: ____________________________________ Fecha: _______________________________
  `;

  // Dividir el texto en líneas para ajustarse al ancho de la página
  const consentLines = consentText.split('\n');

  const { width, height } = page.getSize();
  const fontSize = 12;
  const textWidth = 500; // Ancho máximo para el texto en la página
  const margin = 50; // Margen izquierdo

  // Escribir el texto en la página
  let y = height - margin;
  console.log(y)
  for (const line of consentLines) {
    if (y < margin) {
      // Agregar una nueva página si el texto no cabe en la página actual
      const newPage = pdfDoc.addPage();
      y = newPage.getHeight() - margin;
    }
    page.drawText(line.trim(), {
      x: margin,
      y,
      size: fontSize,
      font: timesRomanFont,
      color: rgb(0, 0, 0),
    });
    y -= fontSize + 5; // Espacio entre líneas
  }

  // Definir los datos a agregar al PDF (Estos son ejemplos, deberás adaptarlos a tus necesidades)
  const formData = {
    nombre: 'Juan Pérez',
    fechaNacimiento: '01/01/1980',
    agente: 'Agente X',
    numeroAgente: '123456',
    telefonoAgente: '555-123-4567',
    emailAgente: 'agente@example.com',
    nombreRepresentante: 'Ana Pérez',
    telefonoRepresentante: '555-987-6543',
    emailRepresentante: 'ana.perez@example.com',
    firma: 'Juan Pérez',
    fechaFirma: '23/07/2024',
  };

  // Escribir los datos en el PDF
  var lineHeight = 15
  var initLine = 741
  //Nombre
  page.drawText(nombreTitular, { x: 80, y: initLine, size: 12, font: timesRomanFont, color: rgb(0, 0, 0) });
  //fecha
  page.drawText(fechaNacimiento, { x: 450, y: initLine, size: 12, font: timesRomanFont, color: rgb(0, 0, 0) });
  //agente
  page.drawText(nombreAgente, { x: 180, y: initLine - (17 * 1), size: 12, font: timesRomanFont, color: rgb(0, 0, 0) });
  //
  page.drawText(nombreAgente, { x: 290, y: initLine - (17 * 27), size: 12, font: timesRomanFont, color: rgb(0, 0, 0) });
  //
  page.drawText(numeroAgente, { x: 290, y: initLine - (17 * 28), size: 12, font: timesRomanFont, color: rgb(0, 0, 0) });
  //
  page.drawText(telefonoAgente, { x: 290, y: initLine - (17 * 29), size: 12, font: timesRomanFont, color: rgb(0, 0, 0) });
  //
  page.drawText(correoAgente, { x: 290, y: initLine - (17 * 30), size: 12, font: timesRomanFont, color: rgb(0, 0, 0) });
  //
  page.drawText(nombreTitular, { x: 290, y: initLine - (17 * 31), size: 12, font: timesRomanFont, color: rgb(0, 0, 0) });
  //
  page.drawText(telefonoTitular, { x: 290, y: initLine - (17 * 32), size: 12, font: timesRomanFont, color: rgb(0, 0, 0) });
  //
  page.drawText(correoTitular, { x: 290, y: initLine - (17 * 33), size: 12, font: timesRomanFont, color: rgb(0, 0, 0) });
  //
  page.drawText(`Fecha de Firma: ${formData.fechaFirma}`, { x: 340, y: initLine - (17 * 35), size: 12, font: timesRomanFont, color: rgb(0, 0, 0) });
  //Guardar imagen
  const x: number = 90
  const yImage: number = initLine - (17 * 36)

  page.drawImage(embeddedImage, {
    x,
    y: yImage,
    width: 100,
    height: 50,
  });
  // Guardar el documento PDF como un archivo

  const filePath = path.resolve(__dirname, `${folderPath}/formulario_consentimiento.pdf`);
  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(filePath, pdfBytes);
  return pdfBytes;
}
