import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';

export function requireRole(roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user || !roles.includes(user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}
