import { Request, Response } from 'express';
import { handleError } from '../../common/errors';
import { RutaService } from '../services/rutas.service';
import { validateDto } from '../../common/utils';
import { AsociateEnviosDto, ChangeEstadoDto, CreateRutaDto } from '../dtos';
import { PaginationDto } from '../../common/dtos';
import { RutaRepository } from '../repositories/rutas.repository';

export class RutaController {
  constructor(private rutaService: RutaService) {}

  getRutas = async (req: Request, res: Response) => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const paginationDto = await validateDto(PaginationDto, {
        page: +page,
        limit: +limit,
      });
      const { message, data } = await this.rutaService.getRutas(paginationDto);
      res.json({ message, data });
    } catch (error) {
      handleError(error, res);
    }
  };

  createRuta = async (req: Request, res: Response) => {
    try {
      const createRutaDto = await validateDto(CreateRutaDto, req.body);
      const result = await this.rutaService.createRuta(createRutaDto);
      res.status(201).json(result);
    } catch (error) {
      handleError(error, res);
    }
  };

  asociateManyEnvios = async (req: Request, res: Response) => {
    try {
      const asociateEnviosDto = await validateDto(AsociateEnviosDto, req.body);
      const { rutaId, enviosIds } = asociateEnviosDto;
      const result = await this.rutaService.asociateManyEnvios(
        rutaId,
        enviosIds,
      );
      res.json(result);
    } catch (error) {
      handleError(error, res);
    }
  };

  changeEstado = async (req: Request, res: Response) => {
    try {
      const changeEstadoDto = await validateDto(ChangeEstadoDto, req.body);
      const result = await this.rutaService.changeEstado(changeEstadoDto);
      res.json(result);
    } catch (error) {
      handleError(error, res);
    }
  };
}
