import { CustomError } from '../errors/custom.error';
import { Response } from 'express';
import { handleMysqlError } from './handle-mysql.error';

export const handleError = (error: unknown, res: Response) => {
  if (handleMysqlError(error, res)) return;

  if (error instanceof CustomError) {
    if (error.errors) {
      return res
        .status(error.statusCode)
        .json({ message: error.message, errors: error.errors });
    }
    return res.status(error.statusCode).json({ message: error.message });
  }

  console.log(`${error}`);
  return res.status(500).json({ message: 'Internal server error' });
};
