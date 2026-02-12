var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Op } from 'sequelize';
import { Dispositivo } from '../models/dispositivo.js';
import { MovimientoDispositivo } from '../models/movimientoDispositivo.js';
import { getPhotoUrl, deletePhoto } from '../config/multer.js';
import { getIO } from '../models/server.js';
/**
 * Obtener todos los dispositivos con filtros
 */
export const obtenerDispositivos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
            where[Op.or] = [
                { nombre: { [Op.iLike]: `%${busqueda}%` } },
                { marca: { [Op.iLike]: `%${busqueda}%` } },
                { modelo: { [Op.iLike]: `%${busqueda}%` } },
                { serial: { [Op.iLike]: `%${busqueda}%` } },
                { imei: { [Op.iLike]: `%${busqueda}%` } }
            ];
        }
        const dispositivos = yield Dispositivo.findAll({
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
/**
 * Obtener dispositivos disponibles para préstamo
 */
export const obtenerDisponibles = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const dispositivos = yield Dispositivo.findAll({
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
/**
 * Obtener un dispositivo por ID con su historial
 */
export const obtenerDispositivoPorId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const dispositivo = yield Dispositivo.findByPk(Number(id), {
            include: [
                {
                    model: MovimientoDispositivo,
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
/**
 * Registrar nuevo dispositivo en el inventario
 */
export const registrarDispositivo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { nombre, categoria, marca, modelo, serial, imei, color, descripcion, condicion, ubicacion, observaciones, Uid } = req.body;
        // Verificar serial único si se proporciona
        if (serial) {
            const existeSerial = yield Dispositivo.findOne({ where: { serial } });
            if (existeSerial) {
                res.status(400).json({ msg: 'Ya existe un dispositivo con ese número de serie' });
                return;
            }
        }
        // Procesar fotos si se subieron
        let fotos = [];
        if (req.files && Array.isArray(req.files)) {
            fotos = req.files.map(file => getPhotoUrl(file.filename, 'dispositivos'));
        }
        // Crear dispositivo
        const dispositivo = yield Dispositivo.create({
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
        yield MovimientoDispositivo.create({
            dispositivoId: dispositivo.id,
            tipoMovimiento: 'ingreso',
            estadoAnterior: null,
            estadoNuevo: 'disponible',
            descripcion: `Dispositivo ${nombre} ingresado al inventario`,
            fecha: new Date(),
            Uid
        });
        // Emitir evento WebSocket
        try {
            const io = getIO();
            io.to('inventario').emit('dispositivo:created', { dispositivo });
        }
        catch (e) {
            console.log('WebSocket no disponible');
        }
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
/**
 * Actualizar dispositivo
 */
export const actualizarDispositivo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { nombre, categoria, marca, modelo, serial, imei, color, descripcion, condicion, ubicacion, observaciones, Uid } = req.body;
        const dispositivo = yield Dispositivo.findByPk(Number(id));
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
        yield MovimientoDispositivo.create({
            dispositivoId: dispositivo.id,
            tipoMovimiento: 'actualizacion',
            descripcion: `Dispositivo actualizado`,
            fecha: new Date(),
            Uid
        });
        // Emitir evento WebSocket
        try {
            const io = getIO();
            io.to('inventario').emit('dispositivo:updated', { dispositivo });
        }
        catch (e) {
            console.log('WebSocket no disponible');
        }
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
/**
 * Cambiar estado del dispositivo
 */
export const cambiarEstadoDispositivo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { nuevoEstado, motivo, Uid } = req.body;
        const dispositivo = yield Dispositivo.findByPk(Number(id));
        if (!dispositivo) {
            res.status(404).json({ msg: 'Dispositivo no encontrado' });
            return;
        }
        const estadoAnterior = dispositivo.estado;
        yield dispositivo.update({ estado: nuevoEstado });
        // Registrar movimiento de cambio de estado
        yield MovimientoDispositivo.create({
            dispositivoId: dispositivo.id,
            tipoMovimiento: 'cambio_estado',
            estadoAnterior,
            estadoNuevo: nuevoEstado,
            descripcion: motivo || `Estado cambiado de ${estadoAnterior} a ${nuevoEstado}`,
            fecha: new Date(),
            Uid
        });
        // Emitir evento WebSocket
        try {
            const io = getIO();
            io.to('inventario').emit('dispositivo:updated', { dispositivo, estadoAnterior, nuevoEstado });
        }
        catch (e) {
            console.log('WebSocket no disponible');
        }
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
/**
 * Obtener estadísticas del inventario
 */
export const obtenerEstadisticas = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const stats = yield Dispositivo.findAll({
            attributes: [
                'estado',
                [Dispositivo.sequelize.fn('COUNT', Dispositivo.sequelize.col('id')), 'cantidad']
            ],
            group: ['estado']
        });
        const categorias = yield Dispositivo.findAll({
            attributes: [
                'categoria',
                [Dispositivo.sequelize.fn('COUNT', Dispositivo.sequelize.col('id')), 'cantidad']
            ],
            group: ['categoria']
        });
        const total = yield Dispositivo.count();
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
/**
 * Obtener historial/trazabilidad de un dispositivo
 */
export const obtenerTrazabilidad = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const movimientos = yield MovimientoDispositivo.findAll({
            where: { dispositivoId: id },
            order: [['fecha', 'DESC']],
            include: [
                {
                    model: Dispositivo,
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
/**
 * Dar de baja un dispositivo
 */
export const darDeBajaDispositivo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { motivo, nuevoEstado, Uid } = req.body; // nuevoEstado: dañado, perdido, obsoleto
        const dispositivo = yield Dispositivo.findByPk(Number(id));
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
        yield MovimientoDispositivo.create({
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
/**
 * Eliminar un dispositivo completamente
 */
export const eliminarDispositivo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const dispositivo = yield Dispositivo.findByPk(Number(id));
        if (!dispositivo) {
            res.status(404).json({ msg: 'Dispositivo no encontrado' });
            return;
        }
        // Eliminar las fotos asociadas del servidor
        if (dispositivo.fotos) {
            try {
                const fotos = JSON.parse(dispositivo.fotos);
                for (const foto of fotos) {
                    deletePhoto(foto);
                }
            }
            catch (e) {
                console.error('Error al eliminar fotos:', e);
            }
        }
        // Eliminar movimientos asociados
        yield MovimientoDispositivo.destroy({
            where: { dispositivoId: Number(id) }
        });
        // Eliminar el dispositivo
        yield dispositivo.destroy();
        res.json({ msg: 'Dispositivo eliminado exitosamente' });
    }
    catch (error) {
        console.error('Error al eliminar dispositivo:', error);
        res.status(500).json({ msg: 'Error al eliminar el dispositivo' });
    }
});
