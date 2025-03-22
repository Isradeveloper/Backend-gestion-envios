import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CustomError } from '../errors/custom.error';
import { formatValidationErrors } from './formatters.utils';

export async function validateDto<T extends object>(
  dtoClass: new () => T,
  obj: any,
): Promise<T> {
  const instance = plainToInstance(dtoClass, obj);
  const errors = await validate(instance);

  if (errors.length > 0) {
    throw CustomError.validation(formatValidationErrors(errors));
  }

  return instance;
}
