import { Router } from 'express';
import { EstadoController } from '../controllers';
import { EstadoRepository } from '../repositories/estados.repository';
import { EstadoService } from '../services/estados.service';
import { AuthMiddleware } from '../../common/middlewares/auth.middleware';

export class EstadoRoutes {
  static get routes(): Router {
    const router = Router();

    /**
     * @swagger
     * components:
     *   schemas:
     *     Estado:
     *       type: object
     *       properties:
     *         id:
     *           type: integer
     *           example: 1
     *         created_at:
     *           type: string
     *           example: "2023-01-01T00:00:00.000Z"
     *         active:
     *           type: boolean
     *           example: true
     *         name:
     *           type: string
     *           example: "En espera"
     *         descripcion:
     *           type: string
     *           example: "En espera"
     *     CreateEstado:
     *       type: object
     *       properties:
     *         name:
     *           type: string
     *           example: "En espera"
     *         descripcion:
     *           type: string
     *           example: "En espera"
     */

    const estadoRepository = new EstadoRepository();
    const estadoService = new EstadoService(estadoRepository);
    const estadoController = new EstadoController(estadoService);

    /**
     * @swagger
     * /api/estados:
     *   get:
     *     tags:
     *       - Estados
     *     summary: Get all estados
     *     responses:
     *       200:
     *         description: A list of estados
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Estado'
     */
    router.get('/', estadoController.getEstados);

    /**
     * @swagger
     * /api/estados:
     *   post:
     *     tags:
     *       - Estados
     *     summary: Create un nuevo estado
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/CreateEstado'
     *     responses:
     *       201:
     *         description: Un nuevo estado
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Estado'
     */
    router.post('/', estadoController.createEstado);
    return router;
  }
}
