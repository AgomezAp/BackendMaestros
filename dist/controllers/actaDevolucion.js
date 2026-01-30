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
import { v4 as uuidv4 } from 'uuid';
import sequelize from '../database/connection.js';
import { ActaDevolucion } from '../models/actaDevolucion.js';
import { DetalleDevolucion } from '../models/detalleDevolucion.js';
import { TokenDevolucion } from '../models/tokenDevolucion.js';
import { Dispositivo } from '../models/dispositivo.js';
import { MovimientoDispositivo } from '../models/movimientoDispositivo.js';
import { enviarCorreoDevolucion, enviarConfirmacionDevolucion } from '../config/email.js';
import { getPhotoUrl } from '../config/multer.js';
import { getIO } from '../models/server.js';
/**
 * Generar número de acta de devolución único
 */
const generarNumeroActaDevolucion = () => __awaiter(void 0, void 0, void 0, function* () {
    const year = new Date().getFullYear();
    const ultimaActa = yield ActaDevolucion.findOne({
        where: {
            numeroActa: {
                [Op.like]: `DEV-${year}-%`
            }
        },
        order: [['id', 'DESC']]
    });
    let numero = 1;
    if (ultimaActa) {
        const partes = ultimaActa.numeroActa.split('-');
        numero = parseInt(partes[2]) + 1;
    }
    return `DEV-${year}-${numero.toString().padStart(4, '0')}`;
});
/**
 * Obtener dispositivos entregados (disponibles para devolución)
 */
export const obtenerDispositivosEntregados = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const dispositivos = yield Dispositivo.findAll({
            where: { estado: 'entregado' },
            order: [['nombre', 'ASC']]
        });
        res.json(dispositivos);
    }
    catch (error) {
        console.error('Error al obtener dispositivos entregados:', error);
        res.status(500).json({ msg: 'Error al obtener los dispositivos entregados' });
    }
});
/**
 * Obtener todas las actas de devolución
 */
export const obtenerActasDevolucion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { estado, busqueda } = req.query;
        let where = {};
        if (estado && estado !== 'todas') {
            where.estado = estado;
        }
        if (busqueda) {
            where[Op.or] = [
                { numeroActa: { [Op.iLike]: `%${busqueda}%` } },
                { nombreEntrega: { [Op.iLike]: `%${busqueda}%` } },
                { nombreReceptor: { [Op.iLike]: `%${busqueda}%` } }
            ];
        }
        const actas = yield ActaDevolucion.findAll({
            where,
            include: [
                {
                    model: DetalleDevolucion,
                    as: 'detalles',
                    include: [
                        {
                            model: Dispositivo,
                            as: 'dispositivo',
                            attributes: ['id', 'nombre', 'categoria', 'marca', 'modelo', 'serial', 'imei']
                        }
                    ]
                }
            ],
            order: [['fechaDevolucion', 'DESC']]
        });
        console.log('📋 Actas de devolución encontradas:', actas.length);
        res.json({ actas });
    }
    catch (error) {
        console.error('Error al obtener actas de devolución:', error);
        res.status(500).json({ msg: 'Error al obtener las actas de devolución' });
    }
});
/**
 * Obtener acta de devolución por ID
 */
export const obtenerActaDevolucionPorId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const acta = yield ActaDevolucion.findByPk(Number(id), {
            include: [
                {
                    model: DetalleDevolucion,
                    as: 'detalles',
                    include: [
                        {
                            model: Dispositivo,
                            as: 'dispositivo'
                        }
                    ]
                }
            ]
        });
        if (!acta) {
            res.status(404).json({ msg: 'Acta de devolución no encontrada' });
            return;
        }
        res.json(acta);
    }
    catch (error) {
        console.error('Error al obtener acta de devolución:', error);
        res.status(500).json({ msg: 'Error al obtener el acta de devolución' });
    }
});
/**
 * Crear nueva acta de devolución
 */
