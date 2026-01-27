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
exports.darDeBajaDispositivo = exports.obtenerTrazabilidad = exports.obtenerEstadisticas = exports.cambiarEstadoDispositivo = exports.actualizarDispositivo = exports.registrarDispositivo = exports.obtenerDispositivoPorId = exports.obtenerDisponibles = exports.obtenerDispositivos = void 0;
const sequelize_1 = require("sequelize");
const dispositivo_1 = require("../models/dispositivo");
const movimientoDispositivo_1 = require("../models/movimientoDispositivo");
const multer_1 = require("../config/multer");
/**
 * Obtener todos los dispositivos con filtros
 */
const obtenerDispositivos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { estado, categoria, ubicacion, busqueda } = req.query;
        let where = {};
        if (estado && estado !== 'todos') {
            where.estado = estado;
        }
        if (categoria && categoria !== 'todas') {
            where.categoria = categoria;
        }
        if (ubicacion && ubicacion !== 'todas') {
            where.ubicacion = ubicacion;
        }
        if (busqueda) {
            where[sequelize_1.Op.or] = [
                { nombre: { [sequelize_1.Op.iLike]: `%${busqueda}%` } },
                { marca: { [sequelize_1.Op.iLike]: `%${busqueda}%` } },
                { modelo: { [sequelize_1.Op.iLike]: `%${busqueda}%` } },
                { serial: { [sequelize_1.Op.iLike]: `%${busqueda}%` } },
                { imei: { [sequelize_1.Op.iLike]: `%${busqueda}%` } }
            ];
        }
        const dispositivos = yield dispositivo_1.Dispositivo.findAll({
            where,
            order: [['createdAt', 'DESC']]
        });
        res.json(dispositivos);
    }
    catch (error) {
        console.error('Error al obtener dispositivos:', error);
        res.status(500).json({ msg: 'Error al obtener los dispositivos' });
    }
});
exports.obtenerDispositivos = obtenerDispositivos;
/**
 * Obtener dispositivos disponibles para préstamo
 */
const obtenerDisponibles = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const dispositivos = yield dispositivo_1.Dispositivo.findAll({
            where: { estado: 'disponible' },
            order: [['categoria', 'ASC'], ['nombre', 'ASC']]
        });
        res.json(dispositivos);
    }
    catch (error) {
        console.error('Error al obtener dispositivos disponibles:', error);
        res.status(500).json({ msg: 'Error al obtener los dispositivos disponibles' });
    }
});
exports.obtenerDisponibles = obtenerDisponibles;
/**
 * Obtener un dispositivo por ID con su historial
 */
const obtenerDispositivoPorId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const dispositivo = yield dispositivo_1.Dispositivo.findByPk(Number(id), {
            include: [
                {
                    model: movimientoDispositivo_1.MovimientoDispositivo,
                    as: 'movimientos',
                    order: [['fecha', 'DESC']]
                }
            ]
        });
        if (!dispositivo) {
            res.status(404).json({ msg: 'Dispositivo no encontrado' });
            return;
        }
        res.json(dispositivo);
    }
    catch (error) {
        console.error('Error al obtener dispositivo:', error);
        res.status(500).json({ msg: 'Error al obtener el dispositivo' });
    }
});
exports.obtenerDispositivoPorId = obtenerDispositivoPorId;
/**
 * Registrar nuevo dispositivo en el inventario
 */
const registrarDispositivo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { nombre, categoria, marca, modelo, serial, imei, color, descripcion, condicion, ubicacion, observaciones, Uid } = req.body;
        // Verificar serial único si se proporciona
        if (serial) {
            const existeSerial = yield dispositivo_1.Dispositivo.findOne({ where: { serial } });
            if (existeSerial) {
                res.status(400).json({ msg: 'Ya existe un dispositivo con ese número de serie' });
                return;
            }
        }
        // Procesar fotos si se subieron
        let fotos = [];
        if (req.files && Array.isArray(req.files)) {
            fotos = req.files.map(file => (0, multer_1.getPhotoUrl)(file.filename, 'dispositivos'));
        }
        // Crear dispositivo
        const dispositivo = yield dispositivo_1.Dispositivo.create({
            nombre,
            categoria,
            marca,
            modelo,
            serial,
            imei,
            color,
            descripcion,
            estado: 'disponible',
            condicion: condicion || 'bueno',
            ubicacion: ubicacion || 'Almacén Principal',
            fotos: JSON.stringify(fotos),
            fechaIngreso: new Date(),
            observaciones,
            Uid
        });
        // Registrar movimiento de ingreso
        yield movimientoDispositivo_1.MovimientoDispositivo.create({
            dispositivoId: dispositivo.id,
            tipoMovimiento: 'ingreso',
            estadoAnterior: null,
            estadoNuevo: 'disponible',
            descripcion: `Dispositivo ${nombre} ingresado al inventario`,
            fecha: new Date(),
            Uid
        });
        res.status(201).json({
            msg: 'Dispositivo registrado exitosamente',
            dispositivo
        });
    }
    catch (error) {
        console.error('Error al registrar dispositivo:', error);
        res.status(500).json({ msg: 'Error al registrar el dispositivo' });
    }
});
exports.registrarDispositivo = registrarDispositivo;
/**
 * Actualizar dispositivo
 */
