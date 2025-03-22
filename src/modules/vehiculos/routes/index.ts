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
    return router;
  }
}