export const crearActaDevolucion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const transaction = yield sequelize.transaction();
    try {
        const { nombreReceptor, cargoReceptor, correoReceptor, firmaReceptor, // Firma del receptor (sistemas) al crear el acta
        nombreEntrega, cargoEntrega, correoEntrega, observaciones, dispositivos: dispositivosRaw, Uid } = req.body;
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
        console.log('📦 Creando acta de devolución...');
        console.log('   Quien devuelve:', nombreEntrega, '- Correo:', correoEntrega);
        console.log('   Quien recibe:', nombreReceptor);
        console.log('   Dispositivos:', (dispositivos === null || dispositivos === void 0 ? void 0 : dispositivos.length) || 0);
        console.log('   Firma receptor incluida:', !!firmaReceptor);
        // Validar que haya dispositivos
        if (!dispositivos || !Array.isArray(dispositivos) || dispositivos.length === 0) {
            yield transaction.rollback();
            res.status(400).json({ msg: 'Debe seleccionar al menos un dispositivo para devolver' });
            return;
        }
        // Validar correo del empleado (para enviar solicitud de firma)
        if (!correoEntrega) {
            yield transaction.rollback();
            res.status(400).json({ msg: 'El correo del empleado que devuelve es requerido' });
            return;
        }
        // Verificar que todos los dispositivos estén entregados
        const dispositivosIds = dispositivos.map((d) => d.dispositivoId);
        const dispositivosDB = yield Dispositivo.findAll({
            where: { id: dispositivosIds },
            transaction
        });
        const noEntregados = dispositivosDB.filter(d => d.estado !== 'entregado');
        if (noEntregados.length > 0) {
            yield transaction.rollback();
            res.status(400).json({
                msg: 'Algunos dispositivos no están en estado entregado',
                dispositivos: noEntregados.map(d => d.nombre)
            });
            return;
        }
        // Generar número de acta
        const numeroActa = yield generarNumeroActaDevolucion();
        // Crear el acta con la firma del receptor (sistemas)
        const acta = yield ActaDevolucion.create({
            numeroActa,
            nombreReceptor,
            cargoReceptor,
            correoReceptor,
            nombreEntrega,
            cargoEntrega,
            correoEntrega,
            firmaEntrega: null, // Se firmará por correo
            firmaReceptor: firmaReceptor || null, // Firma del de sistemas al crear
            fechaDevolucion: new Date(),
            estado: 'pendiente_firma',
            observaciones,
            Uid
        }, { transaction });
        console.log('   Acta creada:', numeroActa);
        // Procesar fotos si se subieron
        let fotosMap = {};
        if (req.files && Array.isArray(req.files)) {
            for (const file of req.files) {
                const dispositivoId = file.fieldname.replace('fotos_', '');
                if (!fotosMap[dispositivoId]) {
                    fotosMap[dispositivoId] = [];
                }
                fotosMap[dispositivoId].push(getPhotoUrl(file.filename, 'devoluciones'));
            }
        }
        // Crear detalles del acta y reservar dispositivos
        for (const item of dispositivos) {
            const dispositivo = dispositivosDB.find(d => d.id === item.dispositivoId);
            // Crear detalle
            yield DetalleDevolucion.create({
                actaDevolucionId: acta.id,
                dispositivoId: item.dispositivoId,
                estadoDevolucion: item.estadoDevolucion || 'disponible',
                condicionDevolucion: item.condicionDevolucion || (dispositivo === null || dispositivo === void 0 ? void 0 : dispositivo.condicion),
                fotosDevolucion: JSON.stringify(fotosMap[item.dispositivoId] || []),
                observaciones: item.observaciones
            }, { transaction });
            // Cambiar estado del dispositivo a "reservado" hasta que se firme
            yield Dispositivo.update({ estado: 'reservado' }, { where: { id: item.dispositivoId }, transaction });
            // Registrar movimiento
            yield MovimientoDispositivo.create({
                dispositivoId: item.dispositivoId,
                tipoMovimiento: 'reserva',
                estadoAnterior: 'entregado',
                estadoNuevo: 'reservado',
                descripcion: `Reservado para devolución por ${nombreEntrega} - Acta ${numeroActa} pendiente de firma`,
                fecha: new Date(),
                Uid
            }, { transaction });
        }
        yield transaction.commit();
        console.log('   ✅ Acta de devolución creada exitosamente');
        // Obtener acta completa con detalles
        const actaCompleta = yield ActaDevolucion.findByPk(acta.id, {
            include: [
                {
                    model: DetalleDevolucion,
                    as: 'detalles',
                    include: [
                        {
                            model: Dispositivo,
                            as: 'dispositivo'
                        }
                    ]
                }
            ]
        });
        // Emitir evento WebSocket para actualización en tiempo real
        const io = getIO();
        io.to('devoluciones').emit('devolucion:created', actaCompleta);
        io.to('inventario').emit('dispositivo:updated', { multiple: true, ids: dispositivosIds });
        res.status(201).json({
            msg: 'Acta de devolución creada exitosamente',
            acta: actaCompleta
        });
    }
    catch (error) {
        yield transaction.rollback();
        console.error('Error al crear acta de devolución:', error);
        res.status(500).json({ msg: 'Error al crear el acta de devolución' });
    }
});
/**
 * Enviar correo de solicitud de firma para acta de devolución
 * Se envía al EMPLEADO que devuelve para que firme
 */
