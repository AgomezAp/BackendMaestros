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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.obtenerHistorialDispositivo = exports.obtenerActasActivas = exports.registrarDevolucion = exports.crearActaEntrega = exports.obtenerActaPorId = exports.obtenerActas = void 0;
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../database/connection"));
const actaEntrega_1 = require("../models/actaEntrega");
const detalleActa_1 = require("../models/detalleActa");
const dispositivo_1 = require("../models/dispositivo");
const movimientoDispositivo_1 = require("../models/movimientoDispositivo");
const multer_1 = require("../config/multer");
const server_1 = require("../models/server");
/**
 * Generar número de acta único
 */
const generarNumeroActa = () => __awaiter(void 0, void 0, void 0, function* () {
    const year = new Date().getFullYear();
    const ultimaActa = yield actaEntrega_1.ActaEntrega.findOne({
        where: {
            numeroActa: {
                [sequelize_1.Op.like]: `ACTA-${year}-%`
            }
        },
        order: [['id', 'DESC']]
    });
    let numero = 1;
    if (ultimaActa) {
        const partes = ultimaActa.numeroActa.split('-');
        numero = parseInt(partes[2]) + 1;
    }
    return `ACTA-${year}-${numero.toString().padStart(4, '0')}`;
});
/**
 * Obtener todas las actas de entrega
 */
const obtenerActas = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { estado, busqueda, fechaInicio, fechaFin } = req.query;
        let where = {};
        if (estado && estado !== 'todas') {
            where.estado = estado;
        }
        if (busqueda) {
            where[sequelize_1.Op.or] = [
                { numeroActa: { [sequelize_1.Op.iLike]: `%${busqueda}%` } },
                { nombreReceptor: { [sequelize_1.Op.iLike]: `%${busqueda}%` } },
                { cargoReceptor: { [sequelize_1.Op.iLike]: `%${busqueda}%` } }
            ];
        }
        if (fechaInicio && fechaFin) {
            where.fechaEntrega = {
                [sequelize_1.Op.between]: [new Date(fechaInicio), new Date(fechaFin)]
            };
        }
        const actas = yield actaEntrega_1.ActaEntrega.findAll({
            where,
            include: [
                {
                    model: detalleActa_1.DetalleActa,
                    as: 'detalles',
                    include: [
                        {
                            model: dispositivo_1.Dispositivo,
                            as: 'dispositivo',
                            attributes: ['id', 'nombre', 'categoria', 'marca', 'modelo', 'serial']
                        }
                    ]
                }
            ],
            order: [['fechaEntrega', 'DESC']]
        });
        res.json(actas);
    }
    catch (error) {
        console.error('Error al obtener actas:', error);
        res.status(500).json({ msg: 'Error al obtener las actas de entrega' });
    }
});
exports.obtenerActas = obtenerActas;
/**
 * Obtener acta por ID con detalles completos
 */
const obtenerActaPorId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const acta = yield actaEntrega_1.ActaEntrega.findByPk(Number(id), {
            include: [
                {
                    model: detalleActa_1.DetalleActa,
                    as: 'detalles',
                    include: [
                        {
                            model: dispositivo_1.Dispositivo,
                            as: 'dispositivo'
                        }
                    ]
                }
            ]
        });
        if (!acta) {
            res.status(404).json({ msg: 'Acta no encontrada' });
            return;
        }
        res.json(acta);
    }
    catch (error) {
        console.error('Error al obtener acta:', error);
        res.status(500).json({ msg: 'Error al obtener el acta' });
    }
});
exports.obtenerActaPorId = obtenerActaPorId;
/**
 * Crear nueva acta de entrega con múltiples dispositivos
 */
