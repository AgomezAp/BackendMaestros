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
exports.obtenerTodosLosMaestros = exports.reactivarMaestro = exports.generarReporteMensual = exports.generarReporte = exports.maestrosActivos = exports.actualizarMaestro = exports.borrarMaestrosPorId = exports.ObtenerMaestrPorId = exports.ObtenerMaestros = exports.registrarMaestro = void 0;
const sequelize_1 = require("sequelize");
const maestroBorrado_1 = require("../models/maestroBorrado");
const maestros_1 = require("../models/maestros");
const movimientoMaestro_1 = require("../models/movimientoMaestro");
const user_1 = require("../models/user");
const registrarMaestro = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { nombre, NombreMaestro, firmaEntrega, descripcionEntrega, estado, region, marca, modelo, imei, fechaRecibe, Uid, } = req.body;
    try {
        // Crear el nuevo maestro
        const maestro = yield maestros_1.Maestro.create({
            nombre,
            NombreMaestro,
            firmaEntrega,
            descripcionEntrega,
            estado,
            region,
            marca,
            modelo,
            imei,
            fechaRecibe,
            Uid,
        });
        yield movimientoMaestro_1.MovimientoMaestro.create({
            Mid: maestro.Mid,
            tipoMovimiento: "CREACION",
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
    const { firmaRecibe, descripcionRecibe, maestroRecibido, fechaEntrega } = req.body;
    try {
        const maestro = yield maestros_1.Maestro.findByPk(Mid);
        if (!maestro) {
            return res.status(404).json({
                message: `No existe el maestro con el id: ${Mid}`,
            });
        }
        // Crear registro en la tabla maestroBorrado con los datos modificados
        yield maestroBorrado_1.maestroBorrado.create({
            Mid: maestro.Mid,
            nombre: maestro.nombre,
            NombreMaestro: maestro.NombreMaestro,
            maestroRecibido: maestroRecibido,
            firmaEntrega: maestro.firmaEntrega,
            firmaRecibe: firmaRecibe, // Firma proporcionada por el usuario
            descripcionEntrega: maestro.descripcionEntrega,
            descripcionRecibe: descripcionRecibe, // Descripcion proporcionada por el usuario
            region: maestro.region,
            marca: maestro.marca,
            modelo: maestro.modelo,
            imei: maestro.imei,
            fechaRecibe: maestro.fechaRecibe,
            fechaEntrega: fechaEntrega, // Fecha proporcionada por el usuario
            Uid: maestro.Uid,
            estado: "Entregado",
            deletedAt: new Date(),
        });
        // Crear registro en la tabla MovimientoMaestro
        yield movimientoMaestro_1.MovimientoMaestro.create({
            Mid: maestro.Mid,
            tipoMovimiento: "ELIMINACION",
        });
        // Eliminar el maestro de la tabla Maestro
        yield maestros_1.Maestro.destroy({ where: { Mid } });
        res.status(200).json({
            message: `Maestro con ID ${Mid} eliminado y datos actualizados`,
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            error: 'Problemas al borrar el maestro',
            message: err.message || err,
        });
    }
});
exports.borrarMaestrosPorId = borrarMaestrosPorId;
const actualizarMaestro = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { Mid } = req.params;
    const { nombre, NombreMaestro, firma, descripcion, region, estado } = req.body;
    try {
        const maestro = yield maestros_1.Maestro.findByPk(Mid);
        if (!maestro) {
            return res.status(404).json({
                message: `No existe el maestro con el id: ${Mid}`,
            });
        }
        yield maestros_1.Maestro.update({
            nombre,
            NombreMaestro,
            firma,
            region,
            estado,
            descripcion,
        }, { where: { Mid } });
        res.status(200).json({
            message: `Maestro con ID ${Mid} actualizado`,
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            error: "Problemas al actualizar el maestro",
            message: err.message || err,
        });
    }
});
exports.actualizarMaestro = actualizarMaestro;
const maestrosActivos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const maestros = yield maestros_1.Maestro.findAll({
            where: { estado: "activo" },
            include: [
                {
                    model: user_1.User,
                    as: "usuarios",
                    attributes: ["nombre", "apellido"], // Ajusta los atributos según tus necesidades
                },
            ],
        });
        res.status(200).json(maestros);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            error: "Problemas al obtener los maestros activos",
            message: err.message || err,
        });
    }
});
exports.maestrosActivos = maestrosActivos;
const generarReporte = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { fechaInicio, fechaFin } = req.body;
    // Validar que las fechas sean válidas
    if (!fechaInicio || !fechaFin) {
        return res.status(400).json({
            error: "Problemas al generar el reporte",
            message: "Las fechas de inicio y fin son requeridas",
        });
    }
    const fechaInicioDate = new Date(fechaInicio);
    const fechaFinDate = new Date(fechaFin);
    if (isNaN(fechaInicioDate.getTime()) || isNaN(fechaFinDate.getTime())) {
        return res.status(400).json({
            error: "Problemas al generar el reporte",
            message: "Formato de fecha inválido",
        });
    }
    try {
        const movimientos = yield movimientoMaestro_1.MovimientoMaestro.findAll({
            where: {
                fechaMovimiento: {
                    [sequelize_1.Op.between]: [fechaInicioDate, fechaFinDate],
                },
            },
        });
        res.status(200).json({
            message: "Reporte generado con éxito",
            movimientos: movimientos,
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            error: "Problemas al generar el reporte",
            message: err.message || err,
        });
    }
});
exports.generarReporte = generarReporte;
const generarReporteMensual = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const now = new Date();
        const mes = now.getMonth(); // Mes actual (0-11)
        const año = now.getFullYear(); // Año actual
        const fechaInicio = new Date(año, mes, 1);
        const fechaFin = new Date(año, mes + 1, 0);
        const movimientos = yield movimientoMaestro_1.MovimientoMaestro.findAll({
            where: {
                fechaMovimiento: {
                    [sequelize_1.Op.between]: [fechaInicio, fechaFin],
                },
            },
        });
        res.status(200).json({
            message: "Reporte mensual generado con éxito",
            movimientos: movimientos,
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            error: "Problemas al generar el reporte mensual",
            message: err.message || err,
        });
    }
});
exports.generarReporteMensual = generarReporteMensual;
const reactivarMaestro = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { Mid } = req.params;
    try {
        // Buscar el maestro en la tabla maestros_borrados
        const maestroInactivo = yield maestroBorrado_1.maestroBorrado.findOne({ where: { Mid } });
        if (!maestroInactivo) {
            return res.status(404).json({
                error: "Maestro no encontrado en la tabla de maestros inactivos",
            });
        }
        // Mover el maestro a la tabla maestros
        const maestroActivo = yield maestros_1.Maestro.create({
            Mid: maestroInactivo.Mid,
            nombre: maestroInactivo.nombre,
            NombreMaestro: maestroInactivo.NombreMaestro,
            firmaEntrega: maestroInactivo.firmaEntrega,
            firmaRecibe: maestroInactivo.firmaRecibe,
            descripcionEntrega: maestroInactivo.descripcionEntrega,
            descripcionRecibe: maestroInactivo.descripcionRecibe,
            Uid: maestroInactivo.Uid,
            estado: "activo",
            region: maestroInactivo.region,
            marca: maestroInactivo.marca,
            modelo: maestroInactivo.modelo,
            imei: maestroInactivo.imei,
            fechaRecibe: maestroInactivo.fechaRecibe,
            fechaEntrega: maestroInactivo.fechaEntrega,
        });
        // Eliminar el maestro de la tabla maestros_borrados
        yield maestroBorrado_1.maestroBorrado.destroy({ where: { Mid } });
        res.status(200).json({
            message: "Maestro reactivado exitosamente",
            maestro: maestroActivo,
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            error: "Problemas al reactivar el maestro",
            message: err.message || err,
        });
    }
});
exports.reactivarMaestro = reactivarMaestro;
const obtenerTodosLosMaestros = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Obtener maestros activos
        const maestrosActivos = yield maestros_1.Maestro.findAll({
            include: [
                {
                    model: user_1.User,
                    as: "usuarios",
                    attributes: ["nombre", "apellido"], // Ajusta los atributos según tus necesidades
                },
            ],
        });
        // Obtener maestros inactivos
        const maestrosInactivos = yield maestroBorrado_1.maestroBorrado.findAll({
            include: [
                {
                    model: user_1.User,
                    as: "usuarios",
                    attributes: ["nombre", "apellido"], // Ajusta los atributos según tus necesidades
                },
            ],
        });
        // Combinar los resultados
        const todosLosMaestros = [...maestrosActivos, ...maestrosInactivos];
        res.status(200).json({
            message: "Lista de todos los maestros (activos e inactivos)",
            maestros: todosLosMaestros,
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            error: "Problemas al obtener la lista de maestros",
            message: err.message || err,
        });
    }
});
exports.obtenerTodosLosMaestros = obtenerTodosLosMaestros;