export const enviarSolicitudFirmaDevolucion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const transaction = yield sequelize.transaction();
    console.log('📧 [enviarSolicitudFirmaDevolucion] Iniciando proceso...');
    try {
        const { id } = req.params;
        const acta = yield ActaDevolucion.findByPk(Number(id), {
            include: [
                {
                    model: DetalleDevolucion,
                    as: 'detalles',
                    include: [
                        {
                            model: Dispositivo,
                            as: 'dispositivo'
                        }
                    ]
                }
            ],
            transaction
        });
        if (!acta) {
            yield transaction.rollback();
            res.status(404).json({ msg: 'Acta de devolución no encontrada' });
            return;
        }
        // El correo se envía al EMPLEADO que devuelve (correoEntrega)
        if (!acta.correoEntrega) {
            yield transaction.rollback();
            res.status(400).json({ msg: 'El acta no tiene correo del empleado que devuelve' });
            return;
        }
        console.log('   Acta encontrada:', acta.numeroActa);
        console.log('   Correo empleado (quien devuelve):', acta.correoEntrega);
        // Cancelar tokens anteriores pendientes
        yield TokenDevolucion.update({ estado: 'cancelado' }, {
            where: {
                actaDevolucionId: acta.id,
                estado: 'pendiente'
            },
            transaction
        });
        // Generar nuevo token
        const token = uuidv4();
        // Crear registro del token - se envía al empleado
        yield TokenDevolucion.create({
            token,
            actaDevolucionId: acta.id,
            correoDestinatario: acta.correoEntrega,
            estado: 'pendiente',
            fechaEnvio: new Date()
        }, { transaction });
        console.log('   Token generado:', token.substring(0, 8) + '...');
        // Preparar lista de dispositivos para el correo
        const dispositivos = ((_a = acta.detalles) === null || _a === void 0 ? void 0 : _a.map((d) => {
            var _a, _b, _c, _d, _e, _f;
            return ({
                tipo: ((_a = d.dispositivo) === null || _a === void 0 ? void 0 : _a.categoria) || 'Dispositivo',
                marca: ((_b = d.dispositivo) === null || _b === void 0 ? void 0 : _b.marca) || '',
                modelo: ((_c = d.dispositivo) === null || _c === void 0 ? void 0 : _c.modelo) || '',
                serial: ((_d = d.dispositivo) === null || _d === void 0 ? void 0 : _d.serial) || 'N/A',
                imei: ((_e = d.dispositivo) === null || _e === void 0 ? void 0 : _e.imei) || 'N/A',
                nombre: (_f = d.dispositivo) === null || _f === void 0 ? void 0 : _f.nombre
            });
        })) || [];
        // Enviar correo al EMPLEADO (nombreEntrega)
        console.log('   Enviando correo a:', acta.correoEntrega);
        yield enviarCorreoDevolucion(acta.correoEntrega, acta.nombreEntrega, // Nombre del empleado
        token, dispositivos, acta.observaciones);
        yield transaction.commit();
        console.log('   ✅ Correo enviado exitosamente');
        res.json({
            msg: 'Solicitud de firma enviada correctamente',
            correo: acta.correoEntrega
        });
    }
    catch (error) {
        yield transaction.rollback();
        console.error('❌ Error al enviar solicitud de firma:', error);
        res.status(500).json({ msg: error.message || 'Error al enviar la solicitud de firma' });
    }
});
/**
 * Obtener datos del acta de devolución por token (PÚBLICO)
 */
export const obtenerActaDevolucionPorToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { token } = req.params;
        const tokenFirma = yield TokenDevolucion.findOne({
            where: { token },
            include: [
                {
                    model: ActaDevolucion,
                    as: 'actaDevolucion',
                    include: [
                        {
                            model: DetalleDevolucion,
                            as: 'detalles',
                            include: [
                                {
                                    model: Dispositivo,
                                    as: 'dispositivo',
                                    attributes: ['id', 'nombre', 'categoria', 'marca', 'modelo', 'serial', 'imei', 'descripcion']
                                }
                            ]
                        }
                    ]
                }
            ]
        });
        if (!tokenFirma) {
            res.status(404).json({ msg: 'Token inválido o no encontrado' });
            return;
        }
        if (tokenFirma.estado === 'firmado') {
            res.status(400).json({
                msg: 'Este acta ya ha sido firmada',
                fechaFirma: tokenFirma.fechaFirma
            });
            return;
        }
        if (tokenFirma.estado === 'rechazado') {
            res.status(400).json({
                msg: 'Este acta fue rechazada',
                motivo: tokenFirma.motivoRechazo
            });
            return;
        }
        if (tokenFirma.estado === 'cancelado') {
            res.status(400).json({ msg: 'Este enlace ha sido cancelado' });
            return;
        }
        const acta = tokenFirma.actaDevolucion;
        // Formatear respuesta - IMPORTANTE: envolver en "acta" para el frontend
        const actaResponse = {
            id: acta.id,
            numeroActa: acta.numeroActa,
            nombreReceptor: acta.nombreReceptor,
            cargoReceptor: acta.cargoReceptor,
            correoReceptor: acta.correoReceptor,
            nombreEntrega: acta.nombreEntrega,
            cargoEntrega: acta.cargoEntrega,
            correoEntrega: acta.correoEntrega,
            firmaReceptor: acta.firmaReceptor,
            firmaEntrega: acta.firmaEntrega,
            fechaDevolucion: acta.fechaDevolucion,
            estado: acta.estado,
            observaciones: acta.observaciones,
            createdAt: acta.createdAt,
            DetallesDevolucion: ((_a = acta.detalles) === null || _a === void 0 ? void 0 : _a.map((d) => ({
                id: d.id,
                estadoDevolucion: d.estadoDevolucion,
                condicionDevolucion: d.condicionDevolucion,
                observaciones: d.observaciones,
                Maestro: d.dispositivo ? {
                    id: d.dispositivo.id,
                    nombre: d.dispositivo.nombre,
                    tipo: d.dispositivo.categoria,
                    categoria: d.dispositivo.categoria,
                    marca: d.dispositivo.marca,
                    modelo: d.dispositivo.modelo,
                    serial: d.dispositivo.serial,
                    imei: d.dispositivo.imei,
                    descripcion: d.dispositivo.descripcion
                } : null
            }))) || []
        };
        res.json({ acta: actaResponse });
    }
    catch (error) {
        console.error('Error al obtener acta por token:', error);
        res.status(500).json({ msg: 'Error al obtener los datos del acta' });
    }
});
/**
 * Firmar acta de devolución con token (PÚBLICO)
 * El EMPLEADO que devuelve firma desde el correo
 */
