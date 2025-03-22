import { Request, Response } from 'express';
import { handleError } from '../../common/errors';
import { VehiculoService } from '../services/vehiculos.service';
import { validateDto } from '../../common/utils';
import { CreateVehiculoDto } from '../dtos';

export class VehiculoController {
  constructor(private vehiculoService: VehiculoService) {}

  getVehiculos = async (req: Request, res: Response) => {
    try {
      const { message, data } = await this.vehiculoService.getVehiculos();
      res.json({ message, data });
    } catch (error) {
      handleError(error, res);
    }
  };

  createVehiculo = async (req: Request, res: Response) => {
    try {
      const createVehiculoDto = await validateDto(CreateVehiculoDto, req.body);
      const result = await this.vehiculoService.createVehiculo(
        createVehiculoDto,
      );
      res.status(201).json(result);
    } catch (error) {
      handleError(error, res);
    }
  };
}
