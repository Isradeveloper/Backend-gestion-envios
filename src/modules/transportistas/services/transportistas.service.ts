import { CustomError } from '../../common/errors';
import { CreateTransportistaDto } from '../dtos';
import { TransportistaRepository } from '../repositories/transportistas.repository';
import { PaginationDto } from '../../common/dtos';
import { FiltersSearch } from '../../common/interfaces';
import { Filters } from '../controllers';

export class TransportistaService {
  constructor(private transportistaRepository: TransportistaRepository) {}

  getTransportistas = async (
    paginationDto: PaginationDto,
    filterSearch: FiltersSearch<Filters>,
  ) => {
    const transportistas =
      await this.transportistaRepository.getAllTransportistas(
        paginationDto,
        filterSearch,
      );
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

  getMaestro = async () => {
    const transportista = await TransportistaRepository.getMaestro();
    return {
      message: 'Transportistas obtenidos correctamente',
      data: transportista,
    };
  };
}
