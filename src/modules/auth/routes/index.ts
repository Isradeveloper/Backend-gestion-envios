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
     * /api/auth/refresh-token:
     *   post:
     *     tags:
     *       - Auth
     *     summary: Refrescar token
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               refreshToken:
     *                 type: string
     *                 example: "eyJhbGciOi"
     *     responses:
     *       200:
     *         description: Token refrescado exitosamente
     */
    router.post('/refresh-token', authController.refreshToken);

    return router;
  }
}
