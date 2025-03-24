import {
  clearRedis,
  getRedisCache,
  pool,
  setRedisCache,
} from '../../../config';
import { CustomError } from '../../common/errors';
import { BooleanToTinyInt, LimitOffset } from '../../common/utils';
import { CreateVehiculoDto } from '../dtos';
import { Vehiculo } from '../entities/vehiculo.entity';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { PaginationDto } from '../../common/dtos';
import { FiltersSearch, ResultPagination } from '../../common/interfaces';
import { Filters } from '../controllers';

export class VehiculoRepository {
  constructor() {}

  static async findVehiculoByTerm(term: string, value: string) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query<RowDataPacket[]>(
        `SELECT * FROM vehiculos WHERE active = 1 AND ${term} = ?`,
        [value],
      );

      if (rows.length === 0) {
        connection.release();
        return null;
      }

      return Vehiculo.fromRow(rows[0]);
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }

  getAllVehiculos = async (
    paginationDto: PaginationDto,
    filtersSearch: FiltersSearch<Filters>,
  ) => {
    const connection = await pool.getConnection();

    const { filters, search } = filtersSearch;
    const searchValue = `%${search}%`;
    const searchParams = Array(4).fill(searchValue);

    const { limit, offset } = LimitOffset(
      paginationDto.size!,
      paginationDto.page!,
    );

    const cacheKey = `vehiculos:${search}:${JSON.stringify(filters)}:${
      paginationDto.page
    }:${paginationDto.size}`;

    try {
      const cached = await getRedisCache<ResultPagination<Vehiculo>>(cacheKey);

      if (cached) {
        return cached;
      }
      const [rows] = await connection.query<RowDataPacket[]>(
        `SELECT * FROM vehiculos WHERE active = 1 AND (
            CAST(id AS CHAR) LIKE ? OR
            placa LIKE ? OR
            peso_maximo LIKE ? OR
            volumen_maximo LIKE ?
        ) LIMIT ? OFFSET ?`,
        [...searchParams, limit, offset],
      );

      const [[{ total }]] = await connection.query<RowDataPacket[]>(
        `SELECT COUNT(*) as total FROM vehiculos WHERE active = 1 AND (
            CAST(id AS CHAR) LIKE ? OR
            placa LIKE ? OR
            peso_maximo LIKE ? OR
            volumen_maximo LIKE ?
        )`,
        [...searchParams],
      );

      const items = rows.map((row) => Vehiculo.fromRow(row));
      await setRedisCache(cacheKey, { items, total });
      return { items, total };
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  };

  createVehiculo = async (createVehiculoDto: CreateVehiculoDto) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const { placa, volumen_maximo, peso_maximo } = createVehiculoDto;

      const [result] = await connection.query<ResultSetHeader>(
        'INSERT INTO vehiculos (placa, volumen_maximo, peso_maximo) VALUES (?, ?, ?)',
        [placa, volumen_maximo, peso_maximo],
      );

      if (result.affectedRows === 0) {
        throw CustomError.badRequest('No se pudo insertar el vehiculo');
      }

      const vehiculo = await VehiculoRepository.findVehiculoByTerm(
        'id',
        result.insertId.toString(),
      );
      if (!vehiculo) {
        throw CustomError.badRequest('No se pudo insertar el vehiculo');
      }

      await connection.commit();

      await clearRedis('vehiculos');

      return vehiculo;
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
        'UPDATE vehiculos SET en_transito = ? WHERE id = ?',
        [estadoInt, id],
      );
      if (result.affectedRows === 0) {
        throw CustomError.badRequest('No se pudo actualizar el vehiculo');
      }
      await connection.commit();
      await clearRedis('vehiculos');
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
    const cacheKey = 'vehiculos:maestro';
    try {
      const cached = await getRedisCache<Vehiculo>(cacheKey);
      if (cached) return cached;
      const [result] = await connection.query<RowDataPacket[]>(
        'SELECT id, placa FROM vehiculos WHERE active = 1',
      );
      if (result.length === 0) {
        throw CustomError.badRequest('No hay vehiculos disponibles');
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
