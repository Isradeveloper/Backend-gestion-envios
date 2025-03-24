import { CustomError } from '../../common/errors';
import { CreateVehiculoDto } from '../dtos';
import { VehiculoRepository } from '../repositories/vehiculos.repository';
import { PaginationDto } from '../../common/dtos';
import { FiltersSearch } from '../../common/interfaces';
import { Filters } from '../controllers';

export class VehiculoService {
  constructor(private vehiculoRepository: VehiculoRepository) {}

  getVehiculos = async (
    paginationDto: PaginationDto,
    filtersSearch: FiltersSearch<Filters>,
  ) => {
    const vehiculos = await this.vehiculoRepository.getAllVehiculos(
      paginationDto,
      filtersSearch,
    );
    return { message: 'Vehiculos obtenidos correctamente', data: vehiculos };
  };

  createVehiculo = async (createVehiculoDto: CreateVehiculoDto) => {
    const exists = await VehiculoRepository.findVehiculoByTerm(
      'placa',
      createVehiculoDto.placa,
    );
    if (exists) {
      throw CustomError.badRequest(
        'Ya se encuentra un vehiculo con la misma placa',
      );
    }

    const vehiculo = await this.vehiculoRepository.createVehiculo(
      createVehiculoDto,
    );
    return { message: 'Vehiculo creado correctamente', data: vehiculo };
  };

  getMaestro = async () => {
    const vehiculos = await VehiculoRepository.getMaestro();
    return {
      message: 'Vehiculos obtenidos correctamente',
      data: vehiculos,
    };
  };
}
