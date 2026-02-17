import { Router } from 'express';
import {
  register,
  login,
  logout,
  refresh,
  verifyEmail,
  requestPasswordReset,
  resetPassword,
  // TODO: Add refresh, verifyEmail, requestPasswordReset, resetPassword from controller
} from '../controllers/authController';
import { jwtCookieAuth } from '../middleware/jwtCookieAuth';
import {
  validateRegister,
  validateLogin,
  validateEmail,
  validatePasswordReset,
} from '../middleware/validation';

export const authRouter: Router = Router();

authRouter.post('/register', validateRegister, register);
authRouter.post('/login', validateLogin, login);
authRouter.post('/logout', logout);
// Example: Protect a route with JWT cookie auth
// authRouter.get('/me', jwtCookieAuth, (req, res) => res.json({ user: req.user }));
// TODO: Wire up refresh, verifyEmail, requestPasswordReset, resetPassword from controller

authRouter.post('/refresh', refresh);
authRouter.post('/verify-email', validateEmail, verifyEmail);
authRouter.post('/request-password-reset', validateEmail, requestPasswordReset);
authRouter.put('/reset-password', validatePasswordReset, resetPassword);
