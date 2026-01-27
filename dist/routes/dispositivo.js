"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = require("../config/multer");
const dispositivo_1 = require("../controllers/dispositivo");
const validateToken_1 = __importDefault(require("./validateToken"));
const router = (0, express_1.Router)();
// Rutas específicas primero (antes de las rutas con parámetros dinámicos)
router.get('/disponibles', validateToken_1.default, dispositivo_1.obtenerDisponibles);
router.get('/estadisticas', validateToken_1.default, dispositivo_1.obtenerEstadisticas);
// Rutas con parámetros dinámicos
router.get('/', validateToken_1.default, dispositivo_1.obtenerDispositivos);
router.get('/:id/trazabilidad', validateToken_1.default, dispositivo_1.obtenerTrazabilidad);
router.get('/:id', validateToken_1.default, dispositivo_1.obtenerDispositivoPorId);
// Rutas de escritura
router.post('/', validateToken_1.default, multer_1.upload.array('fotos', 10), dispositivo_1.registrarDispositivo);
router.put('/:id', validateToken_1.default, dispositivo_1.actualizarDispositivo);
router.patch('/:id/estado', validateToken_1.default, dispositivo_1.cambiarEstadoDispositivo);
router.patch('/:id/baja', validateToken_1.default, dispositivo_1.darDeBajaDispositivo);
exports.default = router;
