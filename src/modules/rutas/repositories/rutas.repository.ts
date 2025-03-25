import {
  clearRedis,
  getRedisCache,
  pool,
  setRedisCache,
} from '../../../config';
import { PaginationDto } from '../../common/dtos';
import { CustomError } from '../../common/errors';
import { FiltersSearch, ResultPagination } from '../../common/interfaces';
import { convertDateToMySQL, LimitOffset } from '../../common/utils';
import { EnvioRepository } from '../../envios';
import { Filters } from '../controllers';
import { ChangeEstadoDto, CreateRutaDto } from '../dtos';
import { Ruta } from '../entities/ruta.entity';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

export class RutaRepository {
  constructor() {}

  private _mapRuta(row: RowDataPacket): Ruta {
    const {
      transportista_id,
      nombre,
      cedula,
      vehiculo_id,
      placa,
      peso_maximo,
      volumen_maximo,
      ...rest
    } = row;
    return Ruta.fromObject({
      ...rest,
      transportista: { id: transportista_id, nombre, cedula },
      vehiculo: {
        id: vehiculo_id,
        placa,
        pesoMaximo: peso_maximo,
        volumenMaximo: volumen_maximo,
      },
    });
  }

  static findRutaByTerm = async (term: string, value: string) => {
    if (!['r.id', 'r.origen', 'r.destino'].includes(term)) {
      throw CustomError.badRequest('Parámetro term no válido');
    }

    const connection = await pool.getConnection();

    try {
      const [rows] = await connection.query<RowDataPacket[]>(
        `SELECT
          r.id,
          r.origen,
          r.destino,
          r.created_at,
          r.estado,
          t.id as transportista_id,
          t.nombre,
          t.cedula,
          v.id as vehiculo_id,
          v.volumen_maximo,
          v.peso_maximo,
          v.placa,
          r.active,
          r.fecha_inicio,
          r.fecha_fin
        FROM
          rutas r
        INNER JOIN transportistas t ON
          r.transportista_id = t.id
        INNER JOIN vehiculos v ON
          r.vehiculo_id = v.id
        WHERE
          r.active = 1
          AND ${term} = ?`,
        [value],
      );

      if (rows.length === 0) {
        connection.release();
        return null;
      }

      const ruta = new RutaRepository()._mapRuta(rows[0]);
      return ruta;
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  };

  getAllRutas = async (
    pagination: PaginationDto,
    filtersSearch: FiltersSearch<Filters>,
  ): Promise<ResultPagination<Ruta>> => {
    const connection = await pool.getConnection();

    const { filters, search } = filtersSearch;
    const searchValue = `%${search}%`;
    const searchParams = Array(6).fill(searchValue);

    let estadoFilterQuery = '';
    const params = [...searchParams];

    if (filters.estado) {
      estadoFilterQuery += `AND r.estado = ?`;
      params.push(filters.estado);
    }

    if (filters.transportistaId) {
      estadoFilterQuery += ` AND t.id = ?`;
      params.push(filters.transportistaId);
    }

    if (filters.vehiculoId) {
      estadoFilterQuery += ` AND v.id = ?`;
      params.push(filters.vehiculoId);
    }
    if (filters.fechaInicio) {
      estadoFilterQuery += ` AND r.fecha_inicio >= ? AND r.fecha_inicio < ?`;
      params.push(
        filters.fechaInicio + ' 00:00:00',
        filters.fechaInicio + ' 23:59:59',
      );
    }

    if (filters.fechaFin) {
      estadoFilterQuery += ` AND r.fecha_fin >= ? AND r.fecha_fin < ?`;
      params.push(
        filters.fechaFin + ' 00:00:00',
        filters.fechaFin + ' 23:59:59',
      );
    }

    try {
      const { limit, offset } = LimitOffset(pagination.size, pagination.page);

      params.push(limit, offset);

      const cacheKey = `rutas:${search}:${JSON.stringify(filters)}:${
        pagination.page
      }:${pagination.size}`;

      const cached = await getRedisCache<ResultPagination<Ruta>>(cacheKey);

      if (cached) return cached;

      const [rows] = await connection.query<RowDataPacket[]>(
        `SELECT
          r.id,
          r.origen,
          r.destino,
          r.created_at,
          r.estado,
          t.id as transportista_id,
          t.nombre,
          t.cedula,
          v.id as vehiculo_id,
          v.volumen_maximo,
          v.peso_maximo,
          v.placa,
          r.active,
          r.fecha_inicio,
          r.fecha_fin
        FROM
          rutas r
        INNER JOIN transportistas t ON
          r.transportista_id = t.id
        INNER JOIN vehiculos v ON
          r.vehiculo_id = v.id
        WHERE
          r.active = 1
          AND (
            CAST(r.id AS CHAR) LIKE ? OR
            r.origen LIKE ? OR
            r.destino LIKE ? OR
            t.nombre LIKE ? OR
            t.cedula LIKE ? OR
            v.placa LIKE ? 
          )
          ${estadoFilterQuery}
        ORDER BY
          r.created_at DESC
        LIMIT ? OFFSET ?`,
        params,
      );

      const [[{ total }]] = await connection.query<RowDataPacket[]>(
        `SELECT COUNT(*) as total
          FROM
            rutas r
          INNER JOIN transportistas t ON
            r.transportista_id = t.id
          INNER JOIN vehiculos v ON
            r.vehiculo_id = v.id
          WHERE
            r.active = 1
          AND (
            CAST(r.id AS CHAR) LIKE ? OR
            r.origen LIKE ? OR
            r.destino LIKE ? OR
            t.nombre LIKE ? OR
            t.cedula LIKE ? OR
            v.placa LIKE ? 
          )
          ${estadoFilterQuery}`,
        params,
      );

      const items = rows.map(this._mapRuta);

      await setRedisCache(cacheKey, {
        items,
        total,
      });

      return { items, total };
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  };

  createRuta = async (createRutaDto: CreateRutaDto) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const { transportistaId, vehiculoId, origen, destino } = createRutaDto;

      const [result] = await connection.query<ResultSetHeader>(
        'INSERT INTO rutas (transportista_id, vehiculo_id, origen, destino) VALUES (?, ?, ?, ?)',
        [transportistaId, vehiculoId, origen, destino],
      );

      if (result.affectedRows === 0) {
        throw CustomError.badRequest('No se pudo insertar la ruta');
      }

      await connection.commit();

      const ruta = await RutaRepository.findRutaByTerm(
        'r.id',
        result.insertId.toString(),
      );

      if (!ruta) {
        throw CustomError.badRequest('No se pudo insertar la ruta');
      }

      await clearRedis('rutas');

      return ruta;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };

  asociateManyEnvios = async (rutaId: number, enviosIds: number[]) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      for (const envioId of enviosIds) {
        const [result] = await connection.query<ResultSetHeader>(
          'UPDATE envios SET ruta_id = ? WHERE id = ?',
          [rutaId, envioId],
        );

        if (result.affectedRows === 0) {
          throw CustomError.badRequest(
            `No se pudo asociar el envío con el id ${envioId}`,
          );
        }
      }

      await connection.commit();

      await clearRedis('rutas');
      await clearRedis('envios');

      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };

  changeEstado = async (
    changeEstadoDto: ChangeEstadoDto,
    vehiculoId: string,
    conductorId: string,
  ) => {
    const connection = await pool.getConnection();

    const estados = {
      Pendiente: 'En Espera',
      'En transito': 'En transito',
      Finalizada: 'Entregado',
    };

    const enTransito = changeEstadoDto.estado === 'En transito' ? 1 : 0;

    try {
      await connection.beginTransaction();

      const params = [changeEstadoDto.estado];

      const fechaLocal = convertDateToMySQL(new Date());

      let aditionals = '';

      if (changeEstadoDto.estado == 'En transito') {
        aditionals += ', fecha_inicio = ?';
        params.push(fechaLocal);
      }

      if (changeEstadoDto.estado == 'Finalizada') {
        aditionals += ', fecha_fin = ?';
        params.push(fechaLocal);
      }

      params.push(changeEstadoDto.id.toString());

      const [result] = await connection.query<ResultSetHeader>(
        `UPDATE rutas SET estado = ? ${aditionals} WHERE id = ?`,
        params,
      );

      if (result.affectedRows === 0) {
        throw CustomError.badRequest('No se pudo cambiar el estado de la ruta');
      }

      const [resultVehiculo] = await connection.query<ResultSetHeader>(
        'UPDATE vehiculos SET en_transito = ? WHERE id = ?',
        [enTransito, vehiculoId],
      );

      if (resultVehiculo.affectedRows === 0) {
        throw CustomError.badRequest(
          `No se pudo cambiar el estado del vehículo con el id ${vehiculoId}`,
        );
      }

      const [resultConductor] = await connection.query<ResultSetHeader>(
        'UPDATE transportistas SET en_transito = ? WHERE id = ?',
        [enTransito, conductorId],
      );

      if (resultConductor.affectedRows === 0) {
        throw CustomError.badRequest(
          `No se pudo cambiar el estado del conductor con el id ${conductorId}`,
        );
      }

      const envios = await EnvioRepository.getEnviosPorRuta(changeEstadoDto.id);

      for (const envio of envios) {
        const [rows] = await connection.query<RowDataPacket[]>(
          'SELECT * FROM estados WHERE name = ? AND active = 1',
          [estados[changeEstadoDto.estado as keyof typeof estados]],
        );

        if (rows.length === 0) {
          throw CustomError.badRequest(
            `No se encontro el estado ${
              estados[changeEstadoDto.estado as keyof typeof estados]
            }`,
          );
        }

        const [result] = await connection.query<ResultSetHeader>(
          'INSERT INTO envios_estados (envio_id, estado_id) VALUES (?, ?)',
          [envio.id, rows[0].id],
        );

        if (result.affectedRows === 0) {
          throw CustomError.badRequest(
            `No se pudo cambiar el estado del envío con el id ${envio.id}`,
          );
        }
      }

      await connection.commit();

      await clearRedis('rutas');
      await clearRedis('envios');
      await clearRedis('vehiculos');
      await clearRedis('transportistas');

      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };

  static getEnviosAsociados = async (rutaId: number) => {
    const connection = await pool.getConnection();

    try {
      const [rows] = await connection.query<RowDataPacket[]>(
        `SELECT
          e.id,
          e.codigo
        FROM
          envios e
        WHERE
          e.active = 1 AND
          e.ruta_id = ?`,
        [rutaId],
      );

      return rows;
    } catch (error) {
      throw error;
    } finally {
      connection.release;
    }
  };

  getRutasPendientes = async () => {
    const cacheKey = 'rutas:pendientes';

    const cached = await getRedisCache(cacheKey);
    if (cached) return cached;

    const connection = await pool.getConnection();

    try {
      const [rows] = await connection.query<RowDataPacket[]>(
        `SELECT
          r.id,
          r.origen,
          r.destino
        FROM
          rutas r
        WHERE
          r.active = 1
          AND r.estado = 'Pendiente'`,
      );

      await setRedisCache(cacheKey, rows);
      return rows;
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  };

  static getUltimoEstadoEnvio = async (envioId: number) => {
    const connection = await pool.getConnection();

    try {
      const [rows] = await connection.query<RowDataPacket[]>(
        `SELECT
          ee.created_at AS fecha,
          envios.direccion,
          e.name AS estado,
          envios.codigo,
          envios.id
        FROM
          envios_estados ee
        INNER JOIN envios ON
          envios.id = ee.envio_id
        INNER JOIN estados e ON
          ee.estado_id = e.id
        WHERE
          envios.id = ?
        ORDER BY
          ee.created_at DESC
        LIMIT 1;`,
        [envioId],
      );

      if (rows.length === 0) {
        return null;
      }

      return rows[0];
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  };
}