export const firmarActaDevolucionConToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const transaction = yield sequelize.transaction();
    try {
        const { token } = req.params;
        const { firma } = req.body;
        if (!firma) {
            res.status(400).json({ msg: 'La firma es requerida' });
            return;
        }
        const tokenFirma = yield TokenDevolucion.findOne({
            where: { token, estado: 'pendiente' },
            include: [
                {
                    model: ActaDevolucion,
                    as: 'actaDevolucion',
                    include: [
                        {
                            model: DetalleDevolucion,
                            as: 'detalles',
                            include: [
                                {
                                    model: Dispositivo,
                                    as: 'dispositivo'
                                }
                            ]
                        }
                    ]
                }
            ],
            transaction
        });
        if (!tokenFirma) {
            yield transaction.rollback();
            res.status(404).json({ msg: 'Token inválido o ya utilizado' });
            return;
        }
        const acta = tokenFirma.actaDevolucion;
        console.log('✍️ Firmando acta de devolución:', acta.numeroActa);
        console.log('   Empleado que firma:', acta.nombreEntrega);
        // Actualizar acta con la firma del EMPLEADO (firmaEntrega)
        yield acta.update({
            firmaEntrega: firma, // Firma del empleado que devuelve
            estado: 'completada',
            fechaFirma: new Date()
        }, { transaction });
        // Actualizar token
        yield tokenFirma.update({
            estado: 'firmado',
            fechaFirma: new Date(),
            ipFirma: req.ip || req.socket.remoteAddress,
            userAgent: req.headers['user-agent']
        }, { transaction });
        // Cambiar estado de dispositivos a disponible (o dañado/perdido según corresponda)
        for (const detalle of acta.detalles || []) {
            let nuevoEstado = 'disponible';
            if (detalle.estadoDevolucion === 'dañado') {
                nuevoEstado = 'dañado';
            }
            else if (detalle.estadoDevolucion === 'perdido') {
                nuevoEstado = 'perdido';
            }
            yield Dispositivo.update({
                estado: nuevoEstado,
                condicion: detalle.condicionDevolucion
            }, { where: { id: detalle.dispositivoId }, transaction });
            // Registrar movimiento
            yield MovimientoDispositivo.create({
                dispositivoId: detalle.dispositivoId,
                tipoMovimiento: 'devolucion',
                estadoAnterior: 'reservado',
                estadoNuevo: nuevoEstado,
                descripcion: `Devolución firmada - ${acta.numeroActa} - Devuelto por ${acta.nombreEntrega}`,
                fecha: new Date()
            }, { transaction });
            console.log(`   Dispositivo ${detalle.dispositivoId} -> ${nuevoEstado}`);
        }
        yield transaction.commit();
        console.log('   ✅ Acta de devolución firmada exitosamente');
        // Emitir evento WebSocket para actualización en tiempo real
        const io = getIO();
        const dispositivosIds = acta.detalles.map((d) => d.dispositivoId);
        io.to('devoluciones').emit('devolucion:signed', { actaId: acta.id, estado: 'completada' });
        io.to('inventario').emit('dispositivo:updated', { multiple: true, ids: dispositivosIds });
        // Enviar confirmación por correo (async, no bloqueante)
        const dispositivos = ((_a = acta.detalles) === null || _a === void 0 ? void 0 : _a.map((d) => {
            var _a, _b, _c, _d;
            return ({
                tipo: ((_a = d.dispositivo) === null || _a === void 0 ? void 0 : _a.categoria) || 'Dispositivo',
                marca: ((_b = d.dispositivo) === null || _b === void 0 ? void 0 : _b.marca) || '',
                modelo: ((_c = d.dispositivo) === null || _c === void 0 ? void 0 : _c.modelo) || '',
                serial: ((_d = d.dispositivo) === null || _d === void 0 ? void 0 : _d.serial) || 'N/A',
                estadoDevolucion: d.estadoDevolucion
            });
        })) || [];
        const destinatarios = [acta.correoReceptor];
        if (acta.correoEntrega) {
            destinatarios.push(acta.correoEntrega);
        }
        enviarConfirmacionDevolucion(destinatarios, acta.nombreEntrega, dispositivos, new Date()).catch(err => console.error('Error enviando confirmación:', err));
        res.json({
            msg: 'Acta de devolución firmada correctamente',
            numeroActa: acta.numeroActa
        });
    }
    catch (error) {
        yield transaction.rollback();
        console.error('Error al firmar acta de devolución:', error);
        res.status(500).json({ msg: 'Error al procesar la firma' });
    }
});
/**
 * Rechazar acta de devolución con token (PÚBLICO)
 */
export const rechazarActaDevolucionConToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const transaction = yield sequelize.transaction();
    try {
        const { token } = req.params;
        const { motivo } = req.body;
        if (!motivo || !motivo.trim()) {
            res.status(400).json({ msg: 'Debe indicar el motivo del rechazo' });
            return;
        }
        const tokenFirma = yield TokenDevolucion.findOne({
            where: { token, estado: 'pendiente' },
            include: [
                {
                    model: ActaDevolucion,
                    as: 'actaDevolucion',
                    include: [
                        {
                            model: DetalleDevolucion,
                            as: 'detalles'
                        }
                    ]
                }
            ],
            transaction
        });
        if (!tokenFirma) {
            yield transaction.rollback();
            res.status(404).json({ msg: 'Token inválido o ya utilizado' });
            return;
        }
        const acta = tokenFirma.actaDevolucion;
        // Actualizar acta
        yield acta.update({
            estado: 'rechazada'
        }, { transaction });
        // Actualizar token
        yield tokenFirma.update({
            estado: 'rechazado',
            motivoRechazo: motivo
        }, { transaction });
        // Revertir estado de dispositivos a "entregado"
        for (const detalle of acta.detalles || []) {
            yield Dispositivo.update({ estado: 'entregado' }, { where: { id: detalle.dispositivoId }, transaction });
            // Registrar movimiento
            yield MovimientoDispositivo.create({
                dispositivoId: detalle.dispositivoId,
                tipoMovimiento: 'cambio_estado',
                estadoAnterior: 'reservado',
                estadoNuevo: 'entregado',
                descripcion: `Devolución rechazada - ${acta.numeroActa} - Motivo: ${motivo}`,
                fecha: new Date()
            }, { transaction });
        }
        yield transaction.commit();
        // Emitir evento WebSocket para actualización en tiempo real
        const io = getIO();
        const dispositivosIds = (acta.detalles || []).map((d) => d.dispositivoId);
        io.to('devoluciones').emit('devolucion:rejected', { actaId: acta.id, estado: 'rechazada', motivo });
        io.to('inventario').emit('dispositivo:updated', { multiple: true, ids: dispositivosIds });
        res.json({
            msg: 'Acta de devolución rechazada',
            numeroActa: acta.numeroActa
        });
    }
    catch (error) {
        yield transaction.rollback();
        console.error('Error al rechazar acta de devolución:', error);
        res.status(500).json({ msg: 'Error al procesar el rechazo' });
    }
});
/**
 * Reenviar correo de firma para acta de devolución
 */
export const reenviarCorreoDevolucion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const tokenFirma = yield TokenDevolucion.findOne({
            where: {
                actaDevolucionId: Number(id),
                estado: 'pendiente'
            },
            include: [
                {
                    model: ActaDevolucion,
                    as: 'actaDevolucion',
                    include: [
                        {
                            model: DetalleDevolucion,
                            as: 'detalles',
                            include: [
                                {
                                    model: Dispositivo,
                                    as: 'dispositivo'
                                }
                            ]
                        }
                    ]
                }
            ]
        });
        if (!tokenFirma) {
            res.status(404).json({ msg: 'No hay solicitud de firma pendiente para esta acta' });
            return;
        }
        const acta = tokenFirma.actaDevolucion;
        const dispositivos = ((_a = acta === null || acta === void 0 ? void 0 : acta.detalles) === null || _a === void 0 ? void 0 : _a.map((d) => {
            var _a, _b, _c, _d, _e;
            return ({
                tipo: ((_a = d.dispositivo) === null || _a === void 0 ? void 0 : _a.categoria) || 'Dispositivo',
                marca: ((_b = d.dispositivo) === null || _b === void 0 ? void 0 : _b.marca) || '',
                modelo: ((_c = d.dispositivo) === null || _c === void 0 ? void 0 : _c.modelo) || '',
                serial: ((_d = d.dispositivo) === null || _d === void 0 ? void 0 : _d.serial) || 'N/A',
                imei: ((_e = d.dispositivo) === null || _e === void 0 ? void 0 : _e.imei) || 'N/A'
            });
        })) || [];
        yield enviarCorreoDevolucion(acta.correoReceptor, acta.nombreReceptor, tokenFirma.token, dispositivos, acta.observaciones);
        // Actualizar fecha de envío
        yield tokenFirma.update({ fechaEnvio: new Date() });
        res.json({
            msg: 'Correo reenviado correctamente',
            correo: acta.correoReceptor
        });
    }
    catch (error) {
        console.error('Error al reenviar correo:', error);
        res.status(500).json({ msg: error.message || 'Error al reenviar el correo' });
    }
});
