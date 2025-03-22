import { Router } from 'express';

export class AppRoutes {
  static get routes(): Router {
    const router = Router();

    // router.use('/api/auth', AuthRoutes.routes);

    router.get('/', (req, res) => {
      res.json({ message: 'Hello World!' });
    });

    return router;
  }
}
