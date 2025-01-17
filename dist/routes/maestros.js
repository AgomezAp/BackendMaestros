"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const maestros_1 = require("../controllers/maestros");
const validateToken_1 = __importDefault(require("./validateToken"));
const router = (0, express_1.Router)();
router.post("/api/maestros/registrar-maestro", validateToken_1.default, maestros_1.registrarMaestro);
router.get("/api/maestros/obtener-maestros", validateToken_1.default, maestros_1.ObtenerMaestros);
router.post("/api/maestros/borrar-maestro/:Mid", validateToken_1.default, maestros_1.borrarMaestrosPorId);
router.patch("/api/maestros/actualizar-maestro/:Mid", validateToken_1.default, maestros_1.actualizarMaestro);
router.post('/api/maestros/reporte', validateToken_1.default, maestros_1.generarReporte);
router.delete('/api/maestros/reactivar-maestro/:Mid', validateToken_1.default, maestros_1.reactivarMaestro);
router.get('/api/maestros/reporte-mensual', validateToken_1.default, maestros_1.generarReporteMensual);
router.get('/api/maestros/obtenerRecordMaestros', validateToken_1.default, maestros_1.obtenerTodosLosMaestros);
router.get('/api/maestros/activos', validateToken_1.default, maestros_1.maestrosActivos);
exports.default = router;
