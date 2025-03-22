import { Router } from 'express';
import { AuthRoutes } from '../modules/auth/routes';
import { EstadoRoutes } from '../modules/estados/routes';
import { AuthMiddleware } from '../modules/common/middlewares/auth.middleware';
import { EnvioRoutes } from '../modules/envios/routes';

export class AppRoutes {
  static get routes(): Router {
    const router = Router();

    router.use('/api/auth', AuthRoutes.routes);
    router.use('/api/estados', EstadoRoutes.routes);
    router.use('/api/envios', EnvioRoutes.routes);
    return router;
  }
}
