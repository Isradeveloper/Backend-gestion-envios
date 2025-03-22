import { CustomError } from '../../common/errors';
import { CreateTransportistaDto } from '../dtos';
import { TransportistaRepository } from '../repositories/transportistas.repository';

export class TransportistaService {
  constructor(private transportistaRepository: TransportistaRepository) {}

  getTransportistas = async () => {
    const transportistas =
      await this.transportistaRepository.getAllTransportistas();
    return {
      message: 'Transportistas obtenidos correctamente',
      data: transportistas,
    };
  };

  createTransportista = async (
    createTransportistaDto: CreateTransportistaDto,
  ) => {
    const exists = await this.transportistaRepository.findTransportistaByTerm(
      'cedula',
      createTransportistaDto.cedula,
    );
    if (exists) {
      throw CustomError.badRequest(
        'Ya se encuentra un transportista con la misma cedula',
      );
    }

    const transportista =
      await this.transportistaRepository.createTransportista(
        createTransportistaDto,
      );
    return {
      message: 'Transportista creado correctamente',
      data: transportista,
    };
  };
}