const crearActaEntrega = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const transaction = yield connection_1.default.transaction();
    try {
        const { nombreReceptor, cedulaReceptor, cargoReceptor, telefonoReceptor, correoReceptor, firmaReceptor, fechaDevolucionEsperada, observacionesEntrega, dispositivos: dispositivosRaw, // Viene como string JSON desde FormData
        Uid } = req.body;
        // Parsear dispositivos si viene como string
        let dispositivos = dispositivosRaw;
        if (typeof dispositivosRaw === 'string') {
            try {
                dispositivos = JSON.parse(dispositivosRaw);
            }
            catch (e) {
                yield transaction.rollback();
                res.status(400).json({ msg: 'Formato de dispositivos inválido' });
                return;
            }
        }
        // Validar que haya dispositivos
        if (!dispositivos || !Array.isArray(dispositivos) || dispositivos.length === 0) {
            yield transaction.rollback();
            res.status(400).json({ msg: 'Debe seleccionar al menos un dispositivo' });
            return;
        }
        // Verificar que todos los dispositivos estén disponibles
        const dispositivosIds = dispositivos.map((d) => d.dispositivoId);
        const dispositivosDB = yield dispositivo_1.Dispositivo.findAll({
            where: { id: dispositivosIds },
            transaction
        });
        const noDisponibles = dispositivosDB.filter(d => d.estado !== 'disponible');
        if (noDisponibles.length > 0) {
            yield transaction.rollback();
            res.status(400).json({
                msg: 'Algunos dispositivos no están disponibles',
                dispositivos: noDisponibles.map(d => d.nombre)
            });
            return;
        }
        // Generar número de acta
        const numeroActa = yield generarNumeroActa();
        // Crear el acta (sin firma, se firmará por correo)
        const acta = yield actaEntrega_1.ActaEntrega.create({
            numeroActa,
            nombreReceptor,
            cedulaReceptor,
            cargoReceptor,
            telefonoReceptor,
            correoReceptor,
            firmaReceptor: null, // Sin firma inicial
            fechaEntrega: new Date(),
            fechaDevolucionEsperada,
            estado: 'pendiente_firma', // Estado pendiente de firma
            observacionesEntrega,
            Uid
        }, { transaction });
        // Procesar fotos si se subieron
        let fotosMap = {};
        if (req.files && Array.isArray(req.files)) {
            for (const file of req.files) {
                const dispositivoId = file.fieldname.replace('fotos_', '');
                if (!fotosMap[dispositivoId]) {
                    fotosMap[dispositivoId] = [];
                }
                fotosMap[dispositivoId].push((0, multer_1.getPhotoUrl)(file.filename, 'entregas'));
            }
        }
        // Crear detalles del acta y actualizar estado de dispositivos
        for (const item of dispositivos) {
            const dispositivo = dispositivosDB.find(d => d.id === item.dispositivoId);
            // Crear detalle
            yield detalleActa_1.DetalleActa.create({
                actaId: acta.id,
                dispositivoId: item.dispositivoId,
                estadoEntrega: dispositivo === null || dispositivo === void 0 ? void 0 : dispositivo.estado,
                condicionEntrega: item.condicionEntrega || (dispositivo === null || dispositivo === void 0 ? void 0 : dispositivo.condicion),
                fotosEntrega: JSON.stringify(fotosMap[item.dispositivoId] || []),
                observacionesEntrega: item.observaciones,
                devuelto: false
            }, { transaction });
            // Actualizar estado del dispositivo a reservado (pendiente de firma)
            yield dispositivo_1.Dispositivo.update({ estado: 'reservado' }, { where: { id: item.dispositivoId }, transaction });
            // Registrar movimiento
            yield movimientoDispositivo_1.MovimientoDispositivo.create({
                dispositivoId: item.dispositivoId,
                tipoMovimiento: 'reserva',
                estadoAnterior: 'disponible',
                estadoNuevo: 'reservado',
                descripcion: `Reservado para ${nombreReceptor} (${cargoReceptor}) - Acta ${numeroActa} pendiente de firma`,
                actaId: acta.id,
                fecha: new Date(),
                Uid
            }, { transaction });
        }
        yield transaction.commit();
        // Obtener acta completa con detalles
        const actaCompleta = yield actaEntrega_1.ActaEntrega.findByPk(acta.id, {
            include: [
                {
                    model: detalleActa_1.DetalleActa,
                    as: 'detalles',
                    include: [
                        {
                            model: dispositivo_1.Dispositivo,
                            as: 'dispositivo'
                        }
                    ]
                }
            ]
        });
        // Emitir evento de WebSocket para actualización en tiempo real
        const io = (0, server_1.getIO)();
        io.to('actas').emit('acta:created', actaCompleta);
        io.to('inventario').emit('dispositivo:updated', { multiple: true, ids: dispositivosIds });
        res.status(201).json({
            msg: 'Acta de entrega creada exitosamente',
            acta: actaCompleta
        });
    }
    catch (error) {
        yield transaction.rollback();
        console.error('Error al crear acta:', error);
        res.status(500).json({ msg: 'Error al crear el acta de entrega' });
    }
});
exports.crearActaEntrega = crearActaEntrega;
/**
 * Registrar devolución de dispositivos (parcial o completa)
 */
