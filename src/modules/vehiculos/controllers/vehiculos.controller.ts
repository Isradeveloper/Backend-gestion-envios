import { Request, Response } from 'express';
import { handleError } from '../../common/errors';
import { VehiculoService } from '../services/vehiculos.service';
import { validateDto } from '../../common/utils';
import { CreateVehiculoDto } from '../dtos';
import { PaginationDto } from '../../common/dtos';
import { FiltersSearch } from '../../common/interfaces';

export interface Filters {}

export class VehiculoController {
  constructor(private vehiculoService: VehiculoService) {}

  getVehiculos = async (req: Request, res: Response) => {
    try {
      const { size = 10, page = 1, search = '' } = req.query;

      const paginationDto = await validateDto(PaginationDto, {
        size: +size,
        page: +page,
      });

      const filtersSearch: FiltersSearch<Filters> = {
        filters: {},
        search: search.toString(),
      };

      const { message, data } = await this.vehiculoService.getVehiculos(
        paginationDto,
        filtersSearch,
      );
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

  getMaestro = async (req: Request, res: Response) => {
    try {
      const { message, data } = await this.vehiculoService.getMaestro();
      res.json({ message, data });
    } catch (error) {
      handleError(error, res);
    }
  };
}
