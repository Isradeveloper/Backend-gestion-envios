import { Router } from 'express';
import { EnviosController } from '../controllers';
import { EnvioRepository } from '../repositories/envios.repository';
import { EnvioService } from '../services/envios.service';
import { AuthMiddleware } from '../../common/middlewares/auth.middleware';

export class EnvioRoutes {
  static get routes(): Router {
    const router = Router();

    /**
     * @swagger
     * components:
     *   schemas:
     *     Envio:
     *       type: object
     *       properties:
     *         id:
     *           type: integer
     *           example: 1
     *         createdAt:
     *           type: string
     *           example: "2023-01-01T00:00:00.000Z"
     *         direccion:
     *           type: string
     *           example: "123 Main St"
     *         alto:
     *           type: number
     *           example: 10
     *         ancho:
     *           type: number
     *           example: 10
     *         largo:
     *           type: number
     *           example: 10
     *         peso:
     *           type: number
     *           example: 10
     *         user:
     *           type: object
     *           properties:
     *             id:
     *               type: integer
     *               example: 1
     *             name:
     *               type: string
     *               example: "John Doe"
     *             email:
     *               type: string
     *               example: "john.doe@example.com"
     *         ultimoEstado:
     *           type: string
     *           example: "En transito"
     *
     *     CreateEnvio:
     *       type: object
     *       properties:
     *         direccion:
     *           type: string
     *           example: "123 Main St"
     *         alto:
     *           type: number
     *           example: 10
     *         ancho:
     *           type: number
     *           example: 10
     *         largo:
     *           type: number
     *           example: 10
     *         peso:
     *           type: number
     *           example: 10
     *         tipoProducto:
     *           type: string
     *           example: "Paquete"
     *         usuarioId:
     *           type: integer
     *           example: 1
     */

    const envioRepository = new EnvioRepository();
    const envioService = new EnvioService(envioRepository);
    const envioController = new EnviosController(envioService);

    /**
     * @swagger
     * /api/envios:
     *   get:
     *     tags:
     *       - Envios
     *     summary: Obtener todos los envios
     *     parameters:
     *       - name: size
     *         in: query
     *         required: false
     *         description: Cantidad de items por página
     *         schema:
     *           type: integer
     *           example: 10
     *       - name: page
     *         in: query
     *         required: false
     *         description: Número de página
     *         schema:
     *           type: integer
     *           example: 1
     *     responses:
     *       200:
     *         description: Lista de envios
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Envio'
     */
    router.get('/', envioController.getAllEnvios);

    /**
     * @swagger
     * /api/envios:
     *   post:
     *     tags:
     *       - Envios
     *     summary: Crear un nuevo envio
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/CreateEnvio'
     *     responses:
     *       200:
     *         description: Envio creado correctamente
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Envio'
     */
    router.post('/', envioController.createEnvio);

    return router;
  }
}
