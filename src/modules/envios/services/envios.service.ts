import { PaginationDto } from '../../common/dtos';
import { CustomError } from '../../common/errors';
import { CreateEnvioDto } from '../dtos';
import { EnvioRepository } from '../repositories/envios.repository';

export class EnvioService {
  constructor(private envioRepository: EnvioRepository) {}

  getAllEnvios = async (paginationDto: PaginationDto) => {
    const envios = await this.envioRepository.getAllEnvios(paginationDto);
    return { message: 'Envios obtenidos correctamente', data: envios };
  };

  createEnvio = async (envioDto: CreateEnvioDto) => {
    const envio = await this.envioRepository.createEnvio(envioDto);
    return { message: 'Envio creado correctamente', data: envio };
  };
}
