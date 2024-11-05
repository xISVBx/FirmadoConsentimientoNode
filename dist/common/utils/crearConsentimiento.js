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
exports.generatePdf = generatePdf;
exports.generateEnglishPdf = generateEnglishPdf;
exports.generateStatementsPdf = generateStatementsPdf;
exports.generateStatementsEnglishPdf = generateStatementsEnglishPdf;
const pdf_lib_1 = require("pdf-lib");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const datesUtils_1 = require("./datesUtils");
const pdfUtils_1 = require("./pdfUtils");
const CustomError_1 = require("../../common/errors/CustomError");
function generatePdf(base64Data, nombreTitular, telefonoTitular, correoTitular, fechaNacimiento, nombreAgente, numeroAgente, telefonoAgente, correoAgente, consentimientoId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            //Crear la carpeta
            const folderPath = path_1.default.resolve(__dirname, `${process.env.CONSENTIMIENTO_PATH}/${consentimientoId}`);
            fs_1.default.mkdir(folderPath, { recursive: true }, (err) => {
                if (err) {
                    console.error('Error creating directory:', err);
                    throw CustomError_1.CustomError.InternalServerError(`Error creating directory: ${err}`);
                }
            });
            // Crear un nuevo documento PDF
            const pdfDoc = yield pdf_lib_1.PDFDocument.create();
            const page = pdfDoc.addPage();
            const timesRomanFont = yield pdfDoc.embedFont(pdf_lib_1.StandardFonts.TimesRoman);
            // Si el Base64 incluye un prefijo, elimínalo
            const base64Image = base64Data.replace(/^data:image\/png;base64,/, '');
            //imagebyte to embebed
            const imageBytes = Buffer.from(base64Image, 'base64');
            // Incorporar la imagen al documento PDF
            const embeddedImage = yield pdfDoc.embedPng(imageBytes);
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
                    color: (0, pdf_lib_1.rgb)(0, 0, 0),
                });
                y -= fontSize + 5; // Espacio entre líneas
            }
            // Escribir los datos en el PDF
            var lineHeight = 15;
            var initLine = 741;
            //Nombre
            page.drawText(nombreTitular, { x: 80, y: initLine, size: 12, font: timesRomanFont, color: (0, pdf_lib_1.rgb)(0, 0, 0) });
            //fecha
            page.drawText((0, datesUtils_1.convertirFecha)(fechaNacimiento), { x: 450, y: initLine, size: 12, font: timesRomanFont, color: (0, pdf_lib_1.rgb)(0, 0, 0) });
            //agente
            page.drawText(nombreAgente, { x: 180, y: initLine - (17 * 1), size: 12, font: timesRomanFont, color: (0, pdf_lib_1.rgb)(0, 0, 0) });
            //
            page.drawText(nombreAgente, { x: 290, y: initLine - (17 * 27), size: 12, font: timesRomanFont, color: (0, pdf_lib_1.rgb)(0, 0, 0) });
            //
            page.drawText(numeroAgente, { x: 290, y: initLine - (17 * 28), size: 12, font: timesRomanFont, color: (0, pdf_lib_1.rgb)(0, 0, 0) });
            //
            page.drawText(telefonoAgente, { x: 290, y: initLine - (17 * 29), size: 12, font: timesRomanFont, color: (0, pdf_lib_1.rgb)(0, 0, 0) });
            //
            page.drawText(correoAgente, { x: 290, y: initLine - (17 * 30), size: 12, font: timesRomanFont, color: (0, pdf_lib_1.rgb)(0, 0, 0) });
            //
            page.drawText(nombreTitular, { x: 290, y: initLine - (17 * 31), size: 12, font: timesRomanFont, color: (0, pdf_lib_1.rgb)(0, 0, 0) });
            //
            page.drawText(telefonoTitular, { x: 290, y: initLine - (17 * 32), size: 12, font: timesRomanFont, color: (0, pdf_lib_1.rgb)(0, 0, 0) });
            //
            page.drawText(correoTitular, { x: 290, y: initLine - (17 * 33), size: 12, font: timesRomanFont, color: (0, pdf_lib_1.rgb)(0, 0, 0) });
            //
            page.drawText((0, datesUtils_1.obtenerFechaActualDDMMYYYY)(), { x: 340, y: initLine - (17 * 35), size: 12, font: timesRomanFont, color: (0, pdf_lib_1.rgb)(0, 0, 0) });
            //Guardar imagen
            const x = 90;
            const yImage = initLine - (17 * 36);
            page.drawImage(embeddedImage, {
                x,
                y: yImage,
                width: 100,
                height: 50,
            });
            // Guardar el documento PDF como un archivo
            const filePath = path_1.default.resolve(__dirname, `${folderPath}/formulario_consentimiento.pdf`);
            const pdfBytes = yield pdfDoc.save();
            fs_1.default.writeFileSync(filePath, pdfBytes);
            return [pdfBytes, filePath];
        }
        catch (err) {
            throw CustomError_1.CustomError.InternalServerError(`${err}`);
        }
    });
}
function generateEnglishPdf(base64Data, nombreTitular, telefonoTitular, correoTitular, fechaNacimiento, nombreAgente, numeroAgente, telefonoAgente, correoAgente, consentimientoId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            //Crear la carpeta
            const folderPath = path_1.default.resolve(__dirname, `${process.env.CONSENTIMIENTO_PATH}/${consentimientoId}`);
            fs_1.default.mkdir(folderPath, { recursive: true }, (err) => {
                if (err) {
                    throw CustomError_1.CustomError.InternalServerError(`Error creating directory: ${err}`);
                }
            });
            // Crear un nuevo documento PDF
            const pdfDoc = yield pdf_lib_1.PDFDocument.create();
            const page = pdfDoc.addPage();
            const timesRomanFont = yield pdfDoc.embedFont(pdf_lib_1.StandardFonts.TimesRoman);
            const base64Image = base64Data.replace(/^data:image\/png;base64,/, '');
            const imageBytes = Buffer.from(base64Image, 'base64');
            const embeddedImage = yield pdfDoc.embedPng(imageBytes);
            const consentText = `
CONSENT AND AUTHORIZATION FORM

I, ____________________________________________________, date of birth: __________________,
hereby consent to ____________________________________ acting as my health insurance agent 
or broker on behalf of myself and my family, if applicable, for the purpose of enrolling 
in a Qualified Health Plan offered through the Federally Facilitated Marketplace (FFM). By 
accepting this arrangement, I authorize the above-named Agent to access and use the 
confidential information I provide, whether in writing, electronically, or by phone, solely
for one or more of the following purposes:

1. Searching for an existing policy in the Marketplace;
2. Completing an eligibility and enrollment application for a Qualified Health Plan through 
the Marketplace or other government insurance affordability programs, such as Medicaid, CHIP, 
or advance tax credits to assist with Marketplace premium payments;
3. Providing ongoing account maintenance and enrollment assistance as necessary; or
4. Responding to Marketplace inquiries regarding my Marketplace policy.

I understand that the Agent will not use or share my personally identifiable information (PII) 
for any purposes other than those listed above. The Agent will ensure that my PII is kept 
private and secure when collecting, storing, and using my PII for the aforementioned purposes.

I affirm that the information I provide for my Marketplace eligibility and enrollment 
application will be true and accurate to the best of my knowledge and belief. I understand that
I am not required to share additional personal or health information with my Agent beyond what 
is required in the application for eligibility and enrollment purposes.

I understand that my consent will remain in effect until I revoke it in writing. I may revoke 
or modify my consent at any time by notifying my Agent in writing and sending the 
revocation/modification letter to the Agent’s business address via USPS certified mail.

Primary writing agent’s name:                                         ____________________________________
Agent’s National Producer Number:                                ____________________________________
Phone number:                                                                 ____________________________________
Email address:                                                                  ____________________________________
Name of policyholder and/or authorized representative: ____________________________________
Phone number:                                                                 ____________________________________
Email:                                                                               ____________________________________

Signature: ____________________________________ Date: ______________________________
`;
            // Dividir el texto en líneas para ajustarse al ancho de la página
            const consentLines = consentText.split('\n');
            const { width, height } = page.getSize();
            const fontSize = 12;
            const textWidth = 500; // Ancho máximo para el texto en la página
            const margin = 50; // Margen izquierdo
            // Escribir el texto en la página
            let y = height - margin;
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
                    color: (0, pdf_lib_1.rgb)(0, 0, 0),
                });
                y -= fontSize + 5; // Espacio entre líneas
            }
            // Escribir los datos en el PDF
            var lineHeight = 15;
            var initLine = 741;
            //Nombre
            page.drawText(nombreTitular, { x: 70, y: initLine, size: 12, font: timesRomanFont, color: (0, pdf_lib_1.rgb)(0, 0, 0) });
            //fecha
            page.drawText((0, datesUtils_1.convertirFecha)(fechaNacimiento), { x: 450, y: initLine, size: 12, font: timesRomanFont, color: (0, pdf_lib_1.rgb)(0, 0, 0) });
            //agente
            page.drawText(nombreAgente, { x: 150, y: initLine - (17 * 1), size: 12, font: timesRomanFont, color: (0, pdf_lib_1.rgb)(0, 0, 0) });
            //
            page.drawText(nombreAgente, { x: 330, y: initLine - (17 * 28), size: 12, font: timesRomanFont, color: (0, pdf_lib_1.rgb)(0, 0, 0) });
            //
            page.drawText(numeroAgente, { x: 330, y: initLine - (17 * 29), size: 12, font: timesRomanFont, color: (0, pdf_lib_1.rgb)(0, 0, 0) });
            //
            page.drawText(telefonoAgente, { x: 330, y: initLine - (17 * 30), size: 12, font: timesRomanFont, color: (0, pdf_lib_1.rgb)(0, 0, 0) });
            //
            page.drawText(correoAgente, { x: 330, y: initLine - (17 * 31), size: 12, font: timesRomanFont, color: (0, pdf_lib_1.rgb)(0, 0, 0) });
            //
            page.drawText(nombreTitular, { x: 330, y: initLine - (17 * 32), size: 12, font: timesRomanFont, color: (0, pdf_lib_1.rgb)(0, 0, 0) });
            //
            page.drawText(telefonoTitular, { x: 330, y: initLine - (17 * 33), size: 12, font: timesRomanFont, color: (0, pdf_lib_1.rgb)(0, 0, 0) });
            //
            page.drawText(correoTitular, { x: 330, y: initLine - (17 * 34), size: 12, font: timesRomanFont, color: (0, pdf_lib_1.rgb)(0, 0, 0) });
            //
            page.drawText((0, datesUtils_1.obtenerFechaActualDDMMYYYY)(), { x: 355, y: initLine - (17 * 36), size: 12, font: timesRomanFont, color: (0, pdf_lib_1.rgb)(0, 0, 0) });
            //Guardar imagen
            const x = 105;
            const yImage = initLine - (17 * 37);
            page.drawImage(embeddedImage, {
                x,
                y: yImage,
                width: 100,
                height: 50,
            });
            // Guardar el documento PDF como un archivo
            const filePath = path_1.default.resolve(__dirname, `${folderPath}/formulario_consentimiento.pdf`);
            const pdfBytes = yield pdfDoc.save();
            fs_1.default.writeFileSync(filePath, pdfBytes);
            return [pdfBytes, filePath];
        }
        catch (err) {
            throw CustomError_1.CustomError.InternalServerError(`${err}`);
        }
    });
}
function generateStatementsPdf(base64Data, agente, statement) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            //Crear la carpeta
            const folderPath = path_1.default.resolve(__dirname, `${process.env.CONSENTIMIENTO_PATH}/${statement.idConsentimiento}`);
            //const folderPath = path.resolve(__dirname, `${process.env.CONSENTIMIENTO_PATH}/archivo`);
            fs_1.default.mkdir(folderPath, { recursive: true }, (err) => {
                if (err) {
                    throw CustomError_1.CustomError.InternalServerError(`Error creating directory: ${err}`);
                }
            });
            // Crear un nuevo documento PDF
            const pdfDoc = yield pdf_lib_1.PDFDocument.create();
            const page = pdfDoc.addPage();
            const timesRomanFont = yield pdfDoc.embedFont(pdf_lib_1.StandardFonts.TimesRoman);
            const base64Image = base64Data.replace(/^data:image\/png;base64,/, '');
            const imageBytes = Buffer.from(base64Image, 'base64');
            const embeddedImage = yield pdfDoc.embedPng(imageBytes);
            const consentText = `
  Verificación de información/ Afirmaciones
  
  Yo, confirmo que, a mi leal saber y entender,
  he revisado la información de la solicitud de elegibilidad y resultó ser  precisa. Qué recibí una
  explicación de las afirmaciones contenidas al final de la solicitud de elegibilidad y que doy
  permiso a mi agente/corredor para firmar la solicitud de elegibilidad en mi nombre.
  
  Código postal:
  Ingreso anual:
  Compañía:
  Plan:
  
  Afirmaciones explicadas:
  1. Al presentar esta solicitud, acepto el uso de mi información y otorgo consentimiento para 
  que otros incluidos en la solicitud permitan el uso de sus datos obtenidos de diversas fuentes.
  2. Comprendo la obligación de proporcionar información veraz y la posibilidad de tener que 
  enviar pruebas para soportar la solicitud de elegibilidad, con penalizaciones por incumplimiento.
  3. Permito que el Mercado utilice datos de ingresos durante los próximos 5 años para determinar 
  mi elegibilidad para asistencia en la cobertura de salud, con la opción de optar por no participar.
  4. Si alguien en la solicitud tiene cobertura tanto en el Mercado como en Medicare, la cobertura 
  del plan del Mercado se terminará con previo aviso.
  5. Debo informar al programa de cualquier cambio en la solicitud, lo que podría afectar la 
  elegibilidad de los miembros del hogar.
  6. La elegibilidad para un crédito fiscal para la prima no está disponible si tengo otra cobertura 
  de salud calificada.
  7. Si llego a ser elegible para otra cobertura de salud calificada, debo dar de baja mi cobertura 
  en el Mercado y el crédito fiscal para la prima.
  8. Estoy obligado a presentar una declaración de impuestos federales, presentarla conjuntamente si 
  estoy casado, no ser reclamado como dependiente y listar a los dependientes que reciben cobertura 
  pagada en parte o en su totalidad con anticipos del crédito fiscal premium.
  9. Mi ingreso se comparará entre la declaración de impuestos y la solicitud, lo que afectará el 
  crédito fiscal para la prima.
  10. Reconozco que estoy firmando bajo pena de perjurio y las consecuencias legales de proporcionar 
  información falsa.
  
  Fecha de revisión:
  Hora de la revisión:
  Nombre del consumidor/representante autorizado:
  Firma del consumidor/representante autorizado:
  Agente/Corredor que brinda asistencia:
  `;
            // Dividir el texto en líneas para ajustarse al ancho de la página
            const consentLines = consentText.split('\n');
            const { width, height } = page.getSize();
            const fontSize = 12;
            const textWidth = 500; // Ancho máximo para el texto en la página
            const margin = 50; // Margen izquierdo
            // Escribir el texto en la página
            let y = height - margin;
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
                    color: (0, pdf_lib_1.rgb)(0, 0, 0),
                });
                y -= fontSize + 5; // Espacio entre líneas
            }
            // Escribir los datos en el PDF
            var lineHeight = 15;
            var initLine = 741;
            const drawText = (text, x, y, underline = false) => {
                if (underline) {
                    page.drawText(text, { x, y: initLine - (17 * y), size: 12, font: timesRomanFont, color: (0, pdf_lib_1.rgb)(0, 0, 0) });
                }
                else {
                    (0, pdfUtils_1.drawUnderlinedText)({ text, fontSize: 12, page, x, y: initLine - (17 * y) });
                }
            };
            //Codigo postal
            drawText(agente.codigoPostal, 130, 5);
            //Ingreso anual
            drawText(agente.ingresoAnual.toString(), 130, 6);
            //Compañia
            drawText(agente.compania, 130, 7);
            //Plan
            drawText(agente.plan, 130, 8);
            //Fecha de revision
            drawText((0, datesUtils_1.obtenerFechaActualDDMMYYYY)(), 300, 33);
            //Hora de la revision
            drawText((0, datesUtils_1.getCurrentHour)(), 300, 34);
            //Nombre del cosumidor
            drawText(statement.nombreConsumidor, 300, 35);
            //Firma del consumirdor
            //drawText(nombreTitular, 330, 36);
            //Agente
            drawText(agente.nombreAgente, 300, 37);
            //Guardar imagen
            const x = 300;
            const yImage = initLine - (17 * 37);
            page.drawImage(embeddedImage, {
                x,
                y: yImage + 5,
                width: 100,
                height: 20,
            });
            // Guardar el documento PDF como un archivo
            const filePath = path_1.default.resolve(__dirname, `${folderPath}/formulario_consentimiento.pdf`);
            const pdfBytes = yield pdfDoc.save();
            fs_1.default.writeFileSync(filePath, pdfBytes);
            return [pdfBytes, filePath];
        }
        catch (err) {
            throw CustomError_1.CustomError.InternalServerError(`${err}`);
        }
    });
}
function generateStatementsEnglishPdf(base64Data, agente, statement, consentimientoId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            //Crear la carpeta
            const folderPath = path_1.default.resolve(__dirname, `${process.env.CONSENTIMIENTO_PATH}/${consentimientoId}`);
            fs_1.default.mkdir(folderPath, { recursive: true }, (err) => {
                if (err) {
                    throw CustomError_1.CustomError.InternalServerError(`Error creating directory: ${err}`);
                }
            });
            // Crear un nuevo documento PDF
            const pdfDoc = yield pdf_lib_1.PDFDocument.create();
            const page = pdfDoc.addPage();
            const timesRomanFont = yield pdfDoc.embedFont(pdf_lib_1.StandardFonts.TimesRoman);
            const base64Image = base64Data.replace(/^data:image\/png;base64,/, '');
            const imageBytes = Buffer.from(base64Image, 'base64');
            const embeddedImage = yield pdfDoc.embedPng(imageBytes);
            const consentText = `
  Information Verification / Statements
  
  I hereby confirm that, to the best of my knowledge and understanding, I have reviewed the information
  in the eligibility application, and it has proven to be accurate. I have received an explanation of the
  statements included at the end of the eligibility application and authorized my agent/broker to sign the
  eligibility application on my behalf.

  Postal Code:
  Annual Income:
  Company:
  Plan:

  Statements Explained:
  1. By submitting this application, I agree to the use of my information and consent to others listed on the
  application allowing the use of their data obtained from various sources.
  2. I understand the obligation to provide truthful information and the possibility that I may need to submit
  supporting documentation for eligibility, with penalties for non-compliance.
  3. I authorize the Marketplace to use income data over the next 5 years to determine my eligibility for
  health coverage assistance, with the option to opt out.
  4. If anyone on the application is enrolled in both Marketplace coverage and Medicare, the Marketplace
  plan coverage will be terminated with prior notice.
  5. I am required to inform the program of any changes in the application that may affect the eligibility of
  household members.
  6. Eligibility for a premium tax credit is not available if I have other qualifying health coverage.
  7. If I become eligible for other qualifying health coverage, I must terminate my Marketplace coverage
  and the premium tax credit.
  8. I am required to file a federal tax return, file jointly if married, not be claimed as a dependent, and list
  dependents who receive coverage partially or fully funded with premium tax credit advances.
  9. My income will be compared between the tax return and the application, impacting the premium tax
  credit.
  10. I acknowledge that I am signing under penalty of perjury and am aware of the legal consequences of
  providing false information.

  Review Date:
  Review Time:
  Consumer/Authorized Representative Name:
  Consumer/Authorized Representative Signature:
  Agent/Broker Providing Assistance:
  `;
            // Dividir el texto en líneas para ajustarse al ancho de la página
            const consentLines = consentText.split('\n');
            const { width, height } = page.getSize();
            const fontSize = 12;
            const textWidth = 500; // Ancho máximo para el texto en la página
            const margin = 50; // Margen izquierdo
            // Escribir el texto en la página
            let y = height - margin;
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
                    color: (0, pdf_lib_1.rgb)(0, 0, 0),
                });
                y -= fontSize + 5; // Espacio entre líneas
            }
            // Escribir los datos en el PDF
            var lineHeight = 15;
            var initLine = 741;
            const drawText = (text, x, y, underline = false) => {
                if (underline) {
                    page.drawText(text, { x, y: initLine - (17 * y), size: 12, font: timesRomanFont, color: (0, pdf_lib_1.rgb)(0, 0, 0) });
                }
                else {
                    (0, pdfUtils_1.drawUnderlinedText)({ text, fontSize: 12, page, x, y: initLine - (17 * y) });
                }
            };
            //Codigo postal
            drawText(agente.codigoPostal, 130, 5);
            //Ingreso anual
            drawText(agente.ingresoAnual.toString(), 130, 6);
            //Compañia
            drawText(agente.compania, 130, 7);
            //Plan
            drawText(agente.plan, 130, 8);
            //Fecha de revision
            drawText((0, datesUtils_1.obtenerFechaActualDDMMYYYY)(), 300, 31);
            //Hora de la revision
            drawText((0, datesUtils_1.getCurrentHour)(), 300, 32);
            //Nombre del cosumidor
            drawText(statement.nombreConsumidor, 300, 33);
            //Firma del consumirdor
            //drawText(nombreTitular, 330, 36);
            //Agente
            drawText(agente.nombreAgente, 300, 35);
            //Guardar imagen
            const x = 300;
            const yImage = initLine - (17 * 34);
            page.drawImage(embeddedImage, {
                x,
                y: yImage - 10,
                width: 100,
                height: 20,
            });
            // Guardar el documento PDF como un archivo
            const filePath = path_1.default.resolve(__dirname, `${folderPath}/formulario_consentimiento.pdf`);
            const pdfBytes = yield pdfDoc.save();
            fs_1.default.writeFileSync(filePath, pdfBytes);
            return [pdfBytes, filePath];
        }
        catch (err) {
            throw CustomError_1.CustomError.InternalServerError(`${err}`);
        }
    });
}
