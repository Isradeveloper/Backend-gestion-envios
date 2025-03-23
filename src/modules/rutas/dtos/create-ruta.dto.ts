import {
  IsNumber,
  IsPositive,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateRutaDto {
  @IsNumber({}, { message: 'El id del transportista debe ser un numero.' })
  @IsPositive({
    message: 'El id del transportista debe ser un numero positivo.',
  })
  transportistaId!: number;

  @IsNumber({}, { message: 'El id del vehiculo debe ser un numero.' })
  @IsPositive({
    message: 'El id del vehiculo debe ser un numero positivo.',
  })
  vehiculoId!: number;

  @IsString({ message: 'El origen debe ser un string.' })
  @MinLength(3, { message: 'El origen debe tener al menos 3 caracteres.' })
  @MaxLength(255, {
    message: 'El origen no puede superar los 255 caracteres.',
  })
  origen!: string;

  @IsString({ message: 'El destino debe ser un string.' })
  @MinLength(3, { message: 'El destino debe tener al menos 3 caracteres.' })
  @MaxLength(255, {
    message: 'El destino no puede superar los 255 caracteres.',
  })
  destino!: string;
}
