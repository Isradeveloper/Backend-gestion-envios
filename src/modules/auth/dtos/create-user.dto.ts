import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

export class CreateUserDto {
  @IsString({ message: 'El nombre debe ser un string.' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres.' })
  @MaxLength(100, { message: 'El nombre no puede superar los 50 caracteres.' })
  name!: string;

  @IsEmail({}, { message: 'El correo electrónico no es válido.' })
  email!: string;

  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres.' })
  @MaxLength(50, {
    message: 'La contraseña no puede superar los 50 caracteres.',
  })
  @Matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[\W_]).{6,50}$/, {
    message:
      'La contraseña debe contener una mayúscula, una minúscula, un número y un carácter especial.',
  })
  password!: string;
}
