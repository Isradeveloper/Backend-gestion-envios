import {
  IsString,
  MinLength,
  MaxLength,
  IsNumber,
  IsPositive,
} from 'class-validator';

export class CreateEnvioDto {
  @IsNumber({}, { message: 'El usuarioId debe ser un número.' })
  @IsPositive({ message: 'El usuarioId debe ser un número positivo.' })
  usuarioId!: number;

  @IsString({ message: 'La direccion debe ser un string.' })
  @MinLength(3, { message: 'La direccion debe tener al menos 3 caracteres.' })
  @MaxLength(255, {
    message: 'La direccion no puede superar los 255 caracteres.',
  })
  direccion!: string;

  @IsNumber({}, { message: 'El alto debe ser un número.' })
  @IsPositive({ message: 'El alto debe ser un número positivo.' })
  alto!: number;

  @IsNumber({}, { message: 'El ancho debe ser un número.' })
  @IsPositive({ message: 'El ancho debe ser un número positivo.' })
  ancho!: number;

  @IsNumber({}, { message: 'El largo debe ser un número.' })
  @IsPositive({ message: 'El largo debe ser un número positivo.' })
  largo!: number;

  @IsNumber({}, { message: 'El peso debe ser un número.' })
  @IsPositive({ message: 'El peso debe ser un número positivo.' })
  peso!: number;

  @IsString({ message: 'El tipo de producto debe ser un string.' })
  @MinLength(3, {
    message: 'El tipo de producto debe tener al menos 3 caracteres.',
  })
  @MaxLength(255, {
    message: 'El tipo de producto no puede superar los 255 caracteres.',
  })
  tipoProducto!: string;
}
