import { RowDataPacket } from 'mysql2/promise';
import { TinyIntToBoolean } from '../../common/utils';

export class Transportista {
  constructor(
    public readonly id: string,
    public readonly createdAt: Date,
    public readonly active: boolean,
    public readonly cedula: string,
    public readonly nombre: string,
    public readonly enTransito: boolean,
  ) {}

  static fromRow(row: RowDataPacket): Transportista {
    return new Transportista(
      row.id,
      new Date(row.created_at),
      TinyIntToBoolean(row.active),
      row.cedula,
      row.nombre,
      TinyIntToBoolean(row.en_transito),
    );
  }
}
