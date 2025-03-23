import { pool } from '../../../config';
import { PaginationDto } from '../../common/dtos';
import { CustomError } from '../../common/errors';
import { ResultPagination } from '../../common/interfaces';
import { convertDateToMySQL, LimitOffset } from '../../common/utils';
import { EnvioRepository } from '../../envios';
import { VehiculoRepository } from '../../vehiculos';
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
      vehiculo: { id: vehiculo_id, placa, peso_maximo, volumen_maximo },
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

      return new RutaRepository()._mapRuta(rows[0]);
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  };

  getAllRutas = async (
    pagination: PaginationDto,
  ): Promise<ResultPagination<Ruta>> => {
    const connection = await pool.getConnection();
    try {
      const { limit, offset } = LimitOffset(pagination.size, pagination.page);
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
        LIMIT ? OFFSET ?`,
        [limit, offset],
      );

      const [[{ total }]] = await connection.query<RowDataPacket[]>(
        `SELECT COUNT(*) as total FROM rutas r WHERE r.active = 1`,
      );

      return { items: rows.map((row) => this._mapRuta(row)), total };
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

      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };

  changeEstado = async (changeEstadoDto: ChangeEstadoDto) => {
    const connection = await pool.getConnection();

    const estados = {
      Pendiente: 'En Espera',
      'En transito': 'En transito',
    };

    try {
      await connection.beginTransaction();

      const params = [changeEstadoDto.estado];

      const fechaLocal = convertDateToMySQL(new Date());

      let aditionals = '';

      if (changeEstadoDto.estado == 'En transito') {
        aditionals += ', fecha_inicio = ?';
        params.push(fechaLocal);
      }

      if (changeEstadoDto.estado == 'Finalizado') {
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

      const envios = await EnvioRepository.obtenerEnviosPorRuta(
        changeEstadoDto.id,
      );

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

      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
