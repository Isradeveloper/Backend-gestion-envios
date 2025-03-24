import { User } from '../../auth';
import { TinyIntToBoolean } from '../../common/utils';
import { Ruta } from '../../rutas';

export class Envio {
  constructor(
    public readonly id: number,
    public readonly createdAt: Date,
    public readonly active: boolean,
    public readonly user: Omit<
      User,
      'password' | 'role' | 'active' | 'createdAt'
    >,
    public readonly direccion: string,
    public readonly alto: number,
    public readonly ancho: number,
    public readonly largo: number,
    public readonly peso: number,
    public readonly tipoProducto: string,
    public readonly ultimoEstado: string,
    public readonly ruta: Omit<Ruta, 'createdAt' | 'active'> | null,
    public readonly codigo: string,
  ) {}

  static fromObject(row: any): Envio {
    return new Envio(
      row.id,
      new Date(row.created_at),
      row.active,
      row.user,
      row.direccion,
      row.alto,
      row.ancho,
      row.largo,
      row.peso,
      row.tipo_producto,
      row.ultimoEstado,
      row.ruta,
      row.codigo,
    );
  }
}
