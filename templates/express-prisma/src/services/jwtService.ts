import jwt from 'jsonwebtoken';
import { User } from '@prisma/client';

const ACCESS_TOKEN_EXPIRES_IN = '15m';
const REFRESH_TOKEN_EXPIRES_IN = '7d';

export function generateAccessToken(user: User) {
  return jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET!, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  });
}

export function generateRefreshToken(user: User, tokenId: string) {
  return jwt.sign(
    { sub: user.id, tid: tokenId },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: REFRESH_TOKEN_EXPIRES_IN },
  );
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, process.env.JWT_SECRET!);
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET!);
}
