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
exports.obtenerEstadoFirma = exports.reenviarCorreoFirma = exports.rechazarActaConToken = exports.firmarActaConToken = exports.obtenerActaPorToken = exports.enviarSolicitudFirma = void 0;
const uuid_1 = require("uuid");
const connection_1 = __importDefault(require("../database/connection"));
const tokenFirma_1 = require("../models/tokenFirma");
const actaEntrega_1 = require("../models/actaEntrega");
const detalleActa_1 = require("../models/detalleActa");
const dispositivo_1 = require("../models/dispositivo");
const movimientoDispositivo_1 = require("../models/movimientoDispositivo");
const email_1 = require("../config/email");
/**
 * Enviar correo de solicitud de firma para un acta
 */
const enviarSolicitudFirma = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const transaction = yield connection_1.default.transaction();
    console.log('📧 [enviarSolicitudFirma] Iniciando proceso...');
    console.log('   Acta ID:', req.params.id);
    try {
        const { id } = req.params; // ID del acta
        const { correoNotificacion } = req.body; // Correo opcional para notificar cuando se firme
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
            ],
            transaction
        });
        if (!acta) {
            console.log('   ❌ Acta no encontrada');
            yield transaction.rollback();
            res.status(404).json({ msg: 'Acta no encontrada' });
            return;
        }
        console.log('   Acta encontrada:', acta.numeroActa);
        console.log('   Correo receptor:', acta.correoReceptor);
        if (!acta.correoReceptor) {
            console.log('   ❌ Acta sin correo de receptor');
            yield transaction.rollback();
            res.status(400).json({ msg: 'El acta no tiene correo de receptor' });
            return;
        }
        // Cancelar tokens anteriores pendientes para esta acta
        yield tokenFirma_1.TokenFirma.update({ estado: 'cancelado' }, {
            where: {
                actaId: acta.id,
                estado: 'pendiente'
            },
            transaction
        });
        // Generar nuevo token único
        const token = (0, uuid_1.v4)();
        console.log('   Token generado:', token.substring(0, 8) + '...');
        // Crear registro del token
        yield tokenFirma_1.TokenFirma.create({
            token,
            actaId: acta.id,
            correoReceptor: acta.correoReceptor,
            estado: 'pendiente',
            fechaEnvio: new Date()
        }, { transaction });
        console.log('   Token guardado en BD');
        // Actualizar estado del acta a pendiente de firma
        yield acta.update({
            estado: 'pendiente_firma'
        }, { transaction });
        // Preparar lista de dispositivos para el correo
        const dispositivos = ((_a = acta.detalles) === null || _a === void 0 ? void 0 : _a.map((d) => {
            var _a, _b, _c, _d, _e;
            return ({
                tipo: ((_a = d.dispositivo) === null || _a === void 0 ? void 0 : _a.categoria) || 'Dispositivo',
                marca: ((_b = d.dispositivo) === null || _b === void 0 ? void 0 : _b.marca) || '',
                modelo: ((_c = d.dispositivo) === null || _c === void 0 ? void 0 : _c.modelo) || '',
                serial: ((_d = d.dispositivo) === null || _d === void 0 ? void 0 : _d.serial) || 'N/A',
                nombre: (_e = d.dispositivo) === null || _e === void 0 ? void 0 : _e.nombre
            });
        })) || [];
        console.log('   Dispositivos preparados:', dispositivos.length);
        // Enviar correo
        console.log('   Enviando correo...');
        yield (0, email_1.enviarCorreoFirma)(acta.correoReceptor, acta.nombreReceptor, token, dispositivos, acta.observacionesEntrega);
        console.log('   ✅ Correo enviado, haciendo commit...');
        yield transaction.commit();
        console.log('   ✅ Proceso completado exitosamente');
        res.json({
            msg: 'Solicitud de firma enviada correctamente',
            correo: acta.correoReceptor
        });
    }
    catch (error) {
        yield transaction.rollback();
        console.error('❌ Error al enviar solicitud de firma:', error);
        console.error('   Stack:', error.stack);
        res.status(500).json({ msg: error.message || 'Error al enviar la solicitud de firma' });
    }
});
exports.enviarSolicitudFirma = enviarSolicitudFirma;
/**
 * Obtener datos del acta por token (PÚBLICO - sin autenticación)
 */
const obtenerActaPorToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { token } = req.params;
        const tokenFirma = yield tokenFirma_1.TokenFirma.findOne({
            where: { token },
            include: [
                {
                    model: actaEntrega_1.ActaEntrega,
                    as: 'acta',
                    include: [
                        {
                            model: detalleActa_1.DetalleActa,
                            as: 'detalles',
                            include: [
                                {
                                    model: dispositivo_1.Dispositivo,
                                    as: 'dispositivo',
                                    attributes: ['id', 'nombre', 'categoria', 'marca', 'modelo', 'serial', 'descripcion']
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
        if (tokenFirma.estado === 'cancelado') {
            res.status(400).json({ msg: 'Este enlace ha sido cancelado. Solicite un nuevo enlace.' });
            return;
        }
        if (tokenFirma.estado === 'rechazado') {
            res.status(400).json({
                msg: 'Este acta fue devuelta para corrección',
                motivo: tokenFirma.motivoRechazo
            });
            return;
        }
        const acta = tokenFirma.acta;
        // Preparar datos para mostrar (sin información sensible)
        const datosActa = {
            numeroActa: acta === null || acta === void 0 ? void 0 : acta.numeroActa,
            nombreReceptor: acta === null || acta === void 0 ? void 0 : acta.nombreReceptor,
            cargoReceptor: acta === null || acta === void 0 ? void 0 : acta.cargoReceptor,
            correoReceptor: acta === null || acta === void 0 ? void 0 : acta.correoReceptor,
            fechaEntrega: acta === null || acta === void 0 ? void 0 : acta.fechaEntrega,
            observaciones: acta === null || acta === void 0 ? void 0 : acta.observacionesEntrega,
            dispositivos: ((_a = acta === null || acta === void 0 ? void 0 : acta.detalles) === null || _a === void 0 ? void 0 : _a.map((d) => {
                var _a, _b, _c, _d, _e, _f;
                return ({
                    nombre: (_a = d.dispositivo) === null || _a === void 0 ? void 0 : _a.nombre,
                    categoria: (_b = d.dispositivo) === null || _b === void 0 ? void 0 : _b.categoria,
                    marca: (_c = d.dispositivo) === null || _c === void 0 ? void 0 : _c.marca,
                    modelo: (_d = d.dispositivo) === null || _d === void 0 ? void 0 : _d.modelo,
                    serial: (_e = d.dispositivo) === null || _e === void 0 ? void 0 : _e.serial,
                    descripcion: (_f = d.dispositivo) === null || _f === void 0 ? void 0 : _f.descripcion,
                    condicion: d.condicionEntrega
                });
            })) || []
        };
        res.json(datosActa);
    }
    catch (error) {
        console.error('Error al obtener acta por token:', error);
        res.status(500).json({ msg: 'Error al obtener los datos del acta' });
    }
});
exports.obtenerActaPorToken = obtenerActaPorToken;
/**
 * Firmar acta con token (PÚBLICO - sin autenticación)
 */
const firmarActaConToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const transaction = yield connection_1.default.transaction();
    try {
        const { token } = req.params;
        const { firma, correosNotificacion } = req.body; // firma en base64, correosNotificacion opcional
        if (!firma) {
            yield transaction.rollback();
            res.status(400).json({ msg: 'La firma es requerida' });
            return;
        }
        const tokenFirma = yield tokenFirma_1.TokenFirma.findOne({
            where: { token },
            include: [
                {
                    model: actaEntrega_1.ActaEntrega,
                    as: 'acta',
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
                }
            ],
            transaction
        });
        if (!tokenFirma) {
            yield transaction.rollback();
            res.status(404).json({ msg: 'Token inválido' });
            return;
        }
        if (tokenFirma.estado !== 'pendiente') {
            yield transaction.rollback();
            res.status(400).json({ msg: `Este token ya no es válido. Estado: ${tokenFirma.estado}` });
            return;
        }
        const acta = tokenFirma.acta;
        const ahora = new Date();
        // Obtener IP y User Agent
        const ip = req.ip || req.socket.remoteAddress || 'unknown';
        const userAgent = req.headers['user-agent'] || 'unknown';
        // Actualizar token
        yield tokenFirma.update({
            estado: 'firmado',
            fechaFirma: ahora,
            ipFirma: ip,
            userAgent: userAgent.substring(0, 500)
        }, { transaction });
        // Actualizar acta con la firma
        yield actaEntrega_1.ActaEntrega.update({
            firmaReceptor: firma,
            estado: 'activa',
            fechaFirma: ahora
        }, {
            where: { id: acta.id },
            transaction
        });
        // Actualizar estado de dispositivos a 'entregado'
        for (const detalle of acta.detalles) {
            yield dispositivo_1.Dispositivo.update({ estado: 'entregado' }, { where: { id: detalle.dispositivoId }, transaction });
            // Registrar movimiento
            yield movimientoDispositivo_1.MovimientoDispositivo.create({
                dispositivoId: detalle.dispositivoId,
                tipoMovimiento: 'firma_entrega',
                estadoAnterior: 'disponible',
                estadoNuevo: 'entregado',
                descripcion: `Acta firmada digitalmente por ${acta.nombreReceptor} - ${acta.numeroActa}`,
                actaId: acta.id,
                fecha: ahora
            }, { transaction });
        }
        yield transaction.commit();
        // Enviar correo de confirmación (después del commit)
        try {
            const dispositivos = ((_a = acta.detalles) === null || _a === void 0 ? void 0 : _a.map((d) => {
                var _a, _b, _c, _d;
                return ({
                    tipo: ((_a = d.dispositivo) === null || _a === void 0 ? void 0 : _a.categoria) || 'Dispositivo',
                    marca: ((_b = d.dispositivo) === null || _b === void 0 ? void 0 : _b.marca) || '',
                    modelo: ((_c = d.dispositivo) === null || _c === void 0 ? void 0 : _c.modelo) || '',
                    serial: ((_d = d.dispositivo) === null || _d === void 0 ? void 0 : _d.serial) || 'N/A'
                });
            })) || [];
            // Destinatarios: el receptor + correos adicionales si se proporcionaron
            const destinatarios = [acta.correoReceptor];
            if (correosNotificacion && Array.isArray(correosNotificacion)) {
                destinatarios.push(...correosNotificacion);
            }
            yield (0, email_1.enviarActaFirmada)(destinatarios, acta.nombreReceptor, dispositivos, ahora);
        }
        catch (emailError) {
            console.error('Error enviando confirmación por correo:', emailError);
            // No falla la operación si el correo falla
        }
        res.json({
            msg: 'Acta firmada exitosamente',
            fechaFirma: ahora
        });
    }
    catch (error) {
        yield transaction.rollback();
        console.error('Error al firmar acta:', error);
        res.status(500).json({ msg: 'Error al procesar la firma' });
    }
});
exports.firmarActaConToken = firmarActaConToken;
/**
 * Rechazar/Devolver acta para corrección (PÚBLICO - sin autenticación)
 */
const rechazarActaConToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const transaction = yield connection_1.default.transaction();
    try {
        const { token } = req.params;
        const { motivo, correoNotificacion } = req.body;
        if (!motivo || motivo.trim().length === 0) {
            yield transaction.rollback();
            res.status(400).json({ msg: 'Debe indicar el motivo del rechazo' });
            return;
        }
        const tokenFirma = yield tokenFirma_1.TokenFirma.findOne({
            where: { token },
            include: [
                {
                    model: actaEntrega_1.ActaEntrega,
                    as: 'acta'
                }
            ],
            transaction
        });
        if (!tokenFirma) {
            yield transaction.rollback();
            res.status(404).json({ msg: 'Token inválido' });
            return;
        }
        if (tokenFirma.estado !== 'pendiente') {
            yield transaction.rollback();
            res.status(400).json({ msg: 'Este enlace ya no es válido' });
            return;
        }
        const acta = tokenFirma.acta;
        // Actualizar token
        yield tokenFirma.update({
            estado: 'rechazado',
            motivoRechazo: motivo
        }, { transaction });
        // Actualizar estado del acta
        yield actaEntrega_1.ActaEntrega.update({
            estado: 'rechazada',
            observacionesDevolucion: `Rechazada por el receptor: ${motivo}`
        }, {
            where: { id: acta.id },
            transaction
        });
        yield transaction.commit();
        // Enviar notificación de rechazo
        try {
            if (correoNotificacion) {
                yield (0, email_1.enviarNotificacionRechazo)(correoNotificacion, acta.nombreReceptor, motivo);
            }
        }
        catch (emailError) {
            console.error('Error enviando notificación de rechazo:', emailError);
        }
        res.json({
            msg: 'Acta devuelta para corrección',
            motivo
        });
    }
    catch (error) {
        yield transaction.rollback();
        console.error('Error al rechazar acta:', error);
        res.status(500).json({ msg: 'Error al procesar el rechazo' });
    }
});
exports.rechazarActaConToken = rechazarActaConToken;
/**
 * Reenviar correo de firma
 */
const reenviarCorreoFirma = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const tokenFirma = yield tokenFirma_1.TokenFirma.findOne({
            where: {
                actaId: Number(id),
                estado: 'pendiente'
            },
            include: [
                {
                    model: actaEntrega_1.ActaEntrega,
                    as: 'acta',
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
                }
            ]
        });
        if (!tokenFirma) {
            res.status(404).json({ msg: 'No hay solicitud de firma pendiente para esta acta' });
            return;
        }
        const acta = tokenFirma.acta;
        const dispositivos = ((_a = acta === null || acta === void 0 ? void 0 : acta.detalles) === null || _a === void 0 ? void 0 : _a.map((d) => {
            var _a, _b, _c, _d;
            return ({
                tipo: ((_a = d.dispositivo) === null || _a === void 0 ? void 0 : _a.categoria) || 'Dispositivo',
                marca: ((_b = d.dispositivo) === null || _b === void 0 ? void 0 : _b.marca) || '',
                modelo: ((_c = d.dispositivo) === null || _c === void 0 ? void 0 : _c.modelo) || '',
                serial: ((_d = d.dispositivo) === null || _d === void 0 ? void 0 : _d.serial) || 'N/A'
            });
        })) || [];
        yield (0, email_1.enviarCorreoFirma)(acta.correoReceptor, acta.nombreReceptor, tokenFirma.token, dispositivos, acta.observacionesEntrega);
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
exports.reenviarCorreoFirma = reenviarCorreoFirma;
/**
 * Obtener estado de firma de un acta
 */
const obtenerEstadoFirma = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const tokens = yield tokenFirma_1.TokenFirma.findAll({
            where: { actaId: Number(id) },
            order: [['fechaEnvio', 'DESC']]
        });
        const tokenActivo = tokens.find(t => t.estado === 'pendiente');
        const tokenFirmado = tokens.find(t => t.estado === 'firmado');
        const tokenRechazado = tokens.find(t => t.estado === 'rechazado');
        res.json({
            tieneTokenPendiente: !!tokenActivo,
            firmado: !!tokenFirmado,
            rechazado: !!tokenRechazado,
            tokenActivo: tokenActivo ? {
                fechaEnvio: tokenActivo.fechaEnvio,
                correo: tokenActivo.correoReceptor
            } : null,
            fechaFirma: tokenFirmado === null || tokenFirmado === void 0 ? void 0 : tokenFirmado.fechaFirma,
            motivoRechazo: tokenRechazado === null || tokenRechazado === void 0 ? void 0 : tokenRechazado.motivoRechazo,
            historial: tokens.map(t => ({
                estado: t.estado,
                fechaEnvio: t.fechaEnvio,
                fechaFirma: t.fechaFirma,
                correo: t.correoReceptor
            }))
        });
    }
    catch (error) {
        console.error('Error al obtener estado de firma:', error);
        res.status(500).json({ msg: 'Error al obtener el estado de firma' });
    }
});
exports.obtenerEstadoFirma = obtenerEstadoFirma;
