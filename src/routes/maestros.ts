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
import validateToken from './validateToken';

const router = Router();

router.post( "/api/maestros/registrar-maestro",validateToken,registrarMaestro);
router.get("/api/maestros/obtener-maestros",validateToken,ObtenerMaestros);
router.delete("/api/maestros/borrar-maestro/:Mid",validateToken,borrarMaestrosPorId);
router.patch("/api/maestros/actualizar-maestro/:Mid",validateToken,actualizarMaestro);
router.get('/api/reporte',validateToken ,generarReporte);
router.get('/api/reporte-mensual', validateToken,generarReporteMensual);
router.get('/api/obtenerRecordMaestros',validateToken ,obtenerTodosLosMaestros);

export default router;
