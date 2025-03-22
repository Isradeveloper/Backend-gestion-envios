import { BcryptAdapter, JwtAdapter } from '../../../config';
import { CustomError } from '../../common/errors';
import { CreateUserDto, LoginUserDto } from '../dtos';
import { UsersRepository } from '../repositories/users.repository';

export class AuthService {
  constructor(private usersRepository: UsersRepository) {}

  getUsers = async () => {
    const users = await this.usersRepository.getUsers();
    return { message: 'Users found', data: users };
  };

  registerUser = async (createUserDto: CreateUserDto) => {
    const userFound = await this.usersRepository.findUserByTerm(
      'email',
      createUserDto.email,
    );

    if (userFound)
      throw CustomError.badRequest('El usuario ya se encuentra registrado');

    const hashedPassword = BcryptAdapter.hash(createUserDto.password);

    const { password, ...user } = await this.usersRepository.createUser({
      ...createUserDto,
      password: hashedPassword,
    });

    const token = await JwtAdapter.generateToken({
      id: user.id,
      email: user.email,
    });

    return { message: 'Usuario registrado', data: { user, token } };
  };

  loginUser = async (loginUserDto: LoginUserDto) => {
    const user = await this.usersRepository.findUserByTerm(
      'email',
      loginUserDto.email,
    );

    if (!user)
      throw CustomError.unauthorized(
        'El email o la contraseña no son correctos',
      );

    const isPasswordValid = BcryptAdapter.compare(
      loginUserDto.password,
      user.password,
    );

    if (!isPasswordValid)
      throw CustomError.unauthorized(
        'El email o la contraseña no son correctos',
      );

    const { password, ...rest } = user;

    const token = await JwtAdapter.generateToken({
      id: user.id,
      email: user.email,
    });

    return { message: 'Inicio de sesión exitoso', data: { user: rest, token } };
  };
}
