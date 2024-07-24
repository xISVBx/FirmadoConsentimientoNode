import multer from 'multer';
import path from 'path';

// Configurar el middleware de multer para cargar imágenes
const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, process.env.UPLOADS_FOLDER ?? './uploads'); // Carpeta de destino para las imágenes
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

export default upload;
