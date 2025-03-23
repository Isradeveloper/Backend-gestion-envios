import { Router } from 'express';
import { RutaController } from '../controllers/rutas.controller';
import { RutaRepository } from '../repositories/rutas.repository';
import { RutaService } from '../services/rutas.service';

export class RutaRoutes {
  static get routes(): Router {
    const router = Router();

    /**
     * @swagger
     * components:
     *   schemas:
     *     Ruta:
     *       type: object
     *       properties:
     *         id:
     *           type: integer
     *           example: 1
     *         createdAt:
     *           type: string
     *           example: "2023-01-01T00:00:00.000Z"
     *         active:
     *           type: boolean
     *           example: true
     *         origen:
     *           type: string
     *           example: "Origen"
     *         destino:
     *           type: string
     *           example: "Destino"
     *         fechaInicio:
     *           type: string
     *           example: "2023-01-01T00:00:00.000Z"
     *         fechaFin:
     *           type: string
     *           example: "2023-01-01T00:00:00.000Z"
     *         transportista:
     *           type: object
     *           properties:
     *             id:
     *               type: integer
     *               example: 1
     *             name:
     *               type: string
     *               example: "Transportista 1"
     *             cedula:
     *               type: string
     *               example: "123456789"
     *         vehiculo:
     *           type: object
     *           properties:
     *             id:
     *               type: integer
     *               example: 1
     *             placa:
     *               type: string
     *               example: "ABC123"
     *             volumen_maximo:
     *               type: number
     *               example: 100
     *             peso_maximo:
     *               type: number
     *               example: 100
     *     CreateRuta:
     *       type: object
     *       properties:
     *         vehiculoId:
     *           type: number
     *           example: 1
     *         transportistaId:
     *           type: number
     *           example: 1
     *         origen:
     *           type: string
     *           example: "Origen"
     *         destino:
     *           type: string
     *           example: "Destino"
     */

    const rutaRepository = new RutaRepository();
    const rutaService = new RutaService(rutaRepository);
    const rutaController = new RutaController(rutaService);

    /**
     * @swagger
     * /api/rutas:
     *   get:
     *     tags:
     *       - Rutas
     *     summary: Get all rutas
     *     parameters:
     *       - name: page
     *         in: query
     *         description: Page number
     *         required: false
     *         schema:
     *           type: integer
     *           example: 1
     *       - name: limit
     *         in: query
     *         description: Number of items per page
     *         required: false
     *         schema:
     *           type: integer
     *           example: 10
     *     responses:
     *       200:
     *         description: A list of rutas
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Ruta'
     */
    router.get('/', rutaController.getRutas);

    /**
     * @swagger
     * /api/rutas:
     *   post:
     *     tags:
     *       - Rutas
     *     summary: Create un nuevo ruta
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/CreateRuta'
     *     responses:
     *       201:
     *         description: Un nuevo ruta
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Ruta'
     */
    router.post('/', rutaController.createRuta);

    /**
     * @swagger
     * /api/rutas/asociate-envios:
     *   post:
     *     tags:
     *       - Rutas
     *       - Envios
     *     summary: Asociate envios a una ruta
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               rutaId:
     *                 type: number
     *                 example: 1
     *               enviosIds:
     *                 type: array
     *                 items:
     *                   type: number
     *                   example: 1
     *     responses:
     *       200:
     *         description: Envios asociados correctamente
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: Envíos asociados correctamente
     */
    router.post('/asociate-envios', rutaController.asociateManyEnvios);

    /**
     * @swagger
     * /api/rutas/change-estado:
     *   post:
     *     tags:
     *       - Rutas
     *     summary: Cambiar el estado de una ruta
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               id:
     *                 type: number
     *                 example: 1
     *               estado:
     *                 type: string
     *                 enum: ["Pendiente", "En transito", "Finalizada"]
     *                 example: "Pendiente"
     *     responses:
     *       200:
     *         description: Estado de la ruta cambiado correctamente
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: Estado de la ruta cambiado correctamente
     */
    router.post('/change-estado', rutaController.changeEstado);

    return router;
  }
}
