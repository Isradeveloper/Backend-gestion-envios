import { CustomError } from '../../common/errors';
import { CreateVehiculoDto } from '../dtos';
import { VehiculoRepository } from '../repositories/vehiculos.repository';

export class VehiculoService {
  constructor(private vehiculoRepository: VehiculoRepository) {}

  getVehiculos = async () => {
    const vehiculos = await this.vehiculoRepository.getAllVehiculos();
    return { message: 'Vehiculos obtenidos correctamente', data: vehiculos };
  };

  createVehiculo = async (createVehiculoDto: CreateVehiculoDto) => {
    const exists = await this.vehiculoRepository.findVehiculoByTerm(
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
}
