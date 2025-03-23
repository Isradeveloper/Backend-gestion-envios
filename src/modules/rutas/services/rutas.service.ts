import { PaginationDto } from '../../common/dtos';
import { CustomError } from '../../common/errors';
import { EnvioRepository } from '../../envios';
import { TransportistaRepository } from '../../transportistas';
import { VehiculoRepository } from '../../vehiculos';
import { ChangeEstadoDto, CreateRutaDto } from '../dtos';
import { RutaRepository } from '../repositories/rutas.repository';

export class RutaService {
  constructor(private rutaRepository: RutaRepository) {}

  getRutas = async (paginationDto: PaginationDto) => {
    const rutas = await this.rutaRepository.getAllRutas(paginationDto);
    return { message: 'Rutas obtenidas correctamente', data: rutas };
  };

  createRuta = async (createRutaDto: CreateRutaDto) => {
    const vehiculo = await VehiculoRepository.findVehiculoByTerm(
      'id',
      createRutaDto.vehiculoId.toString(),
    );
    if (!vehiculo) {
      throw CustomError.badRequest(
        'No se encuentra un vehiculo con el id proporcionado',
      );
    }

    if (vehiculo.enTransito) {
      throw CustomError.badRequest('El vehiculo se encuentra en transito');
    }

    const transportista = await TransportistaRepository.findTransportistaByTerm(
      'id',
      createRutaDto.transportistaId.toString(),
    );
    if (!transportista) {
      throw CustomError.badRequest(
        'No se encuentra un transportista con el id proporcionado',
      );
    }

    if (transportista.enTransito) {
      throw CustomError.badRequest('El transportista se encuentra en transito');
    }

    const ruta = await this.rutaRepository.createRuta(createRutaDto);
    return { message: 'Ruta creada correctamente', data: ruta };
  };

  asociateManyEnvios = async (rutaId: number, enviosIds: number[]) => {
    const ruta = await RutaRepository.findRutaByTerm('r.id', rutaId.toString());
    if (!ruta) {
      throw CustomError.badRequest(
        'No se encuentra una ruta con el id proporcionado',
      );
    }

    const { volumen_maximo, peso_maximo } = ruta.vehiculo;

    let volumenAlcanzado = 0;
    let pesoAlcanzado = 0;

    const enviosAsignados = await EnvioRepository.obtenerEnviosPorRuta(rutaId);

    for (const { peso, largo, ancho, alto } of enviosAsignados) {
      volumenAlcanzado += largo * ancho * alto;
      pesoAlcanzado += peso;
    }

    for (const envioId of enviosIds) {
      let volumen = 0;

      const envio = await EnvioRepository.simpleFindEnvioByTerm(
        'id',
        envioId.toString(),
      );
      if (!envio) {
        throw CustomError.badRequest(
          'No se encuentra un envio con el id proporcionado',
        );
      }

      if (envio.ruta_id == rutaId) {
        throw CustomError.badRequest(
          `El envio ${envioId} ya se encuentra asociado a esta ruta`,
        );
      }

      volumen += Number(envio.largo) * Number(envio.ancho) * Number(envio.alto);

      if (volumen + volumenAlcanzado > volumen_maximo) {
        throw CustomError.badRequest(
          `El envio ${envioId} excede el volumen maximo del vehiculo ${volumen_maximo} cm3`,
        );
      }

      if (Number(envio.peso) + pesoAlcanzado > peso_maximo) {
        throw CustomError.badRequest(
          `El envio ${envioId} excede el peso maximo del vehiculo ${peso_maximo} kg`,
        );
      }

      volumenAlcanzado += volumen;
      pesoAlcanzado += Number(envio.peso);
    }

    await this.rutaRepository.asociateManyEnvios(rutaId, enviosIds);
    return { message: 'Envíos asociados correctamente' };
  };

  changeEstado = async (changeEstadoDto: ChangeEstadoDto) => {
    const ruta = await RutaRepository.findRutaByTerm(
      'r.id',
      changeEstadoDto.id.toString(),
    );
    if (!ruta) {
      throw CustomError.badRequest(
        'No se encuentra una ruta con el id proporcionado',
      );
    }

    if (ruta.estado === changeEstadoDto.estado) {
      throw CustomError.badRequest(
        'El estado de la ruta ya es el proporcionado',
      );
    }

    if (
      !ruta.fechaInicio &&
      !ruta.fechaFin &&
      changeEstadoDto.estado != 'En transito'
    ) {
      throw CustomError.badRequest(
        'Solamente se puede cambiar el estado de la ruta a "En transito" si no se ha iniciado o finalizado',
      );
    } else if (
      ruta.fechaInicio &&
      !ruta.fechaFin &&
      changeEstadoDto.estado != 'Finalizado'
    ) {
      throw CustomError.badRequest(
        'Solamente se puede cambiar el estado de la ruta a "Finalizado" si se ha iniciado',
      );
    }

    await this.rutaRepository.changeEstado(changeEstadoDto);
    return { message: 'Estado de la ruta cambiado correctamente' };
  };
}
