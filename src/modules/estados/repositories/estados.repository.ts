import {
  clearRedis,
  getRedisCache,
  pool,
  setRedisCache,
} from '../../../config';
import { CustomError } from '../../common/errors';
import { CreateEstadoDto } from '../dtos';
import { Estado } from '../entities/estado.entity';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

export class EstadoRepository {
  constructor() {}

  static findEstadoByTerm = async (
    term: string,
    value: string,
  ): Promise<Estado | null> => {
    const connection = await pool.getConnection();
    try {
      const reply = await getRedisCache<Estado>(`estados:${term}:${value}`);
      if (reply) return reply;

      const [rows] = await connection.query<RowDataPacket[]>(
        `SELECT * FROM estados WHERE ${term} = ?`,
        [value],
      );

      if (rows.length === 0) {
        connection.release();
        return null;
      }

      const estado = Estado.fromRow(rows[0]);
      await setRedisCache(`estados:${term}:${value}`, estado);
      return estado;
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  };

  getAllEstados = async () => {
    const reply = await getRedisCache<Estado[]>('estados');
    if (reply) return reply;

    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query<RowDataPacket[]>(
        'SELECT * FROM estados WHERE active = 1',
      );
      const estados = rows.map((row) => Estado.fromRow(row));
      await setRedisCache('estados', estados);
      return estados;
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  };

  createEstado = async (createEstadoDto: CreateEstadoDto) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [result] = await connection.query<ResultSetHeader>(
        'INSERT INTO estados (name, descripcion) VALUES (?, ?)',
        [createEstadoDto.name, createEstadoDto.descripcion],
      );

      if (result.affectedRows === 0) {
        throw CustomError.badRequest('No se pudo insertar el estado');
      }

      const estado = EstadoRepository.findEstadoByTerm(
        'id',
        result.insertId.toString(),
      );
      if (!estado)
        throw CustomError.badRequest('No se pudo insertar el estado');

      await connection.commit();
      await clearRedis('estados');
      return estado;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