const actualizarDispositivo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { nombre, categoria, marca, modelo, serial, imei, color, descripcion, condicion, ubicacion, observaciones, Uid } = req.body;
        const dispositivo = yield dispositivo_1.Dispositivo.findByPk(Number(id));
        if (!dispositivo) {
            res.status(404).json({ msg: 'Dispositivo no encontrado' });
            return;
        }
        // Actualizar campos
        yield dispositivo.update({
            nombre,
            categoria,
            marca,
            modelo,
            serial,
            imei,
            color,
            descripcion,
            condicion,
            ubicacion,
            observaciones
        });
        // Registrar movimiento de actualización
        yield movimientoDispositivo_1.MovimientoDispositivo.create({
            dispositivoId: dispositivo.id,
            tipoMovimiento: 'actualizacion',
            descripcion: `Dispositivo actualizado`,
            fecha: new Date(),
            Uid
        });
        res.json({
            msg: 'Dispositivo actualizado exitosamente',
            dispositivo
        });
    }
    catch (error) {
        console.error('Error al actualizar dispositivo:', error);
        res.status(500).json({ msg: 'Error al actualizar el dispositivo' });
    }
});
exports.actualizarDispositivo = actualizarDispositivo;
/**
 * Cambiar estado del dispositivo
 */
const cambiarEstadoDispositivo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { nuevoEstado, motivo, Uid } = req.body;
        const dispositivo = yield dispositivo_1.Dispositivo.findByPk(Number(id));
        if (!dispositivo) {
            res.status(404).json({ msg: 'Dispositivo no encontrado' });
            return;
        }
        const estadoAnterior = dispositivo.estado;
        yield dispositivo.update({ estado: nuevoEstado });
        // Registrar movimiento de cambio de estado
        yield movimientoDispositivo_1.MovimientoDispositivo.create({
            dispositivoId: dispositivo.id,
            tipoMovimiento: 'cambio_estado',
            estadoAnterior,
            estadoNuevo: nuevoEstado,
            descripcion: motivo || `Estado cambiado de ${estadoAnterior} a ${nuevoEstado}`,
            fecha: new Date(),
            Uid
        });
        res.json({
            msg: 'Estado actualizado exitosamente',
            dispositivo
        });
    }
    catch (error) {
        console.error('Error al cambiar estado:', error);
        res.status(500).json({ msg: 'Error al cambiar el estado del dispositivo' });
    }
});
exports.cambiarEstadoDispositivo = cambiarEstadoDispositivo;
/**
 * Obtener estadísticas del inventario
 */
const obtenerEstadisticas = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const stats = yield dispositivo_1.Dispositivo.findAll({
            attributes: [
                'estado',
                [dispositivo_1.Dispositivo.sequelize.fn('COUNT', dispositivo_1.Dispositivo.sequelize.col('id')), 'cantidad']
            ],
            group: ['estado']
        });
        const categorias = yield dispositivo_1.Dispositivo.findAll({
            attributes: [
                'categoria',
                [dispositivo_1.Dispositivo.sequelize.fn('COUNT', dispositivo_1.Dispositivo.sequelize.col('id')), 'cantidad']
            ],
            group: ['categoria']
        });
        const total = yield dispositivo_1.Dispositivo.count();
        res.json({
            total,
            porEstado: stats,
            porCategoria: categorias
        });
    }
    catch (error) {
        console.error('Error al obtener estadísticas:', error);
        res.status(500).json({ msg: 'Error al obtener las estadísticas' });
    }
});
exports.obtenerEstadisticas = obtenerEstadisticas;
/**
 * Obtener historial/trazabilidad de un dispositivo
 */
const obtenerTrazabilidad = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const movimientos = yield movimientoDispositivo_1.MovimientoDispositivo.findAll({
            where: { dispositivoId: id },
            order: [['fecha', 'DESC']],
            include: [
                {
                    model: dispositivo_1.Dispositivo,
                    as: 'dispositivo',
                    attributes: ['nombre', 'categoria', 'marca', 'modelo']
                }
            ]
        });
        res.json(movimientos);
    }
    catch (error) {
        console.error('Error al obtener trazabilidad:', error);
        res.status(500).json({ msg: 'Error al obtener la trazabilidad' });
    }
});
exports.obtenerTrazabilidad = obtenerTrazabilidad;
/**
 * Dar de baja un dispositivo
 */
const darDeBajaDispositivo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { motivo, nuevoEstado, Uid } = req.body; // nuevoEstado: dañado, perdido, obsoleto
        const dispositivo = yield dispositivo_1.Dispositivo.findByPk(Number(id));
        if (!dispositivo) {
            res.status(404).json({ msg: 'Dispositivo no encontrado' });
            return;
        }
        if (dispositivo.estado === 'entregado') {
            res.status(400).json({ msg: 'No se puede dar de baja un dispositivo que está entregado' });
            return;
        }
        const estadoAnterior = dispositivo.estado;
        yield dispositivo.update({ estado: nuevoEstado });
        yield movimientoDispositivo_1.MovimientoDispositivo.create({
            dispositivoId: dispositivo.id,
            tipoMovimiento: 'baja',
            estadoAnterior,
            estadoNuevo: nuevoEstado,
            descripcion: `Dispositivo dado de baja: ${motivo}`,
            fecha: new Date(),
            Uid
        });
        res.json({
            msg: `Dispositivo marcado como ${nuevoEstado}`,
            dispositivo
        });
    }
    catch (error) {
        console.error('Error al dar de baja dispositivo:', error);
        res.status(500).json({ msg: 'Error al dar de baja el dispositivo' });
    }
});
exports.darDeBajaDispositivo = darDeBajaDispositivo;
