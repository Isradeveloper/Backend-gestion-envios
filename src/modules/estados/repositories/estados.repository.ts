import { pool } from '../../../config';
import { CustomError } from '../../common/errors';
import { CreateEstadoDto } from '../dtos';
import { Estado } from '../entities/estado.entity';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

export class EstadoRepository {
  constructor() {}

  findEstadoByTerm = async (
    term: string,
    value: string,
  ): Promise<Estado | null> => {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query<RowDataPacket[]>(
        `SELECT * FROM estados WHERE ${term} = ?`,
        [value],
      );

      if (rows.length === 0) {
        connection.release();
        return null;
      }

      return Estado.fromRow(rows[0]);
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  };

  getAllEstados = async () => {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query<RowDataPacket[]>(
        'SELECT * FROM estados WHERE active = 1',
      );
      return rows.map((row) => Estado.fromRow(row));
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

      const estado = await this.findEstadoByTerm(
        'id',
        result.insertId.toString(),
      );
      if (!estado)
        throw CustomError.badRequest('No se pudo insertar el estado');

      await connection.commit();
      return estado;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
