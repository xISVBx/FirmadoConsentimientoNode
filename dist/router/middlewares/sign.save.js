"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
// Configurar el middleware de multer para cargar imágenes
const upload = (0, multer_1.default)({
    storage: multer_1.default.diskStorage({
        destination: function (req, file, cb) {
            var _a;
            cb(null, (_a = process.env.UPLOADS_FOLDER) !== null && _a !== void 0 ? _a : './uploads'); // Carpeta de destino para las imágenes
        },
        filename: function (req, file, cb) {
            cb(null, file.originalname); // Utiliza el nombre original del archivo
        }
    }),
    fileFilter: function (req, file, cb) {
        // Aceptar solo archivos de imagen (JPEG, PNG, GIF, BMP)
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|bmp)$/)) {
            return cb(new Error('Solo se permiten archivos de imagen JPEG, PNG, GIF o BMP'));
        }
        cb(null, true);
    }
});
exports.default = upload;
