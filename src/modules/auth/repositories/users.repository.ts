import { pool } from '../../../config';
import { CustomError } from '../../common/errors';
import { CreateUserDto } from '../dtos';
import { User } from '../entities/user.entity';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

export class UsersRepository {
  constructor() {}

  findUserByTerm = async (
    term: string,
    value: string,
  ): Promise<User | null> => {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query<RowDataPacket[]>(
        `SELECT * FROM usuarios WHERE ${term} = ?`,
        [value],
      );

      if (rows.length === 0) {
        connection.release();
        return null;
      }

      const { id, name, password, role, created_at, active, email } = rows[0];
      const user = User.fromJson({
        id,
        name,
        email,
        password,
        role,
        created_at,
        active,
      });
      return user;
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  };

  createUser = async (createUserDto: CreateUserDto, roleToAssign?: string) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [result] = await connection.query<ResultSetHeader>(
        'INSERT INTO usuarios (name, email, password, role) VALUES (?, ?, ?, ?)',
        [
          createUserDto.name,
          createUserDto.email,
          createUserDto.password,
          roleToAssign || 'cliente',
        ],
      );

      if (result.affectedRows === 0) {
        throw CustomError.badRequest('No se pudo insertar el usuario');
      }

      const user = await this.findUserByTerm('id', result.insertId.toString());
      if (!user) throw CustomError.badRequest('No se pudo insertar el usuario');

      await connection.commit();
      return user;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };

  getUsers = async () => {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM usuarios');
    connection.release();
    return rows;
  };
}
