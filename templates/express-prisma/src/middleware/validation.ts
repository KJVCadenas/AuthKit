import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
  name: z.string().min(1).max(255),
});

const loginSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
});

const emailSchema = z.object({
  email: z.string().email().max(255),
});

const passwordResetSchema = z.object({
  token: z.string(),
  password: z.string().min(8).max(128),
});

export function validateRegister(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    registerSchema.parse(req.body);
    next();
  } catch (err: any) {
    res.status(400).json({ error: err.errors });
  }
}

export function validateLogin(req: Request, res: Response, next: NextFunction) {
  try {
    loginSchema.parse(req.body);
    next();
  } catch (err: any) {
    res.status(400).json({ error: err.errors });
  }
}

export function validateEmail(req: Request, res: Response, next: NextFunction) {
  try {
    emailSchema.parse(req.body);
    next();
  } catch (err: any) {
    res.status(400).json({ error: err.errors });
  }
}

export function validatePasswordReset(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    passwordResetSchema.parse(req.body);
    next();
  } catch (err: any) {
    res.status(400).json({ error: err.errors });
  }
}
