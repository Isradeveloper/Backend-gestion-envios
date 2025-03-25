import { IsNumber, IsArray, IsPositive } from 'class-validator';

export class AsociateEnviosDto {
  @IsArray({ message: 'Los ids de los envíos deben ser un array.' })
  @IsNumber(
    {},
    { each: true, message: 'Los ids de los envíos deben ser números.' },
  )
  @IsPositive({
    each: true,
    message: 'Los ids de los envíos deben ser números positivos.',
  })
  enviosIds!: number[];

  @IsNumber({}, { message: 'El id de la ruta debe ser un número.' })
  @IsPositive({ message: 'El id de la ruta debe ser un número positivo.' })
  rutaId!: number;
}
