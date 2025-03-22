import { pool } from '../../../config';
import { PaginationDto } from '../../common/dtos';
import { CustomError } from '../../common/errors';
import { ResultPagination } from '../../common/interfaces';
import { LimitOffset } from '../../common/utils';
import { CreateEnvioDto } from '../dtos/create-envio.dto';
import { Envio } from '../entities/envio.entity';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';

export class EnvioRepository {
  private validTerms = new Set(['e.id', 'e.direccion', 'u.email']); // Asegurar solo términos permitidos

  private _mapEnvio(row: RowDataPacket): Envio {
    const { usuario_id, name, email, ultimo_estado, active, ...rest } = row;
    return Envio.fromObject({
      ...rest,
      user: { id: usuario_id, name, email },
      ultimoEstado: ultimo_estado,
    });
  }

  async findEnvioByTerm(term: string, value: string): Promise<Envio | null> {
    if (!this.validTerms.has(term)) {
      throw CustomError.badRequest('Invalid search term');
    }

    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query<RowDataPacket[]>(
        `WITH ultimo_estado AS (
            SELECT 
                ee.envio_id, 
                ee.estado_id, 
                es.name AS ultimo_estado,
                ROW_NUMBER() OVER (PARTITION BY ee.envio_id ORDER BY ee.created_at DESC) AS rn
            FROM envios_estados ee
            INNER JOIN estados es ON ee.estado_id = es.id
        )
        SELECT 
            e.id, e.created_at, e.direccion, e.alto, e.ancho, 
            e.peso, e.largo, e.tipo_producto, 
            u.id AS usuario_id, u.name, u.email,
            ue.ultimo_estado
        FROM envios e
        INNER JOIN usuarios u ON e.usuario_id = u.id
        LEFT JOIN ultimo_estado ue ON ue.envio_id = e.id AND ue.rn = 1
        WHERE e.active = 1 
          AND u.active = 1
          AND ${term} = ?`,
        [value],
      );

      return rows.length > 0 ? this._mapEnvio(rows[0]) : null;
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }

  async getAllEnvios(
    paginationDto: PaginationDto,
  ): Promise<ResultPagination<Envio>> {
    const connection = await pool.getConnection();

    const { limit, offset } = LimitOffset(
      paginationDto.size!,
      paginationDto.page!,
    );

    try {
      // Obtener los datos paginados
      const [rows] = await connection.query<RowDataPacket[]>(
        `WITH ultimo_estado AS (
            SELECT 
                ee.envio_id, 
                ee.estado_id, 
                es.name AS ultimo_estado,
                ROW_NUMBER() OVER (PARTITION BY ee.envio_id ORDER BY ee.created_at DESC) AS rn
            FROM envios_estados ee
            INNER JOIN estados es ON ee.estado_id = es.id
        )
        SELECT 
            e.id, e.created_at, e.direccion, e.alto, e.ancho, 
            e.peso, e.largo, e.tipo_producto, 
            u.id AS usuario_id, u.name, u.email,
            ue.ultimo_estado
        FROM envios e
        INNER JOIN usuarios u ON e.usuario_id = u.id
        LEFT JOIN ultimo_estado ue ON ue.envio_id = e.id AND ue.rn = 1
        WHERE e.active = 1 
          AND u.active = 1
      LIMIT ? OFFSET ?`,
        [limit, offset],
      );

      // Obtener el total de registros sin paginación
      const [[{ total }]] = await connection.query<RowDataPacket[]>(
        `SELECT COUNT(*) as total 
      FROM envios e 
      INNER JOIN usuarios u ON e.usuario_id = u.id
      WHERE e.active = 1 AND u.active = 1`,
      );

      const items = rows.map(this._mapEnvio);
      return { items, total };
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }

  async createEnvio(envioDto: CreateEnvioDto): Promise<Envio> {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const { direccion, alto, ancho, peso, largo, tipoProducto, usuarioId } =
        envioDto;

      // Insertar en la tabla "envios"
      const [result] = await connection.query<ResultSetHeader>(
        `INSERT INTO envios (direccion, alto, ancho, peso, largo, tipo_producto, usuario_id) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [direccion, alto, ancho, peso, largo, tipoProducto, usuarioId],
      );

      if (!result.insertId) {
        throw CustomError.badRequest('No se pudo crear el envío');
      }

      // Insertar en la tabla "envios_estados"
      const [resultEstado] = await connection.query<ResultSetHeader>(
        `INSERT INTO envios_estados (envio_id, estado_id) VALUES (?, ?)`,
        [result.insertId, 2],
      );

      if (!resultEstado.insertId) {
        throw CustomError.badRequest(
          'No se pudo registrar el estado del envío',
        );
      }

      await connection.commit();

      // Obtener el envío creado
      const envio = await this.findEnvioByTerm(
        'e.id',
        result.insertId.toString(),
      );

      if (!envio) {
        throw CustomError.notFound('No se encontró el envío recién creado');
      }

      return envio;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}
