import dotenv from 'dotenv';
dotenv.config();

function requireStrongSecret(secret: string, name: string) {
  if (!secret || secret.length < 32) {
    throw new Error(
      `[OWASP:A3] ${name} must be at least 32 characters. Use a secure random string.\n` +
        `See .env.example for guidance.`,
    );
  }
}

const jwtSecret = process.env.JWT_SECRET!;
const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET!;
requireStrongSecret(jwtSecret, 'JWT_SECRET');
requireStrongSecret(jwtRefreshSecret, 'JWT_REFRESH_SECRET');

export const config = {
  port: process.env.PORT || 3000,
  jwtSecret,
  jwtRefreshSecret,
  databaseUrl: process.env.DATABASE_URL!,
  corsOrigin: process.env.CORS_ORIGIN || '*',
};
