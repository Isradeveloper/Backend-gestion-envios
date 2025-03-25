import { IsString, IsEnum, IsNumber } from 'class-validator';

export class ChangeEstadoDto {
  @IsString()
  @IsEnum(['Pendiente', 'En transito', 'Finalizada'], {
    message: 'El estado debe ser Pendiente, En transito o Finalizada',
  })
  estado!: string;

  @IsNumber()
  id!: number;
}
