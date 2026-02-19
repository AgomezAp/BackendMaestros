import { Router } from 'express';
import { upload } from '../config/multer.js';
import {
  obtenerDispositivos,
  obtenerDisponibles,
  obtenerDispositivoPorId,
  registrarDispositivo,
  actualizarDispositivo,
  cambiarEstadoDispositivo,
  obtenerEstadisticas,
  obtenerTrazabilidad,
  darDeBajaDispositivo,
  eliminarDispositivo,
  agregarFotosDispositivo
} from '../controllers/dispositivo.js';
import validateToken from './validateToken.js';

const router = Router();

// Rutas específicas primero (antes de las rutas con parámetros dinámicos)
router.get('/disponibles', validateToken, obtenerDisponibles);
router.get('/estadisticas', validateToken, obtenerEstadisticas);

// Middleware para agregar tipoUpload antes de multer
const agregarTipoUploadDispositivos = (req: any, res: any, next: any) => {
  req.body.tipoUpload = 'dispositivos';
  next();
};

// Rutas de escritura con parámetros (antes del GET genérico con :id)
router.post('/', validateToken, agregarTipoUploadDispositivos, upload.array('fotos', 10), registrarDispositivo);
router.post('/:id/fotos', validateToken, agregarTipoUploadDispositivos, upload.array('fotos', 10), agregarFotosDispositivo);
router.put('/:id', validateToken, actualizarDispositivo);
router.patch('/:id/estado', validateToken, cambiarEstadoDispositivo);
router.patch('/:id/baja', validateToken, darDeBajaDispositivo);
router.delete('/:id', validateToken, eliminarDispositivo);

// Rutas GET con parámetros dinámicos (al final para no conflictuar)
router.get('/:id/trazabilidad', validateToken, obtenerTrazabilidad);
router.get('/:id', validateToken, obtenerDispositivoPorId);
router.get('/', validateToken, obtenerDispositivos);

router.get('/', validateToken, obtenerDispositivos);

export default router;
