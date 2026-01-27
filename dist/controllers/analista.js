"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.eliminarAnalista = exports.reactivarAnalista = exports.desactivarAnalista = exports.actualizarAnalista = exports.registrarAnalista = exports.obtenerAnalistaPorId = exports.obtenerAnalistasActivos = exports.obtenerAnalistas = void 0;
const analista_1 = require("../models/analista");
// Obtener todos los analistas
const obtenerAnalistas = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const analistas = yield analista_1.Analista.findAll({
            order: [['nombre', 'ASC']],
        });
        res.status(200).json({
            analistas,
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            error: "Problemas al obtener los analistas",
            message: err.message || err,
        });
    }
});
exports.obtenerAnalistas = obtenerAnalistas;
// Obtener analistas activos
const obtenerAnalistasActivos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const analistas = yield analista_1.Analista.findAll({
            where: { activo: true },
            order: [['nombre', 'ASC']],
        });
        res.status(200).json({
            analistas,
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            error: "Problemas al obtener los analistas activos",
            message: err.message || err,
        });
    }
});
exports.obtenerAnalistasActivos = obtenerAnalistasActivos;
// Obtener analista por ID
const obtenerAnalistaPorId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { Aid } = req.params;
    try {
        const analista = yield analista_1.Analista.findByPk(Aid);
        if (!analista) {
            return res.status(404).json({
                message: `No existe el analista con el id: ${Aid}`,
            });
        }
        res.status(200).json({
            message: `Analista con ID ${Aid} encontrado`,
            analista,
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            error: "Problemas al obtener el analista",
            message: err.message || err,
        });
    }
});
exports.obtenerAnalistaPorId = obtenerAnalistaPorId;
// Registrar nuevo analista
const registrarAnalista = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { nombre, apellido, cedula, telefono, correo, cargo } = req.body;
    try {
        // Verificar si ya existe un analista con esa cédula
        const analistaExistente = yield analista_1.Analista.findOne({ where: { cedula } });
        if (analistaExistente) {
            return res.status(400).json({
                error: `Ya existe un analista con la cédula: ${cedula}`,
            });
        }
        const analista = yield analista_1.Analista.create({
            nombre,
            apellido,
            cedula,
            telefono,
            correo,
            cargo: cargo || 'Analista',
            activo: true,
        });
        res.status(200).json({
            message: "Analista registrado con éxito",
            analista,
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            error: "Problemas al registrar el analista",
            message: err.message || err,
        });
    }
});
exports.registrarAnalista = registrarAnalista;
// Actualizar analista
const actualizarAnalista = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { Aid } = req.params;
    const { nombre, apellido, cedula, telefono, correo, cargo, activo } = req.body;
    try {
        const analista = yield analista_1.Analista.findByPk(Aid);
        if (!analista) {
            return res.status(404).json({
                message: `No existe el analista con el id: ${Aid}`,
            });
        }
        yield analista_1.Analista.update({
            nombre,
            apellido,
            cedula,
            telefono,
            correo,
            cargo,
            activo,
        }, { where: { Aid } });
        res.status(200).json({
            message: `Analista con ID ${Aid} actualizado`,
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            error: "Problemas al actualizar el analista",
            message: err.message || err,
        });
    }
});
exports.actualizarAnalista = actualizarAnalista;
// Desactivar analista
const desactivarAnalista = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { Aid } = req.params;
    try {
        const analista = yield analista_1.Analista.findByPk(Aid);
        if (!analista) {
            return res.status(404).json({
                message: `No existe el analista con el id: ${Aid}`,
            });
        }
        yield analista_1.Analista.update({ activo: false }, { where: { Aid } });
        res.status(200).json({
            message: `Analista con ID ${Aid} desactivado`,
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            error: "Problemas al desactivar el analista",
            message: err.message || err,
        });
    }
});
exports.desactivarAnalista = desactivarAnalista;
// Reactivar analista
const reactivarAnalista = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { Aid } = req.params;
    try {
        const analista = yield analista_1.Analista.findByPk(Aid);
        if (!analista) {
            return res.status(404).json({
                message: `No existe el analista con el id: ${Aid}`,
            });
        }
        yield analista_1.Analista.update({ activo: true }, { where: { Aid } });
        res.status(200).json({
            message: `Analista con ID ${Aid} reactivado`,
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            error: "Problemas al reactivar el analista",
            message: err.message || err,
        });
    }
});
exports.reactivarAnalista = reactivarAnalista;
// Eliminar analista (solo si no tiene celulares asignados)
const eliminarAnalista = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { Aid } = req.params;
    try {
        const analista = yield analista_1.Analista.findByPk(Aid);
        if (!analista) {
            return res.status(404).json({
                message: `No existe el analista con el id: ${Aid}`,
            });
        }
        // Verificar si tiene celulares asignados
        const celularesAsignados = yield maestros_1.Maestro.count({ where: { Aid, estado: 'en_uso' } });
        if (celularesAsignados > 0) {
            return res.status(400).json({
                error: `No se puede eliminar el analista porque tiene ${celularesAsignados} celular(es) asignado(s)`,
            });
        }
        yield analista_1.Analista.destroy({ where: { Aid } });
        res.status(200).json({
            message: `Analista con ID ${Aid} eliminado`,
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            error: "Problemas al eliminar el analista",
            message: err.message || err,
        });
    }
});
exports.eliminarAnalista = eliminarAnalista;
// Importar Maestro para la verificación
const maestros_1 = require("../models/maestros");
