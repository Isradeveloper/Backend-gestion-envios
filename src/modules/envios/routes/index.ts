import { Router } from 'express';
import { EnviosController } from '../controllers';
import { EnvioRepository } from '../repositories/envios.repository';
import { EnvioService } from '../services/envios.service';
import { AuthMiddleware } from '../../common/middlewares/auth.middleware';
import { ResendService } from '../../mailer/services/mailer.service';

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
     *         ruta:
     *          type: object
     *          properties:
     *            id:
     *              type: integer
     *              example: 12
     *            origen:
     *              type: string
     *              example: "A"
     *            destino:
     *              type: string
     *              example: "B"
     *            estado:
     *              type: string
     *              example: "Pendiente"
     *            fechaInicio:
     *              type: string
     *              example: null
     *            fechaFin:
     *              type: string
     *              example: null
     *            transportista:
     *              type: object
     *              properties:
     *                id:
     *                  type: integer
     *                  example: 1
     *                nombre:
     *                  type: string
     *                  example: "John Doe"
     *                cedula:
     *                  type: string
     *                  example: "123456789"
     *            vehiculo:
     *              type: object
     *              properties:
     *                id:
     *                  type: integer
     *                  example: 1
     *                placa:
     *                  type: string
     *                  example: "ABC-123"
     *                peso_maximo:
     *                  type: string
     *                  example: "50.00"
     *                volumen_maximo:
     *                  type: string
     *                  example: "150.00"
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
    const mailerService = new ResendService();
    const envioService = new EnvioService(envioRepository, mailerService);
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
     *       - name: estado
     *         in: query
     *         required: false
     *         description: estado del envío
     *         schema:
     *           type: string
     *           example: "Pendiente"
     *       - name: search
     *         in: query
     *         required: false
     *         description: búsqueda
     *         schema:
     *           type: string
     *           example: "123 Main St"
     *       - name: fechaInicio
     *         in: query
     *         required: false
     *         description: fecha de inicio
     *         schema:
     *           type: string
     *           example: "2023-01-01"
     *       - name: fechaFin
     *         in: query
     *         required: false
     *         description: fecha de fin
     *         schema:
     *           type: string
     *           example: "2023-01-31"
     *       - name: transportistaId
     *         in: query
     *         required: false
     *         description: id del transportista
     *         schema:
     *           type: integer
     *           example: 1
     *       - name: usuarioId
     *         in: query
     *         required: false
     *         description: id del usuario
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

    /**
     * @swagger
     * /api/envios/{code}/estados:
     *   get:
     *     tags:
     *       - Envios
     *     summary: Obtener los estados de un envio
     *     parameters:
     *       - name: code
     *         in: path
     *         required: true
     *         description: Código del envío
     *         schema:
     *           type: string
     *           example: "ABC123"
     *     responses:
     *       200:
     *         description: Lista de estados
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
     *                   estado:
     *                     type: string
     *                     example: "En transito"
     *                   fecha:
     *                     type: string
     *                     example: "2023-01-01T00:00:00.000Z"
     *                   direccion:
     *                     type: string
     *                     example: "123 Main St"
     *
     */
    router.get('/:code/estados', envioController.getEstadosPorEnvio);

    /**
     * @swagger
     * /api/envios/reportes:
     *   get:
     *     tags:
     *       - Envios
     *     summary: Obtener reporte de envios
     *     parameters:
     *       - name: estado
     *         in: query
     *         required: false
     *         description: estado del envío
     *         schema:
     *           type: string
     *           example: "Pendiente"
     *       - name: search
     *         in: query
     *         required: false
     *         description: búsqueda
     *         schema:
     *           type: string
     *           example: "123 Main St"
     *       - name: fechaInicio
     *         in: query
     *         required: false
     *         description: fecha de inicio
     *         schema:
     *           type: string
     *           example: "2023-01-01"
     *       - name: fechaFin
     *         in: query
     *         required: false
     *         description: fecha de fin
     *         schema:
     *           type: string
     *           example: "2023-01-31"
     *       - name: transportistaId
     *         in: query
     *         required: false
     *         description: id del transportista
     *         schema:
     *           type: integer
     *           example: 1
     *       - name: usuarioId
     *         in: query
     *         required: false
     *         description: id del usuario
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
    router.get('/reportes', envioController.getReportesEnvios);

    return router;
  }
}
