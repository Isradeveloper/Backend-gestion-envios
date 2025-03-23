import { PaginationDto } from '../../common/dtos';
import { CustomError } from '../../common/errors';
import { CreateEnvioDto } from '../dtos';
import { EnvioRepository } from '../repositories/envios.repository';
import { FiltersSearch } from '../../common/interfaces';
import { Filters } from '../controllers';
import { createRandomUnicCode } from '../../common/utils';

export class EnvioService {
  constructor(private envioRepository: EnvioRepository) {}

  getAllEnvios = async (
    paginationDto: PaginationDto,
    filterSearch: FiltersSearch<Filters>,
  ) => {
    const envios = await this.envioRepository.getAllEnvios(
      paginationDto,
      filterSearch,
    );
    return { message: 'Envios obtenidos correctamente', data: envios };
  };

  createEnvio = async (envioDto: CreateEnvioDto) => {
    const code = createRandomUnicCode();
    const envio = await this.envioRepository.createEnvio(envioDto, code);
    return { message: 'Envio creado correctamente', data: envio };
  };
}
