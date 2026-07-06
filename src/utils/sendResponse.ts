import { Response } from 'express';

type TMeta = {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
};

type TResponse<T> = {
  statusCode: number;
  success: boolean;
  message: string;
  data?: T;
  meta?: TMeta;
};

export const sendResponse = <T>(res: Response, payload: TResponse<T>) => {
  const { statusCode, success, message, data, meta } = payload;
  return res.status(statusCode).json({
    success,
    message,
    meta,
    data
  });
};
