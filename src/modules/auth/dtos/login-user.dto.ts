import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

export class LoginUserDto {
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
