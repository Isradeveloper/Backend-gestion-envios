import { Request, response, Response } from 'express';
import { handleError } from '../../common/errors';
import { EnvioService } from '../services/envios.service';
import { validateDto } from '../../common/utils';
import { PaginationDto } from '../../common/dtos';
import { CreateEnvioDto, GetEstadosDto } from '../dtos';
import { FiltersSearch } from '../../common/interfaces';

export interface Filters {
  estado: string;
  fechaInicio: string;
  fechaFin: string;
  transportistaId: number;
  usuarioId?: number;
  vehiculoId?: number;
}
export class EnviosController {
  constructor(private envioService: EnvioService) {}

  getAllEnvios = async (req: Request, res: Response) => {
    try {
      const {
        size = 10,
        page = 1,
        estado = '',
        search = '',
        fechaInicio = '',
        fechaFin = '',
        transportistaId = 0,
        usuarioId = 0,
      } = req.query;

      const paginationDto = await validateDto(PaginationDto, {
        size: +size,
        page: +page,
      });

      const filtersSearch: FiltersSearch<Filters> = {
        filters: {
          estado: estado.toString(),
          fechaInicio: fechaInicio.toString(),
          fechaFin: fechaFin.toString(),
          transportistaId: +transportistaId,
          usuarioId: +usuarioId,
        },
        search: search.toString(),
      };
      const { message, data } = await this.envioService.getAllEnvios(
        paginationDto,
        filtersSearch,
      );
      res.json({ message, data });
    } catch (error) {
      handleError(error, res);
    }
  };

  createEnvio = async (req: Request, res: Response) => {
    try {
      const createEnvioDto = await validateDto(CreateEnvioDto, req.body);
      const { message, data } = await this.envioService.createEnvio(
        createEnvioDto,
      );
      res.json({ message, data });
    } catch (error) {
      handleError(error, res);
    }
  };

  getEstadosPorEnvio = async (req: Request, res: Response) => {
    try {
      const { code } = await validateDto(GetEstadosDto, req.params);
      const { message, data } = await this.envioService.getEstadosPorEnvio(
        code,
      );
      res.json({ message, data });
    } catch (error) {
      handleError(error, res);
    }
  };

  getReportesEnvios = async (req: Request, res: Response) => {
    try {
      const {
        estado = '',
        search = '',
        fechaInicio = '',
        fechaFin = '',
        transportistaId = 0,
        vehiculoId = 0,
      } = req.query;

      const filtersSearch: FiltersSearch<Filters> = {
        filters: {
          estado: estado.toString(),
          fechaInicio: fechaInicio.toString(),
          fechaFin: fechaFin.toString(),
          transportistaId: +transportistaId,
          vehiculoId: +vehiculoId,
        },
        search: search.toString(),
      };

      const { message, data } = await this.envioService.getReporteEnvios(
        filtersSearch,
      );
      res.json({ message, data });
    } catch (error) {
      handleError(error, res);
    }
  };
}
