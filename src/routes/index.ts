import { Router } from 'express';
import { AuthRoutes } from '../modules/auth/routes';
import { EstadoRoutes } from '../modules/estados/routes';
import { AuthMiddleware } from '../modules/common/middlewares/auth.middleware';
import { EnvioRoutes } from '../modules/envios/routes';
import { VehiculoRoutes } from '../modules/vehiculos/routes';
import { TransportistaRoutes } from '../modules/transportistas/routes';
import { RutaRoutes } from '../modules/rutas/routes';
import { GeocodeRoutes } from '../modules/geocode/routes';

export class AppRoutes {
  static get routes(): Router {
    const router = Router();

    router.use('/api/auth', AuthRoutes.routes);
    router.use('/api/estados', AuthMiddleware.validateJWT, EstadoRoutes.routes);
    router.use('/api/envios', AuthMiddleware.validateJWT, EnvioRoutes.routes);
    router.use(
      '/api/vehiculos',
      AuthMiddleware.validateJWT,
      VehiculoRoutes.routes,
    );
    router.use(
      '/api/transportistas',
      AuthMiddleware.validateJWT,
      TransportistaRoutes.routes,
    );
    router.use('/api/rutas', AuthMiddleware.validateJWT, RutaRoutes.routes);
    router.use(
      '/api/geocode',
      AuthMiddleware.validateJWT,
      GeocodeRoutes.routes,
    );
    return router;
  }
}
