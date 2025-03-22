import { CustomError } from '../../common/errors';
import { CreateEstadoDto } from '../dtos';
import { EstadoRepository } from '../repositories/estados.repository';

export class EstadoService {
  constructor(private estadoRepository: EstadoRepository) {}

  getEstados = async () => {
    const estados = await this.estadoRepository.getAllEstados();
    return { message: 'Estados obtenidos correctamente', data: estados };
  };

  createEstado = async (createEstadoDto: CreateEstadoDto) => {
    const exists = await this.estadoRepository.findEstadoByTerm(
      'name',
      createEstadoDto.name,
    );
    if (exists) {
      throw CustomError.badRequest(
        'Ya se encuentra un estado con el mismo nombre',
      );
    }

    const estado = await this.estadoRepository.createEstado(createEstadoDto);
    return { message: 'Estado creado correctamente', data: estado };
  };
}
