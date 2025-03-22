import { Router } from 'express';
import { AuthController } from '../controllers';
import { UsersRepository } from '../repositories/users.repository';
import { AuthService } from '../services/auth.service';
import { AuthMiddleware } from '../../common/middlewares/auth.middleware';

export class AuthRoutes {
  static get routes(): Router {
    const router = Router();

    /**
     * @swagger
     * components:
     *   schemas:
     *     RegisterUser:
     *       type: object
     *       properties:
     *         name:
     *           type: string
     *           example: "John Doe"
     *         email:
     *           type: string
     *           example: "john@example.com"
     *         password:
     *           type: string
     *           example: "password123"
     *     LoginUser:
     *       type: object
     *       properties:
     *         email:
     *           type: string
     *           example: "john@example.com"
     *         password:
     *           type: string
     *           example: "password123"
     */

    const usersRepository = new UsersRepository();
    const authService = new AuthService(usersRepository);
    const authController = new AuthController(authService);

    /**
     * @swagger
     * /api/auth/register:
     *   post:
     *     tags:
     *       - Auth
     *     summary: Registrar un nuevo usuario
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/RegisterUser'
     *     responses:
     *       200:
     *         description: Usuario registrado exitosamente
     */
    router.post('/register', authController.registerUser);

    /**
     * @swagger
     * /api/auth/login:
     *   post:
     *     tags:
     *       - Auth
     *     summary: Iniciar sesión
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/LoginUser'
     *     responses:
     *       200:
     *         description: Sesión iniciada exitosamente
     */
    router.post('/login', authController.loginUser);

    /**
     * @swagger
     * /api/auth/users:
     *   get:
     *     security:
     *       - BearerAuth: []
     *     tags:
     *       - Auth
     *     summary: Get users
     *     responses:
     *       200:
     *         description: A list of users
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/RegisterUser'
     */
    router.get('/users', [AuthMiddleware.validateJWT], authController.getUsers);

    return router;
  }
}
