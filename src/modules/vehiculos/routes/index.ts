import { Router } from 'express';
import { VehiculoController } from '../controllers/vehiculos.controller';
import { VehiculoRepository } from '../repositories/vehiculos.repository';
import { VehiculoService } from '../services/vehiculos.service';

export class VehiculoRoutes {
  static get routes(): Router {
    const router = Router();

    /**
     * @swagger
     * components:
     *   schemas:
     *     Vehiculo:
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
     *         placa:
     *           type: string
     *           example: "ABC123"
     *         volumen_maximo:
     *           type: number
     *           example: 100
     *         peso_maximo:
     *           type: number
     *           example: 100
     *         enTransito:
     *           type: boolean
     *           example: false
     *     CreateVehiculo:
     *       type: object
     *       properties:
     *         placa:
     *           type: string
     *           example: "ABC123"
     *         volumen_maximo:
     *           type: number
     *           example: 100
     *         peso_maximo:
     *           type: number
     *           example: 100
     */

    const vehiculoRepository = new VehiculoRepository();
    const vehiculoService = new VehiculoService(vehiculoRepository);
    const vehiculoController = new VehiculoController(vehiculoService);

    /**
     * @swagger
     * /api/vehiculos:
     *   get:
     *     tags:
     *       - Vehiculos
     *     summary: Get all vehiculos
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
     *           example: "ABC123"
     *     responses:
     *       200:
     *         description: A list of vehiculos
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Vehiculo'
     */
    router.get('/', vehiculoController.getVehiculos);

    /**
     * @swagger
     * /api/vehiculos:
     *   post:
     *     tags:
     *       - Vehiculos
     *     summary: Create un nuevo vehiculo
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/CreateVehiculo'
     *     responses:
     *       201:
     *         description: Un nuevo vehiculo
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Vehiculo'
     */
    router.post('/', vehiculoController.createVehiculo);

    /**
     * @swagger
     * /api/vehiculos/maestro:
     *   get:
     *     tags:
     *       - Vehiculos
     *     summary: Get maestro vehiculos
     *     responses:
     *       200:
     *         description: A list of vehiculos
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
     *                   placa:
     *                     type: string
     *                     example: "ABC123"
     */
    router.get('/maestro', vehiculoController.getMaestro);
    return router;
  }
}
