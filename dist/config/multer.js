"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePhoto = exports.getPhotoUrl = exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Crear directorio de uploads si no existe
const uploadDir = path_1.default.join(__dirname, '../../uploads');
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
// Configuración de almacenamiento
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        // Crear subdirectorios por tipo de upload
        const tipo = req.body.tipoUpload || 'general';
        const dir = path_1.default.join(uploadDir, tipo);
        if (!fs_1.default.existsSync(dir)) {
            fs_1.default.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        // Nombre único: timestamp-originalname
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path_1.default.extname(file.originalname);
        cb(null, uniqueSuffix + ext);
    }
});
// Filtro de archivos (solo imágenes)
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error('Solo se permiten archivos de imagen (JPEG, PNG, GIF, WEBP)'));
    }
};
// Configuración de Multer
exports.upload = (0, multer_1.default)({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB máximo por archivo
        files: 10 // Máximo 10 archivos por request
    }
});
// Función helper para obtener URL de foto
const getPhotoUrl = (filename, tipo = 'general') => {
    return `/uploads/${tipo}/${filename}`;
};
exports.getPhotoUrl = getPhotoUrl;
// Función helper para eliminar foto
const deletePhoto = (filepath) => {
    const fullPath = path_1.default.join(__dirname, '../..', filepath);
    if (fs_1.default.existsSync(fullPath)) {
        fs_1.default.unlinkSync(fullPath);
    }
};
exports.deletePhoto = deletePhoto;
