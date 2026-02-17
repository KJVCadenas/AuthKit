import { Request, Response } from 'express';
import * as authService from '../services/authService';
import { config } from '../config';
import jwt from 'jsonwebtoken';

// Register controller
export async function register(req: Request, res: Response) {
  const { email, password, name } = req.body;
  try {
    await authService.registerUser(email, password, name);
    res
      .status(201)
      .json({ message: 'User registered. Please verify your email.' });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Email already in use.' });
  }
}

// Login controller
export async function login(req: Request, res: Response) {
  const { email, password } = req.body;
  try {
    const { accessToken, refreshToken, user } = await authService.loginUser(
      email,
      password,
    );
    // Set JWTs in secure, HTTP-only cookies
    res.setHeader('Set-Cookie', [
      `accessToken=${accessToken}; HttpOnly; Path=/; Max-Age=900; SameSite=Strict${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`,
      `refreshToken=${refreshToken}; HttpOnly; Path=/auth/refresh; Max-Age=604800; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`,
    ]);
    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err: any) {
    res
      .status(err.status || 401)
      .json({ error: err.message || 'Invalid credentials.' });
  }
}

// Logout controller
export async function logout(req: Request, res: Response) {
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) {
    return res.status(400).json({ error: 'No refresh token provided.' });
  }
  try {
    // Securely verify and decode refreshToken to extract its ID (jti claim)
    const payload = jwt.verify(refreshToken, config.jwtRefreshSecret) as {
      tid?: string;
    };
    const tokenId = payload.tid;
    if (!tokenId) throw new Error('Invalid refresh token.');
    await authService.logoutUser(tokenId);
    // Clear cookies
    res.setHeader('Set-Cookie', [
      'accessToken=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict',
      'refreshToken=; HttpOnly; Path=/auth/refresh; Max-Age=0; SameSite=Lax',
    ]);
    res.status(200).json({ message: 'Logged out.' });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Logout failed.' });
  }
}

// Refresh token controller (rotation & reuse detection)
export async function refresh(req: Request, res: Response) {
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) {
    return res.status(400).json({ error: 'No refresh token provided.' });
  }
  try {
    const {
      accessToken,
      refreshToken: newRefreshToken,
      user,
    } = await authService.refreshTokens(refreshToken);
    res.setHeader('Set-Cookie', [
      `accessToken=${accessToken}; HttpOnly; Path=/; Max-Age=900; SameSite=Strict${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`,
      `refreshToken=${newRefreshToken}; HttpOnly; Path=/auth/refresh; Max-Age=604800; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`,
    ]);
    res.status(200).json({
      message: 'Tokens refreshed',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err: any) {
    // On reuse detection, revoke all tokens and clear cookies
    if (err.code === 'REUSED_TOKEN') {
      res.setHeader('Set-Cookie', [
        'accessToken=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict',
        'refreshToken=; HttpOnly; Path=/auth/refresh; Max-Age=0; SameSite=Lax',
      ]);
      return res
        .status(401)
        .json({ error: 'Refresh token reuse detected. All sessions revoked.' });
    }
    res
      .status(401)
      .json({ error: err.message || 'Invalid or expired refresh token.' });
  }
}

// Email verification controller
export async function verifyEmail(req: Request, res: Response) {
  const { email, token } = req.body;
  try {
    await authService.verifyEmail(email, token);
    res.status(200).json({ message: 'Email verified.' });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Invalid or expired token.' });
  }
}

// Request password reset controller
export async function requestPasswordReset(req: Request, res: Response) {
  const { email } = req.body;
  try {
    await authService.requestPasswordReset(email);
    res
      .status(200)
      .json({ message: 'If the email exists, a reset link was sent.' });
  } catch (err: any) {
    res
      .status(400)
      .json({ error: err.message || 'Failed to send reset email.' });
  }
}

// Reset password controller
export async function resetPassword(req: Request, res: Response) {
  const { token, password } = req.body;
  try {
    await authService.resetPassword(token, password);
    res.status(200).json({ message: 'Password reset successful.' });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Invalid or expired token.' });
  }
}
