import { ValidationError } from 'class-validator';

export const formatValidationErrors = (
  errors: ValidationError[],
): Record<string, string[]> => {
  return errors.reduce((acc, error) => {
    if (error.constraints) {
      acc[error.property] = Object.values(error.constraints);
    }
    return acc;
  }, {} as Record<string, string[]>);
};

export const TinyIntToBoolean = (value: number): boolean => {
  return value === 1;
};
