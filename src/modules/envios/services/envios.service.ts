import { PaginationDto } from '../../common/dtos';
import { CustomError } from '../../common/errors';
import { CreateEnvioDto } from '../dtos';
import { EnvioRepository } from '../repositories/envios.repository';
import { FiltersSearch } from '../../common/interfaces';
import { Filters } from '../controllers';
import { createRandomUnicCode } from '../../common/utils';
import { EstadoRepository } from '../../estados';
import { clearRedis } from '../../../config';

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

    const estado = await EstadoRepository.findEstadoByTerm('name', 'En espera');

    if (!estado) throw CustomError.badRequest('Estado no encontrado');

    const envio = await this.envioRepository.createEnvio(
      envioDto,
      code,
      estado.id,
    );
    await clearRedis('reportes');
    return { message: 'Envio creado correctamente', data: envio };
  };

  getEstadosPorEnvio = async (code: string) => {
    const estados = await EnvioRepository.getEstadosPorEnvio(code);

    if (!estados) throw CustomError.notFound('Estados no encontrados');

    return { message: 'Estado obtenido correctamente', data: estados };
  };

  getReporteEnvios = async (filtersSearch: FiltersSearch<Filters>) => {
    const reporte = await this.envioRepository.getReporteEnvios(filtersSearch);

    return { message: 'Reporte obtenido correctamente', data: reporte };
  };
}
