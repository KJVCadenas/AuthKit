import { Request, Response, NextFunction } from 'express';
import type { User } from '@prisma/client';
import { verifyAccessToken } from '../services/jwtService';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Auth middleware: verifies JWT from HttpOnly cookie
export async function jwtCookieAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const token = req.cookies?.accessToken;
    if (!token) {
      return res.status(401).json({ error: 'Missing access token.' });
    }
    const payload = verifyAccessToken(token) as { sub: string };
    // Attach JWT payload as req.user for downstream RBAC/guards
    (req as any).user = payload;
    next();
  } catch (err: any) {
    return res.status(401).json({ error: 'Invalid or expired access token.' });
  }
}
