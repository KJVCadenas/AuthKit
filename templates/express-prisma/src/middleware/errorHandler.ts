import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // Log error here (add structured logging in production)
  res
    .status(err.status || 500)
    .json({ error: err.message || 'Internal Server Error' });
}
