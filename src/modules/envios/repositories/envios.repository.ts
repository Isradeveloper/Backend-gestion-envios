import {
  clearRedis,
  getRedisCache,
  pool,
  redisClient,
  setRedisCache,
} from '../../../config';
import { PaginationDto } from '../../common/dtos';
import { CustomError } from '../../common/errors';
import { FiltersSearch, ResultPagination } from '../../common/interfaces';
import { LimitOffset } from '../../common/utils';
import { Filters } from '../controllers';
import { CreateEnvioDto } from '../dtos/create-envio.dto';
import { Envio, EstadosEnvio } from '../entities/envio.entity';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';

export class EnvioRepository {
  private validTerms = new Set(['e.id', 'e.direccion', 'u.email']); // Asegurar solo términos permitidos

  private _mapEnvio(row: RowDataPacket): Envio {
    const {
      usuario_id,
      name,
      email,
      ultimo_estado,
      active,
      ruta_id,
      origen,
      destino,
      ruta_estado,
      fecha_inicio,
      fecha_fin,
      transportista_id,
      transportista_nombre,
      transportista_cedula,
      vehiculo_id,
      vehiculo_placa,
      peso_maximo,
      volumen_maximo,
      ...rest
    } = row;
    return Envio.fromObject({
      ...rest,
      user: { id: usuario_id, name, email },
      ultimoEstado: ultimo_estado,
      ruta: ruta_id
        ? {
            id: ruta_id,
            origen,
            destino,
            estado: ruta_estado,
            fechaInicio: fecha_inicio,
            fechaFin: fecha_fin,
            transportista: {
              id: transportista_id,
              nombre: transportista_nombre,
              cedula: transportista_cedula,
            },
            vehiculo: {
              id: vehiculo_id,
              placa: vehiculo_placa,
              pesoMaximo: peso_maximo,
              volumenMaximo: volumen_maximo,
            },
          }
        : null,
    });
  }

  static async simpleFindEnvioByTerm(
    term: string,
    value: string,
  ): Promise<RowDataPacket | null> {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query<RowDataPacket[]>(
        `SELECT * FROM envios WHERE active = 1 AND ${term} = ?`,
        [value],
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
              e.codigo,
              ue.ultimo_estado,
              r.id AS ruta_id, r.origen, r.destino, r.created_at AS ruta_creada,
              r.estado AS ruta_estado, r.fecha_inicio, r.fecha_fin, r.active AS ruta_activa,
              t.id AS transportista_id, t.nombre AS transportista_nombre, t.cedula AS transportista_cedula,
              v.id AS vehiculo_id, v.volumen_maximo, v.peso_maximo, v.placa AS vehiculo_placa
          FROM envios e
          INNER JOIN usuarios u ON e.usuario_id = u.id
          LEFT JOIN ultimo_estado ue ON ue.envio_id = e.id AND ue.rn = 1
          LEFT JOIN rutas r ON e.ruta_id = r.id
          LEFT JOIN transportistas t ON r.transportista_id = t.id
          LEFT JOIN vehiculos v ON r.vehiculo_id = v.id
          WHERE e.active = 1 
            AND ${term} = ?`,
        [value],
      );

      if (rows.length === 0) {
        return null;
      }
      return this._mapEnvio(rows[0]);
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }

  async getAllEnvios(
    paginationDto: PaginationDto,
    filterSearch: FiltersSearch<Filters>,
  ): Promise<ResultPagination<Envio>> {
    const connection = await pool.getConnection();

    const { filters, search } = filterSearch;
    const searchValue = `%${search}%`;
    const searchParams = Array(11).fill(searchValue);

    let estadoFilterQuery = '';
    const params = [...searchParams];

    if (filters.estado) {
      estadoFilterQuery += 'AND ue.ultimo_estado = ? ';
      params.push(filters.estado);
    }

    if (filters.transportistaId && filters.transportistaId !== 0) {
      estadoFilterQuery += 'AND t.id = ? ';
      params.push(filters.transportistaId);
    }

    if (filters.fechaInicio) {
      estadoFilterQuery += 'AND e.created_at >= ? ';
      params.push(filters.fechaInicio);
    }

    if (filters.fechaFin) {
      estadoFilterQuery += 'AND e.created_at <= ? ';
      params.push(filters.fechaFin);
    }

    if (filters.usuarioId && filters.usuarioId !== 0) {
      estadoFilterQuery += 'AND u.id = ? ';
      params.push(filters.usuarioId);
    }

    const { limit, offset } = LimitOffset(
      paginationDto.size!,
      paginationDto.page!,
    );

    params.push(limit, offset);

    const cacheKey = `envios:${search}:${JSON.stringify(filters)}:${
      paginationDto.page
    }:${paginationDto.size}`;

    try {
      const cached = await getRedisCache<ResultPagination<Envio>>(cacheKey);

      if (cached) {
        return cached;
      }

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
            ue.ultimo_estado,
            r.id AS ruta_id, r.origen, r.destino, r.created_at AS ruta_creada,
            r.estado AS ruta_estado, r.fecha_inicio, r.fecha_fin, r.active AS ruta_activa,
            t.id AS transportista_id, t.nombre AS transportista_nombre, t.cedula AS transportista_cedula,
            v.id AS vehiculo_id, v.volumen_maximo, v.peso_maximo, v.placa AS vehiculo_placa,
            e.codigo
        FROM envios e
        INNER JOIN usuarios u ON e.usuario_id = u.id
        LEFT JOIN ultimo_estado ue ON ue.envio_id = e.id AND ue.rn = 1
        LEFT JOIN rutas r ON e.ruta_id = r.id
        LEFT JOIN transportistas t ON r.transportista_id = t.id
        LEFT JOIN vehiculos v ON r.vehiculo_id = v.id
        WHERE e.active = 1
        AND (
            CAST(e.id AS CHAR) LIKE ? OR
            e.direccion LIKE ? OR
            e.tipo_producto LIKE ? OR
            u.name LIKE ? OR
            u.email LIKE ? OR
            r.origen LIKE ? OR
            r.destino LIKE ? OR
            t.nombre LIKE ? OR
            t.cedula LIKE ? OR
            v.placa LIKE ? OR
            e.codigo LIKE ?
        )
        ${estadoFilterQuery}
        ORDER BY e.id DESC
        LIMIT ? OFFSET ?`,
        params,
      );

      const [[{ total }]] = await connection.query<RowDataPacket[]>(
        `WITH ultimo_estado AS (
            SELECT 
                ee.envio_id, 
                ee.estado_id, 
                es.name AS ultimo_estado,
                ROW_NUMBER() OVER (PARTITION BY ee.envio_id ORDER BY ee.created_at DESC) AS rn
            FROM envios_estados ee
            INNER JOIN estados es ON ee.estado_id = es.id
        )
        SELECT COUNT(*) as total
        FROM envios e
        INNER JOIN usuarios u ON e.usuario_id = u.id
        LEFT JOIN ultimo_estado ue ON ue.envio_id = e.id AND ue.rn = 1
        LEFT JOIN rutas r ON e.ruta_id = r.id
        LEFT JOIN transportistas t ON r.transportista_id = t.id
        LEFT JOIN vehiculos v ON r.vehiculo_id = v.id
        WHERE e.active = 1
        AND (
            CAST(e.id AS CHAR) LIKE ? OR
            e.direccion LIKE ? OR
            e.tipo_producto LIKE ? OR
            u.name LIKE ? OR
            u.email LIKE ? OR
            r.origen LIKE ? OR
            r.destino LIKE ? OR
            t.nombre LIKE ? OR
            t.cedula LIKE ? OR
            v.placa LIKE ? OR
            e.codigo LIKE ?
        )
        ${estadoFilterQuery}`,
        params,
      );

      const items = rows.map(this._mapEnvio);
      await setRedisCache(cacheKey, { items, total });
      return { items, total };
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }

  async createEnvio(
    envioDto: CreateEnvioDto,
    code: string,
    estado: string,
  ): Promise<Envio> {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const { direccion, alto, ancho, peso, largo, tipoProducto, usuarioId } =
        envioDto;

      const [result] = await connection.query<ResultSetHeader>(
        `INSERT INTO envios (direccion, alto, ancho, peso, largo, tipo_producto, usuario_id, codigo) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [direccion, alto, ancho, peso, largo, tipoProducto, usuarioId, code],
      );

      if (!result.insertId) {
        throw CustomError.badRequest('No se pudo crear el envío');
      }

      const [resultEstado] = await connection.query<ResultSetHeader>(
        `INSERT INTO envios_estados (envio_id, estado_id) VALUES (?, ?)`,
        [result.insertId, estado],
      );

      if (!resultEstado.insertId) {
        throw CustomError.badRequest(
          'No se pudo registrar el estado del envío',
        );
      }

      await connection.commit();

      await clearRedis('envios');

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

  static async getEnviosPorRuta(
    rutaId: number,
  ): Promise<
    { peso: number; alto: number; ancho: number; largo: number; id: number }[]
  > {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query<RowDataPacket[]>(
        `SELECT * FROM envios WHERE ruta_id = ? AND active = 1`,
        [rutaId],
      );

      const envios = rows.map((row) => ({
        peso: Number(row.peso),
        alto: Number(row.alto),
        ancho: Number(row.ancho),
        largo: Number(row.largo),
        id: Number(row.id),
      }));

      return envios;
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }

  static async getEstadosPorEnvio(code: string) {
    const cached = await getRedisCache<EstadosEnvio[]>(code);
    if (cached) return cached;

    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const [rows] = await connection.query<RowDataPacket[]>(
        `SELECT
            ee.created_at AS fecha,
            envios.direccion,
            e.name AS estado,
            envios.id
        FROM
            envios_estados ee
        INNER JOIN envios ON envios.id = ee.envio_id -- Verifica que esta columna exista y sea la correcta
        INNER JOIN estados e ON ee.estado_id = e.id
        WHERE
            envios.codigo = ?
        ORDER BY
            ee.created_at ASC;`,
        code,
      );

      if (rows.length === 0) {
        throw CustomError.notFound('No se encontraron estados para el envío');
      }

      await connection.commit();

      const estados = rows.map((row) => ({
        fecha: row.fecha,
        estado: row.estado,
        direccion: row.direccion,
        id: row.id,
      }));

      await setRedisCache(code, estados);

      return estados;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}
