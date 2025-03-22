import { Router } from 'express';
import { AuthRoutes } from '../modules/auth/routes';

export class AppRoutes {
  static get routes(): Router {
    const router = Router();

    router.use('/api/auth', AuthRoutes.routes);

    router.get('/', (req, res) => {
      res.json({ message: 'Hello World!' });
    });

    return router;
  }
}
