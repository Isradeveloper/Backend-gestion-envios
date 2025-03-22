import { NextFunction, Request, Response } from 'express';
import { JwtAdapter } from '../../../config';
import { UsersRepository } from '../../auth';
import { UserJwt } from '../interfaces/user-jwt.interface';

export class AuthMiddleware {
  static async validateJWT(req: Request, res: Response, next: NextFunction) {
    const userRepository = new UsersRepository();
    try {
      const authorization = req.headers['authorization'] as string;
      if (!authorization)
        return res.status(401).json({ message: 'El token no se proporcionó' });
      if (!authorization.startsWith('Bearer '))
        return res.status(401).json({ message: 'Formato de token invalido' });

      const token = authorization.split(' ').at(1) || '';

      const payload = await JwtAdapter.validateToken<UserJwt>(token);
      if (!payload) return res.status(401).json({ message: 'Token invalido' });

      const user = await userRepository.findUserByTerm('id', payload.id);
      if (!user) return res.status(401).json({ message: 'Token invalido' });

      if (!user.active)
        return res.status(401).json({ message: 'El usuario no esta activo' });

      req.body.user = user;
      next();
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}
