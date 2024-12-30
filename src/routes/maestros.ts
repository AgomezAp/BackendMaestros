import { Router } from 'express';

import {
  actualizarMaestro,
  borrarMaestrosPorId,
  generarReporte,
  generarReporteMensual,
  ObtenerMaestros,
  obtenerTodosLosMaestros,
  registrarMaestro,
} from '../controllers/maestros';

const router = Router();

router.post( "/api/maestros/registrar-maestro",registrarMaestro);
router.get("/api/maestros/obtener-maestros",ObtenerMaestros);
router.delete("/api/maestros/borrar-maestro/:Mid",borrarMaestrosPorId);
router.patch("/api/maestros/actualizar-maestro/:Mid",actualizarMaestro);
router.get('/api/reporte', generarReporte);
router.get('/api/reporte-mensual', generarReporteMensual);
router.get('/api/obtenerRecordMaestros', obtenerTodosLosMaestros);

export default router;
