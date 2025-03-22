import { Router } from 'express';
import { AuthRoutes } from '../modules/auth/routes';

export class AppRoutes {
  static get routes(): Router {
    const router = Router();

    router.use('/api/auth', AuthRoutes.routes);

    /**
     * @swagger
     * /:
     *   get:
     *     tags:
     *       - Home
     *     summary: Get home
     *     responses:
     *       200:
     *         description: A message
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     */
    router.get('/', (req, res) => {
      res.json({ message: 'Hello World!' });
    });

    return router;
  }
}