const registrarDevolucion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const transaction = yield connection_1.default.transaction();
    try {
        const { id } = req.params; // ID del acta
        const { devoluciones: devolucionesRaw, // Viene como string JSON desde FormData
        observacionesDevolucion, Uid } = req.body;
        // Parsear devoluciones si viene como string
        let devoluciones = devolucionesRaw;
        if (typeof devolucionesRaw === 'string') {
            try {
                devoluciones = JSON.parse(devolucionesRaw);
            }
            catch (e) {
                yield transaction.rollback();
                res.status(400).json({ msg: 'Formato de devoluciones inválido' });
                return;
            }
        }
        console.log('📦 Procesando devolución para acta:', id);
        console.log('   Dispositivos a devolver:', (devoluciones === null || devoluciones === void 0 ? void 0 : devoluciones.length) || 0);
        const acta = yield actaEntrega_1.ActaEntrega.findByPk(Number(id), {
            include: [{ model: detalleActa_1.DetalleActa, as: 'detalles' }],
            transaction
        });
        if (!acta) {
            yield transaction.rollback();
            res.status(404).json({ msg: 'Acta no encontrada' });
            return;
        }
        // Procesar fotos de devolución
        let fotosMap = {};
        if (req.files && Array.isArray(req.files)) {
            for (const file of req.files) {
                const detalleId = file.fieldname.replace('fotos_devolucion_', '');
                if (!fotosMap[detalleId]) {
                    fotosMap[detalleId] = [];
                }
                fotosMap[detalleId].push((0, multer_1.getPhotoUrl)(file.filename, 'devoluciones'));
            }
        }
        // Procesar cada devolución
        for (const devolucion of devoluciones) {
            console.log('   Procesando devolución de detalle:', devolucion.detalleId);
            const detalle = yield detalleActa_1.DetalleActa.findByPk(devolucion.detalleId, { transaction });
            if (!detalle) {
                console.log('   ⚠️ Detalle no encontrado:', devolucion.detalleId);
                continue;
            }
            if (detalle.devuelto) {
                console.log('   ⚠️ Detalle ya devuelto:', devolucion.detalleId);
                continue;
            }
            // Actualizar detalle del acta
            yield detalle.update({
                devuelto: true,
                fechaDevolucion: new Date(),
                estadoDevolucion: devolucion.estadoDevolucion,
                condicionDevolucion: devolucion.condicionDevolucion,
                fotosDevolucion: JSON.stringify(fotosMap[devolucion.detalleId] || []),
                observacionesDevolucion: devolucion.observaciones
            }, { transaction });
            console.log('   ✅ Detalle actualizado como devuelto');
            // Actualizar estado del dispositivo según la devolución
            let nuevoEstado = 'disponible';
            if (devolucion.estadoDevolucion === 'dañado') {
                nuevoEstado = 'dañado';
            }
            else if (devolucion.estadoDevolucion === 'perdido') {
                nuevoEstado = 'perdido';
            }
            console.log('   Cambiando estado de dispositivo', detalle.dispositivoId, 'a:', nuevoEstado);
            yield dispositivo_1.Dispositivo.update({
                estado: nuevoEstado,
                condicion: devolucion.condicionDevolucion
            }, { where: { id: detalle.dispositivoId }, transaction });
            console.log('   ✅ Estado de dispositivo actualizado');
            // Registrar movimiento
            yield movimientoDispositivo_1.MovimientoDispositivo.create({
                dispositivoId: detalle.dispositivoId,
                tipoMovimiento: 'devolucion',
                estadoAnterior: 'entregado',
                estadoNuevo: nuevoEstado,
                descripcion: `Devuelto de ${acta.nombreReceptor} - Estado: ${nuevoEstado}${devolucion.observaciones ? ' - ' + devolucion.observaciones : ''}`,
                actaId: acta.id,
                fecha: new Date(),
                Uid
            }, { transaction });
            console.log('   ✅ Movimiento registrado');
        }
        // Verificar si todos los dispositivos fueron devueltos
        const detallesActualizados = yield detalleActa_1.DetalleActa.findAll({
            where: { actaId: acta.id },
            transaction
        });
        const todosDevueltos = detallesActualizados.every(d => d.devuelto);
        const algunoDevuelto = detallesActualizados.some(d => d.devuelto);
        let nuevoEstadoActa = acta.estado;
        if (todosDevueltos) {
            nuevoEstadoActa = 'devuelta_completa';
        }
        else if (algunoDevuelto) {
            nuevoEstadoActa = 'devuelta_parcial';
        }
        yield acta.update({
            estado: nuevoEstadoActa,
            observacionesDevolucion,
            fechaDevolucionReal: todosDevueltos ? new Date() : null
        }, { transaction });
        yield transaction.commit();
        // Obtener acta actualizada
        const actaActualizada = yield actaEntrega_1.ActaEntrega.findByPk(Number(id), {
            include: [
                {
                    model: detalleActa_1.DetalleActa,
                    as: 'detalles',
                    include: [
                        {
                            model: dispositivo_1.Dispositivo,
                            as: 'dispositivo'
                        }
                    ]
                }
            ]
        });
        res.json({
            msg: todosDevueltos ? 'Devolución completa registrada' : 'Devolución parcial registrada',
            acta: actaActualizada
        });
    }
    catch (error) {
        yield transaction.rollback();
        console.error('Error al registrar devolución:', error);
        res.status(500).json({ msg: 'Error al registrar la devolución' });
    }
});
exports.registrarDevolucion = registrarDevolucion;
/**
 * Obtener actas activas (préstamos pendientes)
 */
