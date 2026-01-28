"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const validateToken_1 = __importDefault(require("./validateToken"));
const multer_1 = require("../config/multer");
const actaDevolucion_1 = require("../controllers/actaDevolucion");
const router = (0, express_1.Router)();
// ==========================================
// RUTAS PÚBLICAS (sin autenticación)
// Accedidas por el receptor desde el correo
// ==========================================
// Obtener datos del acta por token (para mostrar al receptor)
router.get('/publica/:token', actaDevolucion_1.obtenerActaDevolucionPorToken);
// Firmar acta con token
router.post('/publica/:token/firmar', actaDevolucion_1.firmarActaDevolucionConToken);
// Rechazar acta con token
router.post('/publica/:token/rechazar', actaDevolucion_1.rechazarActaDevolucionConToken);
// ==========================================
// RUTAS PROTEGIDAS (requieren autenticación)
// ==========================================
// Obtener dispositivos entregados (disponibles para devolución)
router.get('/dispositivos-entregados', validateToken_1.default, actaDevolucion_1.obtenerDispositivosEntregados);
// Obtener todas las actas de devolución
router.get('/', validateToken_1.default, actaDevolucion_1.obtenerActasDevolucion);
// Obtener acta por ID
router.get('/:id', validateToken_1.default, actaDevolucion_1.obtenerActaDevolucionPorId);
// Crear nueva acta de devolución
router.post('/', validateToken_1.default, multer_1.upload.any(), actaDevolucion_1.crearActaDevolucion);
// Enviar solicitud de firma por correo
router.post('/enviar-firma/:id', validateToken_1.default, actaDevolucion_1.enviarSolicitudFirmaDevolucion);
// Reenviar correo de firma
router.post('/reenviar-firma/:id', validateToken_1.default, actaDevolucion_1.reenviarCorreoDevolucion);
exports.default = router;
