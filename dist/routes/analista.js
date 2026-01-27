"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const analista_1 = require("../controllers/analista");
const validateToken_1 = __importDefault(require("./validateToken"));
const router = (0, express_1.Router)();
// Rutas de analistas
router.get("/api/analistas/obtener", validateToken_1.default, analista_1.obtenerAnalistas);
router.get("/api/analistas/activos", validateToken_1.default, analista_1.obtenerAnalistasActivos);
router.get("/api/analistas/obtener/:Aid", validateToken_1.default, analista_1.obtenerAnalistaPorId);
router.post("/api/analistas/registrar", validateToken_1.default, analista_1.registrarAnalista);
router.patch("/api/analistas/actualizar/:Aid", validateToken_1.default, analista_1.actualizarAnalista);
router.patch("/api/analistas/desactivar/:Aid", validateToken_1.default, analista_1.desactivarAnalista);
router.patch("/api/analistas/reactivar/:Aid", validateToken_1.default, analista_1.reactivarAnalista);
router.delete("/api/analistas/eliminar/:Aid", validateToken_1.default, analista_1.eliminarAnalista);
exports.default = router;
