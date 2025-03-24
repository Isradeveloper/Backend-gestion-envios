import { Request, Response } from 'express';
import { handleError } from '../../common/errors';
import { TransportistaService } from '../services/transportistas.service';
import { validateDto } from '../../common/utils';
import { CreateTransportistaDto } from '../dtos';
import { PaginationDto } from '../../common/dtos';
import { FiltersSearch } from '../../common/interfaces';

export interface Filters {}

export class TransportistaController {
  constructor(private transportistaService: TransportistaService) {}

  getTransportistas = async (req: Request, res: Response) => {
    try {
      const { size = 10, page = 1, search = '' } = req.query;

      const paginationDto = await validateDto(PaginationDto, {
        size: +size,
        page: +page,
      });

      const filterSearch: FiltersSearch<Filters> = {
        filters: {},
        search: search.toString(),
      };

      const { message, data } =
        await this.transportistaService.getTransportistas(
          paginationDto,
          filterSearch,
        );
      res.json({ message, data });
    } catch (error) {
      handleError(error, res);
    }
  };

  createTransportista = async (req: Request, res: Response) => {
    try {
      const createTransportistaDto = await validateDto(
        CreateTransportistaDto,
        req.body,
      );
      const result = await this.transportistaService.createTransportista(
        createTransportistaDto,
      );
      res.status(201).json(result);
    } catch (error) {
      handleError(error, res);
    }
  };

  getMaestro = async (req: Request, res: Response) => {
    try {
      const { message, data } = await this.transportistaService.getMaestro();
      res.json({ message, data });
    } catch (error) {
      handleError(error, res);
    }
  };
}
