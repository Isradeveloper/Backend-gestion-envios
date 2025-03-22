import { Router } from 'express';
import { AuthRoutes } from '../modules/auth/routes';
import { EstadoRoutes } from '../modules/estados/routes';
import { AuthMiddleware } from '../modules/common/middlewares/auth.middleware';

export class AppRoutes {
  static get routes(): Router {
    const router = Router();

    router.use('/api/auth', AuthRoutes.routes);
    router.use('/api/estados', AuthMiddleware.validateJWT, EstadoRoutes.routes);
    return router;
  }
}
