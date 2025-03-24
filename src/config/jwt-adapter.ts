import jwt from 'jsonwebtoken';
import { envs } from './envs';
import * as ms from 'ms';

const JWT_ACCESS_SECRET = envs.JWT_ACCESS_SECRET;
const JWT_REFRESH_SECRET = envs.JWT_REFRESH_SECRET;

export class JwtAdapter {
  public static async generateToken(
    payload: any,
    expiresIn: ms.StringValue = '15m', // Duración recomendada: 15 min
  ): Promise<string | null> {
    return new Promise((resolve) => {
      jwt.sign(payload, JWT_ACCESS_SECRET, { expiresIn }, (err, token) => {
        if (err) return resolve(null);
        return resolve(token ?? '');
      });
    });
  }

  // Generar Refresh Token (expira en más tiempo)
  public static async generateRefreshToken(
    payload: any,
    expiresIn: ms.StringValue = '7d', // Duración recomendada: 7 días
  ): Promise<string | null> {
    return new Promise((resolve) => {
      jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn }, (err, token) => {
        if (err) return resolve(null);
        return resolve(token ?? '');
      });
    });
  }

  public static validateToken<T>(token: string): Promise<T | null> {
    return new Promise((resolve) => {
      jwt.verify(token, JWT_ACCESS_SECRET, (err, decoded) => {
        if (err) return resolve(null);
        resolve(decoded as T);
      });
    });
  }

  public static validateRefreshToken<T>(token: string): Promise<T | null> {
    return new Promise((resolve) => {
      jwt.verify(token, JWT_REFRESH_SECRET, (err, decoded) => {
        if (err) return resolve(null);
        resolve(decoded as T);
      });
    });
  }
}
