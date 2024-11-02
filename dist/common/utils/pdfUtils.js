"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.drawUnderlinedText = drawUnderlinedText;
const pdf_lib_1 = require("pdf-lib");
function drawUnderlinedText({ page, text, x, y, fontSize, color = (0, pdf_lib_1.rgb)(0, 0, 0), underlineOffset = 2, underlineThickness = 1, font }) {
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
