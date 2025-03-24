import {
  clearRedis,
  getRedisCache,
  pool,
  setRedisCache,
} from '../../../config';
import { PaginationDto } from '../../common/dtos';
import { CustomError } from '../../common/errors';
import { FiltersSearch } from '../../common/interfaces';
import { BooleanToTinyInt, LimitOffset } from '../../common/utils';
import { Filters } from '../controllers';
import { CreateTransportistaDto } from '../dtos';
import { Transportista } from '../entities/transportista.entity';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

export class TransportistaRepository {
  constructor() {}

  static async findTransportistaByTerm(term: string, value: string) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query<RowDataPacket[]>(
        `SELECT * FROM transportistas WHERE active = 1 AND ${term} = ?`,
        [value],
      );

      if (rows.length === 0) {
        connection.release();
        return null;
      }

      const transportista = Transportista.fromRow(rows[0]);
      return transportista;
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }

  findTransportistaByTerm = async (
    term: string,
    value: string,
  ): Promise<Transportista | null> => {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query<RowDataPacket[]>(
        `SELECT * FROM transportistas WHERE active = 1 AND ${term} = ?`,
        [value],
      );

      if (rows.length === 0) {
        connection.release();
        return null;
      }

      const transportista = Transportista.fromRow(rows[0]);
      return transportista;
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  };

  getAllTransportistas = async (
    paginationDto: PaginationDto,
    filterSearch: FiltersSearch<Filters>,
  ) => {
    const connection = await pool.getConnection();

    const { filters, search } = filterSearch;

    const searchValue = `%${search}%`;
    const searchParams = Array(3).fill(searchValue);

    const { limit, offset } = LimitOffset(
      paginationDto.size!,
      paginationDto.page!,
    );

    const cacheKey = `transportistas:${search}:${JSON.stringify(filters)}:${
      paginationDto.page
    }:${paginationDto.size}`;

    try {
      const reply = await getRedisCache<{
        items: Transportista[];
        total: number;
      }>(cacheKey);
      if (reply) return reply;

      const [rows] = await connection.query<RowDataPacket[]>(
        `SELECT * FROM transportistas 
          WHERE active = 1
          AND (
            CAST(id AS CHAR) LIKE ? OR
            nombre LIKE ? OR
            cedula LIKE ?
        )
        ORDER BY id DESC
        LIMIT ? OFFSET ?
        `,
        [...searchParams, limit, offset],
      );

      const [[{ total }]] = await connection.query<RowDataPacket[]>(
        `SELECT COUNT(*) as total FROM transportistas WHERE active = 1 AND (
            CAST(id AS CHAR) LIKE ? OR
            nombre LIKE ? OR
            cedula LIKE ?
        )`,
        [...searchParams],
      );

      const transportistas = rows.map((row) => Transportista.fromRow(row));
      await setRedisCache(cacheKey, { items: transportistas, total });
      return { items: transportistas, total };
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  };

  createTransportista = async (
    createTransportistaDto: CreateTransportistaDto,
  ) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const { cedula, nombre } = createTransportistaDto;

      const [result] = await connection.query<ResultSetHeader>(
        'INSERT INTO transportistas (cedula, nombre) VALUES (?, ?)',
        [cedula, nombre],
      );

      if (result.affectedRows === 0) {
        throw CustomError.badRequest('No se pudo insertar el transportista');
      }

      const transportista = await this.findTransportistaByTerm(
        'id',
        result.insertId.toString(),
      );
      if (!transportista) {
        throw CustomError.badRequest('No se pudo insertar el transportista');
      }

      await connection.commit();

      await clearRedis('transportistas');

      return transportista;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };

  static updateTransito = async (id: number, estado: boolean) => {
    const connection = await pool.getConnection();
    const estadoInt = BooleanToTinyInt(estado);
    try {
      await connection.beginTransaction();
      const [result] = await connection.query<ResultSetHeader>(
        'UPDATE transportistas SET en_transito = ? WHERE id = ?',
        [estadoInt, id],
      );
      if (result.affectedRows === 0) {
        throw CustomError.badRequest('No se pudo actualizar el transportista');
      }
      await connection.commit();
      await clearRedis('transportistas');
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };

  static getMaestro = async () => {
    const connection = await pool.getConnection();
    const cacheKey = 'transportistas:maestro';
    try {
      const cached = await getRedisCache<Transportista>(cacheKey);
      if (cached) return cached;
      const [result] = await connection.query<RowDataPacket[]>(
        'SELECT id, nombre, cedula FROM transportistas WHERE active = 1',
      );
      if (result.length === 0) {
        throw CustomError.badRequest('No hay transportistas disponibles');
      }
      await setRedisCache(cacheKey, result);
      return result;
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  };
}
