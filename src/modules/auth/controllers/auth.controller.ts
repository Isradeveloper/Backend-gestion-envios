import { Request, Response } from 'express';
import { handleError } from '../../common/errors';
import { AuthService } from '../services/auth.service';
import { validateDto } from '../../common/utils';
import { CreateUserDto, LoginUserDto } from '../dtos';

export class AuthController {
  constructor(private authService: AuthService) {}

  getUsers = async (req: Request, res: Response) => {
    try {
      const users = await this.authService.getUsers();
      res.json({ message: 'Users found', data: users });
    } catch (error) {
      handleError(error, res);
    }
  };

  registerUser = async (req: Request, res: Response) => {
    try {
      const createUserDto = await validateDto(CreateUserDto, req.body);
      const result = await this.authService.registerUser(createUserDto);
      res.json(result);
    } catch (error) {
      handleError(error, res);
    }
  };

  loginUser = async (req: Request, res: Response) => {
    try {
      const loginUserDto = await validateDto(LoginUserDto, req.body);
      const result = await this.authService.loginUser(loginUserDto);
      res.json(result);
    } catch (error) {
      handleError(error, res);
    }
  };
}
