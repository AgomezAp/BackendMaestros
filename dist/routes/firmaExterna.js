"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const validateToken_1 = __importDefault(require("./validateToken"));
const firmaExterna_1 = require("../controllers/firmaExterna");
const router = (0, express_1.Router)();
// ==========================================
// RUTAS PÚBLICAS (sin autenticación)
// Estas rutas son accedidas por el receptor desde el correo
// ==========================================
// Obtener datos del acta por token (para mostrar al receptor)
router.get('/publica/:token', firmaExterna_1.obtenerActaPorToken);
// Firmar acta con token
router.post('/publica/:token/firmar', firmaExterna_1.firmarActaConToken);
// Rechazar/Devolver acta para corrección
router.post('/publica/:token/rechazar', firmaExterna_1.rechazarActaConToken);
// ==========================================
// RUTAS PROTEGIDAS (requieren autenticación)
// Estas rutas son usadas por el sistema interno
// ==========================================
// Enviar solicitud de firma por correo
router.post('/enviar/:id', validateToken_1.default, firmaExterna_1.enviarSolicitudFirma);
// Reenviar correo de firma
router.post('/reenviar/:id', validateToken_1.default, firmaExterna_1.reenviarCorreoFirma);
// Obtener estado de firma de un acta
router.get('/estado/:id', validateToken_1.default, firmaExterna_1.obtenerEstadoFirma);
exports.default = router;
