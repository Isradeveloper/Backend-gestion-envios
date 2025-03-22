import { IsString, MinLength, MaxLength, IsNumber, Min } from 'class-validator';

export class CreateVehiculoDto {
  @IsString({ message: 'La placa debe ser un string.' })
  @MinLength(3, { message: 'La placa debe tener al menos 3 caracteres.' })
  @MaxLength(20, {
    message: 'La placa no puede superar los 20 caracteres.',
  })
  placa!: string;

  @IsNumber({}, { message: 'El volumen maximo debe ser un numero.' })
  @Min(10, { message: 'El volumen maximo debe ser mayor o igual a 10.' })
  volumen_maximo!: number;

  @IsNumber({}, { message: 'El peso maximo debe ser un numero.' })
  @Min(10, { message: 'El peso maximo debe ser mayor o igual a 10.' })
  peso_maximo!: number;
}
