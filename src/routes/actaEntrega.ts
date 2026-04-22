import { Router } from 'express';
import { upload } from '../config/multer.js';
import {
  obtenerActas,
  obtenerActaPorId,
  crearActaEntrega,
  actualizarActaRechazada,
  registrarDevolucion,
  obtenerActasActivas,
  obtenerHistorialDispositivo
} from '../controllers/actaEntrega.js';
import validateToken from './validateToken.js';

const router = Router();

// Obtener actas
router.get('/', validateToken, obtenerActas);
router.get('/activas', validateToken, obtenerActasActivas);
router.get('/:id', validateToken, obtenerActaPorId);
router.get('/historial/:dispositivoId', validateToken, obtenerHistorialDispositivo);

// Crear acta de entrega con fotos
router.post('/', validateToken, upload.any(), crearActaEntrega);

// Actualizar acta rechazada (corrección) - usa POST para compatibilidad con multer
router.post('/:id/corregir', validateToken, upload.any(), actualizarActaRechazada);

// Registrar devolución
router.post('/:id/devolucion', validateToken, upload.any(), registrarDevolucion);

export default router;
