import { RowDataPacket } from 'mysql2/promise';
import { TinyIntToBoolean } from '../../common/utils';

export class Vehiculo {
  constructor(
    public readonly id: string,
    public readonly createdAt: Date,
    public readonly active: boolean,
    public readonly placa: string,
    public readonly pesoMaximo: number,
    public readonly volumenMaximo: number,
    public readonly enTransito: boolean,
  ) {}

  static fromRow(row: RowDataPacket): Vehiculo {
    return new Vehiculo(
      row.id,
      new Date(row.created_at),
      TinyIntToBoolean(row.active),
      row.placa,
      row.peso_maximo,
      row.volumen_maximo,
      TinyIntToBoolean(row.en_transito),
    );
  }
}
