import { pool } from '../../../config';
import { CustomError } from '../../common/errors';
import { BooleanToTinyInt } from '../../common/utils';
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

      return Transportista.fromRow(rows[0]);
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
        `SELECT * FROM transportistas WHERE ${term} = ?`,
        [value],
      );

      if (rows.length === 0) {
        connection.release();
        return null;
      }

      return Transportista.fromRow(rows[0]);
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  };

  getAllTransportistas = async () => {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query<RowDataPacket[]>(
        'SELECT * FROM transportistas WHERE active = 1',
      );
      return rows.map((row) => Transportista.fromRow(row));
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
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
