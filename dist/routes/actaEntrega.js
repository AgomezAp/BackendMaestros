"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = require("../config/multer");
const actaEntrega_1 = require("../controllers/actaEntrega");
const validateToken_1 = __importDefault(require("./validateToken"));
const router = (0, express_1.Router)();
// Obtener actas
router.get('/', validateToken_1.default, actaEntrega_1.obtenerActas);
router.get('/activas', validateToken_1.default, actaEntrega_1.obtenerActasActivas);
router.get('/:id', validateToken_1.default, actaEntrega_1.obtenerActaPorId);
router.get('/historial/:dispositivoId', validateToken_1.default, actaEntrega_1.obtenerHistorialDispositivo);
// Crear acta de entrega con fotos
router.post('/', validateToken_1.default, multer_1.upload.any(), actaEntrega_1.crearActaEntrega);
// Registrar devolución
router.post('/:id/devolucion', validateToken_1.default, multer_1.upload.any(), actaEntrega_1.registrarDevolucion);
exports.default = router;
