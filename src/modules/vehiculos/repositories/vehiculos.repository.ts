import { pool } from '../../../config';
import { CustomError } from '../../common/errors';
import { BooleanToTinyInt } from '../../common/utils';
import { CreateVehiculoDto } from '../dtos';
import { Vehiculo } from '../entities/vehiculo.entity';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

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

  getAllVehiculos = async () => {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query<RowDataPacket[]>(
        'SELECT * FROM vehiculos WHERE active = 1',
      );
      return rows.map((row) => Vehiculo.fromRow(row));
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
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
