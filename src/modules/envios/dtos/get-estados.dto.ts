import { IsString, MinLength } from 'class-validator';

export class GetEstadosDto {
  @IsString({ message: 'El código debe ser un string.' })
  @MinLength(3, { message: 'El código debe tener al menos 3 caracteres.' })
  code!: string;
}
