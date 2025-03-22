import { Router } from 'express';
import { AuthController } from '../controllers';
import { UsersRepository } from '../repositories/users.repository';
import { AuthService } from '../services/auth.service';
import { AuthMiddleware } from '../../common/middlewares/auth.middleware';

export class AuthRoutes {
  static get routes(): Router {
    const router = Router();

    const usersRepository = new UsersRepository();
    const authService = new AuthService(usersRepository);
    const authController = new AuthController(authService);

    router.post('/register', authController.registerUser);
    router.post('/login', authController.loginUser);
    router.get('/users', [AuthMiddleware.validateJWT], authController.getUsers);

    return router;
  }
}
