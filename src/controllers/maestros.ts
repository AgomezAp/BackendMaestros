import {
  Request,
  Response,
} from 'express';
import { Op } from 'sequelize';

import { maestroBorrado } from '../models/maestroBorrado';
import { Maestro } from '../models/maestros';
import { MovimientoMaestro } from '../models/movimientoMaestro';

export const registrarMaestro = async ( req: Request,
  res: Response
): Promise<any> => {
  const { nombre, apellido, correo, cedula, firma, descripcion, estado, Uid } = req.body
  try {
    const maestroExistente = await Maestro.findOne({
      where: {
        [Op.or]: [{ correo }, { cedula }]
      }
    });

    if (maestroExistente) {
      return res.status(400).json({
        msg: 'El maestro ya está registrado con el correo o cédula proporcionados',
      });
    }

    // Crear el nuevo maestro
    const maestro = await Maestro.create({
      nombre,
      apellido,
      correo,
      cedula,
      firma,
      descripcion,
      estado,
      Uid,
    });

    await MovimientoMaestro.create({
        Mid: maestro.Mid,
        tipoMovimiento: 'CREACION',
    });

    res.status(200).json({
      message: "Maestro registrado con éxito",
      maestro: maestro,
    });

  } catch (err: any) {
    console.log(err);
    res.status(500).json({
      error: "Problemas al registrar el maestro",
      message: err.message || err,
    });
  }
};

export const ObtenerMaestros = async (
  req: Request,
  res: Response
): Promise<any> => {
  const listaMaestro = await Maestro.findAll();
  res.status(200).json({
    maestros: listaMaestro,
  });
};
export const ObtenerMaestrPorId = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { Mid } = req.params;
  try {
    const maestro = await Maestro.findByPk(Mid);
    if (!maestro) {
      return res.status(404).json({
        message: `No existe el maestro con el id: ${Mid}`,
      });
    }

    res.status(200).json({
      message: `Maestro con ID ${Mid} encontrado`,
      maestro,
    });
  } catch (err: any) {
    console.log(err);
    res.status(500).json({
      error: "Problemas al obtener el maestro",
      message: err.message || err,
    });
  }
};

export const borrarMaestrosPorId = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { Mid } = req.params;
  try {
    const maestro = await Maestro.findByPk(Mid);

    if (!maestro) {
      return res.status(404).json({
        message: `No existe el maestro con el id: ${Mid}`,
      });
    }
    await maestroBorrado.create({
      Mid: maestro.Mid,
      nombre: maestro.nombre,
      apellido: maestro.apellido,
      correo: maestro.correo,
      cedula: maestro.cedula,
      firma: maestro.firma,
      descripcion: maestro.descripcion,
      Uid: maestro.Uid,
      estado: 'INACTIVO',
      deletedAt: new Date(),
    });

    await MovimientoMaestro.create({
        Mid: maestro.Mid,
        tipoMovimiento: 'ELIMINACION',
    });

    await Maestro.destroy({ where: { Mid } });
    res.status(200).json({
      message: `Maestro con ID ${Mid} eliminado`,
    });

  } catch (err: any) {
    console.log(err);
    res.status(500).json({
      error: "Problemas al obtener el maestro",
      message: err.message || err,
    });
  }
};

export const actualizarMaestro = async (req: Request, res: Response): Promise<any> => {
    const { Mid } = req.params;
    const { nombre, apellido, correo, cedula, firma, descripcion } = req.body;
    try {
        const maestro = await Maestro.findByPk(Mid);
        if(!maestro){
            return res.status(404).json({
                message: `No existe el maestro con el id: ${Mid}`,
            });
        }

        await Maestro.update({
            nombre,
            apellido,
            correo,
            cedula,
            firma,
            descripcion,
        }, {where: {Mid}});
        res.status(200).json({
            message: `Maestro con ID ${Mid} actualizado`,
        });

    } catch (err: any) {
        console.error(err);
        res.status(500).json({
            error: 'Problemas al actualizar el maestro',
            message: err.message || err,
        });
    }
}


export const generarReporte = async (req: Request, res: Response): Promise<any> => {
    const { fechaInicio, fechaFin } = req.query;
  
    try {
      const movimientos = await MovimientoMaestro.findAll({
        where: {
          fechaMovimiento: {
            [Op.between]: [new Date(fechaInicio as string), new Date(fechaFin as string)],
          },
        },
      });
  
      res.status(200).json({
        message: 'Reporte generado con éxito',
        movimientos: movimientos,
      });
    } catch (err: any) {
      console.log(err);
      res.status(500).json({
        error: 'Problemas al generar el reporte',
        message: err.message || err,
      });
    }
  };
  
  export const generarReporteMensual = async (req: Request, res: Response): Promise<any> => {
    const { mes, año } = req.query;
  
    try {
      const fechaInicio = new Date(Number(año), Number(mes) - 1, 1);
      const fechaFin = new Date(Number(año), Number(mes), 0);
  
      const movimientos = await MovimientoMaestro.findAll({
        where: {
          fechaMovimiento: {
            [Op.between]: [fechaInicio, fechaFin],
          },
        },
      });
  
      res.status(200).json({
        message: 'Reporte mensual generado con éxito',
        movimientos: movimientos,
      });
    } catch (err: any) {
      console.log(err);
      res.status(500).json({
        error: 'Problemas al generar el reporte mensual',
        message: err.message || err,
      });
    }
  };

  export const obtenerTodosLosMaestros = async (req: Request, res: Response): Promise<any> => {
    try {
      // Obtener maestros activos
      const maestrosActivos = await Maestro.findAll();
  
      // Obtener maestros inactivos
      const maestrosInactivos = await maestroBorrado.findAll();
  
      // Combinar los resultados
      const todosLosMaestros = [...maestrosActivos, ...maestrosInactivos];
  
      res.status(200).json({
        message: 'Lista de todos los maestros (activos e inactivos)',
        maestros: todosLosMaestros,
      });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({
        error: 'Problemas al obtener la lista de maestros',
        message: err.message || err,
      });
    }
  };