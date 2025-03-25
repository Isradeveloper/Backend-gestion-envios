import { PaginationDto } from '../../common/dtos';
import { CustomError, handleError } from '../../common/errors';
import { EnvioRepository } from '../../envios';
import { TransportistaRepository } from '../../transportistas';
import { VehiculoRepository } from '../../vehiculos';
import { ChangeEstadoDto, CreateRutaDto } from '../dtos';
import { RutaRepository } from '../repositories/rutas.repository';
import { FiltersSearch } from '../../common/interfaces';
import { Filters } from '../controllers';
import { Server } from '../../../server';
import { clearRedis, clearSpecificRedis } from '../../../config';

export class RutaService {
  constructor(private rutaRepository: RutaRepository) {}

  getRutas = async (
    paginationDto: PaginationDto,
    filtersSearch: FiltersSearch<Filters>,
  ) => {
    const rutas = await this.rutaRepository.getAllRutas(
      paginationDto,
      filtersSearch,
    );
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

    await clearRedis('reportes');
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

    const { volumenMaximo: volumen_maximo, pesoMaximo: peso_maximo } =
      ruta.vehiculo;

    let volumenAlcanzado = 0;
    let pesoAlcanzado = 0;

    const enviosAsignados = await EnvioRepository.getEnviosPorRuta(rutaId);

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

    await clearRedis('reportes');
    return { message: 'Envíos asociados correctamente' };
  };

  changeEstado = async (changeEstadoDto: ChangeEstadoDto) => {
    const { id, estado } = changeEstadoDto;

    const ruta = await RutaRepository.findRutaByTerm('r.id', id.toString());
    if (!ruta) {
      throw CustomError.badRequest(
        'No se encuentra una ruta con el id proporcionado',
      );
    }

    if (ruta.estado === estado) {
      throw CustomError.badRequest(
        'El estado de la ruta ya es el proporcionado',
      );
    }

    await this.validarCambioEstado(ruta, estado);

    const vehiculo = await this.obtenerVehiculo(Number(ruta.vehiculo.id));
    const conductor = await this.obtenerConductor(
      Number(ruta.transportista.id),
    );

    this.validarDisponibilidad(estado, vehiculo, conductor);

    await this.rutaRepository.changeEstado(
      changeEstadoDto,
      vehiculo.id,
      conductor.id,
    );

    //** BUSCAR TODOS LOS CODIGOS RELACIONADOS A ESTA RUTA */

    const enviosRelacionados = await RutaRepository.getEnviosAsociados(id);
    const estados = await Promise.all(
      enviosRelacionados.map((envio) =>
        RutaRepository.getUltimoEstadoEnvio(envio.id),
      ),
    );

    //** NOTIFICAR WEBSOCKET DEL ULTIMO ESTADO DE CADA UNO*/

    for (const estado of estados) {
      Server.emitSocketEvent(`envio-${estado?.codigo}`, estado);

      await clearSpecificRedis(estado?.codigo);
    }

    await clearRedis('reportes');

    return { message: 'Estado de la ruta cambiado correctamente' };
  };

  private validarCambioEstado = async (ruta: any, nuevoEstado: string) => {
    const { fechaInicio, fechaFin } = ruta;

    if (!fechaInicio && !fechaFin && nuevoEstado !== 'En transito') {
      throw CustomError.badRequest(
        'Solo se puede cambiar el estado a "En transito" si no se ha iniciado o finalizado',
      );
    }

    if (fechaInicio && !fechaFin && nuevoEstado !== 'Finalizada') {
      throw CustomError.badRequest(
        'Solo se puede cambiar el estado a "Finalizada" si ya ha sido iniciada',
      );
    }

    if (nuevoEstado === 'En transito') {
      await this.validarEnviosAsociados(ruta.id);
    }
  };

  private async validarEnviosAsociados(rutaId: number) {
    const envios = await EnvioRepository.getEnviosPorRuta(rutaId);
    if (envios.length === 0) {
      throw CustomError.badRequest(
        'No se puede cambiar el estado a "En transito" sin envíos asociados',
      );
    }
  }

  private async obtenerVehiculo(vehiculoId: number) {
    const vehiculo = await VehiculoRepository.findVehiculoByTerm(
      'id',
      vehiculoId.toString(),
    );
    if (!vehiculo) {
      throw CustomError.badRequest(
        `No se encuentra el vehículo con id ${vehiculoId}`,
      );
    }
    return vehiculo;
  }

  private async obtenerConductor(conductorId: number) {
    const conductor = await TransportistaRepository.findTransportistaByTerm(
      'id',
      conductorId.toString(),
    );
    if (!conductor) {
      throw CustomError.badRequest(
        `No se encuentra el conductor con id ${conductorId}`,
      );
    }
    return conductor;
  }

  private validarDisponibilidad(estado: string, vehiculo: any, conductor: any) {
    if (estado === 'En transito') {
      if (vehiculo.enTransito) {
        throw CustomError.badRequest(
          'El vehículo ya está en tránsito en otra ruta',
        );
      }
      if (conductor.enTransito) {
        throw CustomError.badRequest(
          'El conductor ya está en tránsito en otra ruta',
        );
      }
    }
  }

  getRutasPendientes = async () => {
    const rutas = await this.rutaRepository.getRutasPendientes();
    return { message: 'Rutas pendientes obtenidas correctamente', data: rutas };
  };
}
