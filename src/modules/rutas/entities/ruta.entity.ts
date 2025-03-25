import { TinyIntToBoolean } from '../../common/utils';
import { Transportista } from '../../transportistas';
import { Vehiculo } from '../../vehiculos';

export class Ruta {
  constructor(
    public readonly id: string,
    public readonly createdAt: Date,
    public readonly active: boolean,
    public readonly transportista: Omit<
      Transportista,
      'active' | 'createdAt' | 'enTransito'
    >,
    public readonly vehiculo: Omit<
      Vehiculo,
      'active' | 'createdAt' | 'enTransito'
    >,
    public readonly estado: string,
    public readonly origen: string,
    public readonly destino: string,
    public readonly fechaInicio?: Date | null,
    public readonly fechaFin?: Date | null,
  ) {}

  static fromObject(row: any): Ruta {
    return new Ruta(
      row.id,
      new Date(row.created_at),
      TinyIntToBoolean(row.active),
      row.transportista,
      row.vehiculo,
      row.estado,
      row.origen,
      row.destino,
      row.fecha_inicio ? new Date(row.fecha_inicio) : null,
      row.fecha_fin ? new Date(row.fecha_fin) : null,
    );
  }
}
