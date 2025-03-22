import { IsString, MinLength, MaxLength, IsNumber, Min } from 'class-validator';

export class CreateTransportistaDto {
  @MinLength(5, { message: 'La cedula debe tener al menos 5 caracteres.' })
  @MaxLength(20, {
    message: 'La cedula no puede superar los 20 caracteres.',
  })
  cedula!: string;

  @IsString({ message: 'El nombre debe ser un string.' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres.' })
  @MaxLength(100, {
    message: 'El nombre no puede superar los 100 caracteres.',
  })
  nombre!: string;
}
