import { Response } from 'express';

// Definir el tipo de error de MySQL manualmente
interface MysqlError extends Error {
  code: string;
  errno: number;
  sqlMessage: string;
  sqlState?: string;
  sql?: string;
}

export const handleMysqlError = (error: unknown, res: Response) => {
  if (!(error as MysqlError).code) {
    return false;
  }

  const mysqlError = error as MysqlError;

  console.error('❌ Error en MySQL:', mysqlError);

  switch (mysqlError.code) {
    case 'ER_NO_SUCH_TABLE':
      return res.status(400).json({
        message: 'Error en la base de datos.',
      });

    case 'ER_BAD_FIELD_ERROR':
      return res.status(400).json({
        message: 'Error en la base de datos.',
      });

    case 'ER_ACCESS_DENIED_ERROR':
      return res.status(403).json({
        message: 'Acceso denegado.',
      });

    case 'ER_DUP_ENTRY':
      return res.status(409).json({
        message: 'Dato duplicado en la base de datos.',
      });

    default:
      return res.status(500).json({
        message: 'Error en la base de datos.',
      });
  }
};
