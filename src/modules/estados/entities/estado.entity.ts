import { RowDataPacket } from 'mysql2/promise';
import { TinyIntToBoolean } from '../../common/utils';

export class Estado {
  constructor(
    public readonly id: string,
    public readonly createdAt: Date,
    public readonly active: boolean,
    public readonly name: string,
    public readonly descripcion: string,
  ) {}

  static fromRow(row: RowDataPacket): Estado {
    return new Estado(
      row.id,
      new Date(row.created_at),
      TinyIntToBoolean(row.active),
      row.name,
      row.descripcion,
    );
  }
}
