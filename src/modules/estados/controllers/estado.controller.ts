import { Request, Response } from 'express';
import { handleError } from '../../common/errors';
import { EstadoService } from '../services/estados.service';
import { validateDto } from '../../common/utils';
import { CreateEstadoDto } from '../dtos';

export class EstadoController {
  constructor(private estadoService: EstadoService) {}

  getEstados = async (req: Request, res: Response) => {
    try {
      const { message, data } = await this.estadoService.getEstados();
      res.json({ message, data });
    } catch (error) {
      handleError(error, res);
    }
  };

  createEstado = async (req: Request, res: Response) => {
    try {
      const createEstadoDto = await validateDto(CreateEstadoDto, req.body);
      const result = await this.estadoService.createEstado(createEstadoDto);
      res.status(201).json(result);
    } catch (error) {
      handleError(error, res);
    }
  };
}
