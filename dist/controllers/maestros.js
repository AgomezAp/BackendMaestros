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
exports.obtenerTodosLosMaestros = exports.generarReporteMensual = exports.generarReporte = exports.actualizarMaestro = exports.borrarMaestrosPorId = exports.ObtenerMaestrPorId = exports.ObtenerMaestros = exports.registrarMaestro = void 0;
const sequelize_1 = require("sequelize");
const maestroBorrado_1 = require("../models/maestroBorrado");
const maestros_1 = require("../models/maestros");
const movimientoMaestro_1 = require("../models/movimientoMaestro");
const registrarMaestro = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { nombre, apellido, correo, cedula, firma, descripcion, estado, Uid } = req.body;
    try {
        const maestroExistente = yield maestros_1.Maestro.findOne({
            where: {
                [sequelize_1.Op.or]: [{ correo }, { cedula }]
            }
        });
        if (maestroExistente) {
            return res.status(400).json({
                msg: 'El maestro ya está registrado con el correo o cédula proporcionados',
            });
        }
        // Crear el nuevo maestro
        const maestro = yield maestros_1.Maestro.create({
            nombre,
            apellido,
            correo,
            cedula,
            firma,
            descripcion,
            estado,
            Uid,
        });
        yield movimientoMaestro_1.MovimientoMaestro.create({
            Mid: maestro.Mid,
            tipoMovimiento: 'CREACION',
        });
        res.status(200).json({
            message: "Maestro registrado con éxito",
            maestro: maestro,
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            error: "Problemas al registrar el maestro",
            message: err.message || err,
        });
    }
});
exports.registrarMaestro = registrarMaestro;
const ObtenerMaestros = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const listaMaestro = yield maestros_1.Maestro.findAll();
    res.status(200).json({
        maestros: listaMaestro,
    });
});
exports.ObtenerMaestros = ObtenerMaestros;
const ObtenerMaestrPorId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { Mid } = req.params;
    try {
        const maestro = yield maestros_1.Maestro.findByPk(Mid);
        if (!maestro) {
            return res.status(404).json({
                message: `No existe el maestro con el id: ${Mid}`,
            });
        }
        res.status(200).json({
            message: `Maestro con ID ${Mid} encontrado`,
            maestro,
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            error: "Problemas al obtener el maestro",
            message: err.message || err,
        });
    }
});
exports.ObtenerMaestrPorId = ObtenerMaestrPorId;
const borrarMaestrosPorId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { Mid } = req.params;
    try {
        const maestro = yield maestros_1.Maestro.findByPk(Mid);
        if (!maestro) {
            return res.status(404).json({
                message: `No existe el maestro con el id: ${Mid}`,
            });
        }
        yield maestroBorrado_1.maestroBorrado.create({
            Mid: maestro.Mid,
            nombre: maestro.nombre,
            apellido: maestro.apellido,
            correo: maestro.correo,
            cedula: maestro.cedula,
            firma: maestro.firma,
            descripcion: maestro.descripcion,
            Uid: maestro.Uid,
            estado: 'INACTIVO',
            deletedAt: new Date(),
        });
        yield movimientoMaestro_1.MovimientoMaestro.create({
            Mid: maestro.Mid,
            tipoMovimiento: 'ELIMINACION',
        });
        yield maestros_1.Maestro.destroy({ where: { Mid } });
        res.status(200).json({
            message: `Maestro con ID ${Mid} eliminado`,
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            error: "Problemas al obtener el maestro",
            message: err.message || err,
        });
    }
});
exports.borrarMaestrosPorId = borrarMaestrosPorId;
const actualizarMaestro = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { Mid } = req.params;
    const { nombre, apellido, correo, cedula, firma, descripcion } = req.body;
    try {
        const maestro = yield maestros_1.Maestro.findByPk(Mid);
        if (!maestro) {
            return res.status(404).json({
                message: `No existe el maestro con el id: ${Mid}`,
            });
        }
        yield maestros_1.Maestro.update({
            nombre,
            apellido,
            correo,
            cedula,
            firma,
            descripcion,
        }, { where: { Mid } });
        res.status(200).json({
            message: `Maestro con ID ${Mid} actualizado`,
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            error: 'Problemas al actualizar el maestro',
            message: err.message || err,
        });
    }
});
exports.actualizarMaestro = actualizarMaestro;
const generarReporte = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { fechaInicio, fechaFin } = req.query;
    try {
        const movimientos = yield movimientoMaestro_1.MovimientoMaestro.findAll({
            where: {
                fechaMovimiento: {
                    [sequelize_1.Op.between]: [new Date(fechaInicio), new Date(fechaFin)],
                },
            },
        });
        res.status(200).json({
            message: 'Reporte generado con éxito',
            movimientos: movimientos,
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            error: 'Problemas al generar el reporte',
            message: err.message || err,
        });
    }
});
exports.generarReporte = generarReporte;
const generarReporteMensual = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { mes, año } = req.query;
    try {
        const fechaInicio = new Date(Number(año), Number(mes) - 1, 1);
        const fechaFin = new Date(Number(año), Number(mes), 0);
        const movimientos = yield movimientoMaestro_1.MovimientoMaestro.findAll({
            where: {
                fechaMovimiento: {
                    [sequelize_1.Op.between]: [fechaInicio, fechaFin],
                },
            },
        });
        res.status(200).json({
            message: 'Reporte mensual generado con éxito',
            movimientos: movimientos,
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            error: 'Problemas al generar el reporte mensual',
            message: err.message || err,
        });
    }
});
exports.generarReporteMensual = generarReporteMensual;
const obtenerTodosLosMaestros = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Obtener maestros activos
        const maestrosActivos = yield maestros_1.Maestro.findAll();
        // Obtener maestros inactivos
        const maestrosInactivos = yield maestroBorrado_1.maestroBorrado.findAll();
        // Combinar los resultados
        const todosLosMaestros = [...maestrosActivos, ...maestrosInactivos];
        res.status(200).json({
            message: 'Lista de todos los maestros (activos e inactivos)',
            maestros: todosLosMaestros,
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            error: 'Problemas al obtener la lista de maestros',
            message: err.message || err,
        });
    }
});
exports.obtenerTodosLosMaestros = obtenerTodosLosMaestros;
