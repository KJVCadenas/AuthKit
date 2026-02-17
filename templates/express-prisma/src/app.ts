import express, { Express, Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { json } from 'body-parser';
import cookieParser from 'cookie-parser';
import { authRouter } from './routes/auth';
import { errorHandler } from './middleware/errorHandler';
import { jwtCookieAuth } from './middleware/jwtCookieAuth';
import { requireRole } from './middleware/rbac';
import { Role } from '@prisma/client';

// Load environment variables
dotenv.config();

const app: Express = express();

// Security middleware
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(json());
app.use(cookieParser());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

// Routes
app.use('/auth', authRouter);

// Protected admin route for testing
app.get(
  '/admin/protected',
  jwtCookieAuth,
  requireRole([Role.ADMIN]),
  (req: Request, res: Response) => {
    res.status(200).json({ message: 'Admin access granted' });
  },
);

// Error handler
app.use(errorHandler);

export default app;
