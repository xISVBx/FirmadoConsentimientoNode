import { rgb, PDFPage, RGB, PDFFont } from 'pdf-lib';

export function drawUnderlinedText({
    page,
    text,
    x,
    y,
    fontSize,
    color = rgb(0, 0, 0),
    underlineOffset = 2,
    underlineThickness = 1,
    font
}: {
    page: PDFPage;
    text: string;
    x: number;
    y: number;
    fontSize: number;
    color?: RGB;
    underlineOffset?: number;
    underlineThickness?: number;
    font?: PDFFont
}): void {
    // Draw the text
    page.drawText(text, {
        x,
        y,
        size: fontSize,
        color,
        font
    });

    // Calculate underline width based on the text width
    //const textWidth = page.getTextWidth(text, fontSize);

    // Draw the underline
    page.drawLine({
        start: { x, y: y - underlineOffset },
        end: { x: x + 100, y: y - underlineOffset },
        thickness: underlineThickness,
        color,
    });
}