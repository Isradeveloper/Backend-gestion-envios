import jwt from 'jsonwebtoken';
import { envs } from './envs';
import * as ms from 'ms';

const JWT_SEED = envs.JWT_SEED;

export class JwtAdapter {
  public static async generateToken(
    payload: any,
    expiresIn: ms.StringValue = '1h',
  ) {
    return new Promise((resolve, reject) => {
      jwt.sign(payload, JWT_SEED, { expiresIn }, (err, token) => {
        if (err) return resolve(null);

        return resolve(token);
      });
    });
  }

  public static validateToken<T>(token: string): Promise<T | null> {
    return new Promise((resolve, reject) => {
      jwt.verify(token, JWT_SEED, (err, decoded) => {
        if (err) return resolve(null);

        resolve(decoded as T);
      });
    });
  }
}
