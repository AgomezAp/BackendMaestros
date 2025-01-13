import {
  Request,
  Response,
} from 'express';
import { Op } from 'sequelize';

import { maestroBorrado } from '../models/maestroBorrado';
import { Maestro } from '../models/maestros';
import { MovimientoMaestro } from '../models/movimientoMaestro';
import { User } from '../models/user';

export const registrarMaestro = async (
  req: Request,
  res: Response
): Promise<any> => {
  const {
    nombre,
    apellido,
    NombreMaestro,
    correo,
    cedula,
    firma,
    descripcion,
    estado,
    region,
    marca,
    modelo,
    Uid,
  } = req.body;
  try {
    const maestroExistente = await Maestro.findOne({
      where: {
        [Op.or]: [{ correo }, { cedula }],
      },
    });

    if (maestroExistente) {
      return res.status(400).json({
        msg: "El maestro ya está registrado con el correo o cédula proporcionados",
      });
    }

    // Crear el nuevo maestro
    const maestro = await Maestro.create({
      nombre,
      apellido,
      NombreMaestro,
      correo,
      cedula,
      firma,
      descripcion,
      estado,
      region,
      marca,
      modelo,
      Uid,
    });

    await MovimientoMaestro.create({
      Mid: maestro.Mid,
      tipoMovimiento: "CREACION",
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
      NombreMaestro: maestro.NombreMaestro,
      correo: maestro.correo,
      cedula: maestro.cedula,
      firma: maestro.firma,
      descripcion: maestro.descripcion,
      region: maestro.region,
      marca: maestro.marca,
      modelo: maestro.modelo,
      Uid: maestro.Uid,
      estado: "INACTIVO",
      deletedAt: new Date(),
    });

    await MovimientoMaestro.create({
      Mid: maestro.Mid,
      tipoMovimiento: "ELIMINACION",
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

export const actualizarMaestro = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { Mid } = req.params;
  const { nombre, apellido,NombreMaestro ,correo, cedula, firma, descripcion, region, estado} =
    req.body;
  try {
    const maestro = await Maestro.findByPk(Mid);
    if (!maestro) {
      return res.status(404).json({
        message: `No existe el maestro con el id: ${Mid}`,
      });
    }

    await Maestro.update(
      {
        nombre,
        apellido,
        NombreMaestro,
        correo,
        cedula,
        firma,
        region,
        estado,
        descripcion,
      },
      { where: { Mid } }
    );
    res.status(200).json({
      message: `Maestro con ID ${Mid} actualizado`,
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({
      error: "Problemas al actualizar el maestro",
      message: err.message || err,
    });
  }
};

export const maestrosActivos = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const maestros = await Maestro.findAll({
      where: { estado: "activo" },
      include: [
        {
          model: User,
          as: "usuarios",
          attributes: ["nombre", "apellido"], // Ajusta los atributos según tus necesidades
        },
      ],
    });

    res.status(200).json(maestros);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({
      error: "Problemas al obtener los maestros activos",
      message: err.message || err,
    });
  }
};

export const generarReporte = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { fechaInicio, fechaFin } = req.body;

  // Validar que las fechas sean válidas
  if (!fechaInicio || !fechaFin) {
    return res.status(400).json({
      error: "Problemas al generar el reporte",
      message: "Las fechas de inicio y fin son requeridas",
    });
  }

  const fechaInicioDate = new Date(fechaInicio);
  const fechaFinDate = new Date(fechaFin);

  if (isNaN(fechaInicioDate.getTime()) || isNaN(fechaFinDate.getTime())) {
    return res.status(400).json({
      error: "Problemas al generar el reporte",
      message: "Formato de fecha inválido",
    });
  }

  try {
    const movimientos = await MovimientoMaestro.findAll({
      where: {
        fechaMovimiento: {
          [Op.between]: [fechaInicioDate, fechaFinDate],
        },
      },
    });

    res.status(200).json({
      message: "Reporte generado con éxito",
      movimientos: movimientos,
    });
  } catch (err: any) {
    console.log(err);
    res.status(500).json({
      error: "Problemas al generar el reporte",
      message: err.message || err,
    });
  }
};

export const generarReporteMensual = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const now = new Date();
    const mes = now.getMonth(); // Mes actual (0-11)
    const año = now.getFullYear(); // Año actual

    const fechaInicio = new Date(año, mes, 1);
    const fechaFin = new Date(año, mes + 1, 0);

    const movimientos = await MovimientoMaestro.findAll({
      where: {
        fechaMovimiento: {
          [Op.between]: [fechaInicio, fechaFin],
        },
      },
    });

    res.status(200).json({
      message: "Reporte mensual generado con éxito",
      movimientos: movimientos,
    });
  } catch (err: any) {
    console.log(err);
    res.status(500).json({
      error: "Problemas al generar el reporte mensual",
      message: err.message || err,
    });
  }
};
export const reactivarMaestro = async (req: Request, res: Response): Promise<any> =>{
  const { Mid } = req.params;

  try {
    // Buscar el maestro en la tabla maestros_borrados
    const maestroInactivo = await maestroBorrado.findOne({ where: { Mid } });

    if (!maestroInactivo) {
      return res.status(404).json({
        error: 'Maestro no encontrado en la tabla de maestros inactivos',
      });
    }

    // Mover el maestro a la tabla maestros
    const maestroActivo = await Maestro.create({
      Mid: maestroInactivo.Mid,
      nombre: maestroInactivo.nombre,
      apellido: maestroInactivo.apellido,
      NombreMaestro: maestroInactivo.NombreMaestro,
      correo: maestroInactivo.correo,
      cedula: maestroInactivo.cedula,
      firma: maestroInactivo.firma,
      descripcion: maestroInactivo.descripcion,
      Uid: maestroInactivo.Uid,
      estado: 'activo',
      region : maestroInactivo.region,
      marca : maestroInactivo.marca,
      modelo : maestroInactivo.modelo
    });

    // Eliminar el maestro de la tabla maestros_borrados
    await maestroBorrado.destroy({ where: { Mid } });

    res.status(200).json({
      message: 'Maestro reactivado exitosamente',
      maestro: maestroActivo,
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({
      error: 'Problemas al reactivar el maestro',
      message: err.message || err,
    });
  }
};
export const obtenerTodosLosMaestros = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    // Obtener maestros activos
    const maestrosActivos = await Maestro.findAll({
      include: [
        {
          model: User,
          as: "usuarios",
          attributes: ["nombre", "apellido"], // Ajusta los atributos según tus necesidades
        },
      ],
    });

    // Obtener maestros inactivos
    const maestrosInactivos = await maestroBorrado.findAll({
      include: [
        {
          model: User,
          as: "usuarios",
          attributes: ["nombre", "apellido"], // Ajusta los atributos según tus necesidades
        },
      ],
    });

    // Combinar los resultados
    const todosLosMaestros = [...maestrosActivos, ...maestrosInactivos];

    res.status(200).json({
      message: "Lista de todos los maestros (activos e inactivos)",
      maestros: todosLosMaestros,
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({
      error: "Problemas al obtener la lista de maestros",
      message: err.message || err,
    });
  }
};
