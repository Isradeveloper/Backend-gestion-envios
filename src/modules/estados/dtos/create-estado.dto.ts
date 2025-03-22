import { IsString, MinLength, MaxLength } from 'class-validator';

export class CreateEstadoDto {
  @IsString({ message: 'El nombre debe ser un string.' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres.' })
  @MaxLength(50, {
    message: 'El nombre no puede superar los 50 caracteres.',
  })
  name!: string;

  @IsString({ message: 'La descripcion debe ser un string.' })
  @MinLength(3, { message: 'La descripcion debe tener al menos 3 caracteres.' })
  @MaxLength(255, {
    message: 'La descripcion no puede superar los 255 caracteres.',
  })
  descripcion!: string;
}
