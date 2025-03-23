import { IsString, IsEnum, IsNumber } from 'class-validator';

export class ChangeEstadoDto {
  @IsString()
  @IsEnum(['Pendiente', 'En transito', 'Finalizada'])
  estado!: string;

  @IsNumber()
  id!: number;
}