const obtenerActasActivas = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const actas = yield actaEntrega_1.ActaEntrega.findAll({
            where: {
                estado: {
                    [sequelize_1.Op.in]: ['activa', 'devuelta_parcial']
                }
            },
            include: [
                {
                    model: detalleActa_1.DetalleActa,
                    as: 'detalles',
                    where: { devuelto: false },
                    required: false,
                    include: [
                        {
                            model: dispositivo_1.Dispositivo,
                            as: 'dispositivo',
                            attributes: ['id', 'nombre', 'categoria', 'marca', 'modelo', 'serial']
                        }
                    ]
                }
            ],
            order: [['fechaEntrega', 'DESC']]
        });
        res.json(actas);
    }
    catch (error) {
        console.error('Error al obtener actas activas:', error);
        res.status(500).json({ msg: 'Error al obtener las actas activas' });
    }
});
exports.obtenerActasActivas = obtenerActasActivas;
/**
 * Obtener historial de entregas de un dispositivo específico
 */
const obtenerHistorialDispositivo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { dispositivoId } = req.params;
        const historial = yield detalleActa_1.DetalleActa.findAll({
            where: { dispositivoId },
            include: [
                {
                    model: actaEntrega_1.ActaEntrega,
                    as: 'acta',
                    attributes: ['id', 'numeroActa', 'nombreReceptor', 'cargoReceptor', 'fechaEntrega', 'estado']
                }
            ],
            order: [[{ model: actaEntrega_1.ActaEntrega, as: 'acta' }, 'fechaEntrega', 'DESC']]
        });
        res.json(historial);
    }
    catch (error) {
        console.error('Error al obtener historial:', error);
        res.status(500).json({ msg: 'Error al obtener el historial del dispositivo' });
    }
});
exports.obtenerHistorialDispositivo = obtenerHistorialDispositivo;
