import { Router } from 'express';
import { TransportistaController } from '../controllers/transportistas.controller';
import { TransportistaRepository } from '../repositories/transportistas.repository';
import { TransportistaService } from '../services/transportistas.service';

export class TransportistaRoutes {
  static get routes(): Router {
    const router = Router();

    /**
     * @swagger
     * components:
     *   schemas:
     *     Transportista:
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
     *         cedula:
     *           type: string
     *           example: "123456789"
     *         nombre:
     *           type: string
     *           example: "John Doe"
     *         enTransito:
     *           type: boolean
     *           example: false
     *     CreateTransportista:
     *       type: object
     *       properties:
     *         cedula:
     *           type: string
     *           example: "123456789"
     *         nombre:
     *           type: string
     *           example: "John Doe"
     */

    const transportistaRepository = new TransportistaRepository();
    const transportistaService = new TransportistaService(
      transportistaRepository,
    );
    const transportistaController = new TransportistaController(
      transportistaService,
    );

    /**
     * @swagger
     * /api/transportistas:
     *   get:
     *     tags:
     *       - Transportistas
     *     summary: Get all transportistas
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
     *       - name: search
     *         in: query
     *         required: false
     *         description: búsqueda
     *         schema:
     *           type: string
     *           example: "1007118"
     *     responses:
     *       200:
     *         description: A list of transportistas
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Transportista'
     */
    router.get('/', transportistaController.getTransportistas);

    /**
     * @swagger
     * /api/transportistas:
     *   post:
     *     tags:
     *       - Transportistas
     *     summary: Create un nuevo transportista
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/CreateTransportista'
     *     responses:
     *       201:
     *         description: Un nuevo transportista
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Transportista'
     */
    router.post('/', transportistaController.createTransportista);

    /**
     * @swagger
     * /api/transportistas/maestro:
     *   get:
     *     tags:
     *       - Transportistas
     *     summary: Get maestro transportistas
     *     responses:
     *       200:
     *         description: A list of transportistas
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     *                 properties:
     *                   id:
     *                     type: integer
     *                     example: 1
     *                   cedula:
     *                     type: string
     *                     example: "123456789"
     *                   nombre:
     *                     type: string
     *                     example: "John Doe"
     */
    router.get('/maestro', transportistaController.getMaestro);
    return router;
  }
}
