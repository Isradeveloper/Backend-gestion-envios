import { Request, Response } from 'express';
import { handleError } from '../../common/errors';
import { TransportistaService } from '../services/transportistas.service';
import { validateDto } from '../../common/utils';
import { CreateTransportistaDto } from '../dtos';

export class TransportistaController {
  constructor(private transportistaService: TransportistaService) {}

  getTransportistas = async (req: Request, res: Response) => {
    try {
      const { message, data } =
        await this.transportistaService.getTransportistas();
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
}
