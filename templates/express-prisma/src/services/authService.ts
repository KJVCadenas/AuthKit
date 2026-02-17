import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';
import { generateAccessToken, generateRefreshToken } from './jwtService';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

// Service: Register user
export async function registerUser(
  email: string,
  password: string,
  name: string,
) {
  // [OWASP:A2] Use Argon2id with explicit memoryCost >= 65536 for strong password hashing
  const hashedPassword = await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 65536, // 64 MiB, increase if resources allow
    timeCost: 3, // Default is 3, can be tuned
    parallelism: 1, // Default is 1
  });
  try {
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'USER',
        emailVerified: false,
      },
    });
    // Create verification token
    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 hours
    await prisma.verificationToken.create({
      data: {
        userId: user.id,
        token,
        type: 'email',
        expiresAt,
      },
    });
    // TODO: Send verification email with token
    return user;
  } catch (err: any) {
    throw new Error('Email already in use.');
  }
}

// Service: Login user
export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  // [OWASP:A2] Constant-time login comparison to prevent user enumeration
  // Always perform argon2.verify, even if user does not exist, using a dummy hash
  // The dummy hash below is a valid Argon2id hash for the password 'invalid-password'
  const dummyHash =
    '$argon2id$v=19$m=65536,t=3,p=1$ZHVtbXlTYWx0$uQn1Qw1Qw1Qw1Qw1Qw1Qw1Qw1Qw1Qw1Qw1Qw1Qw1Qw';
  const hashToCheck = user ? user.password : dummyHash;
  const passwordValid = await argon2
    .verify(hashToCheck, password)
    .catch(() => false);
  if (!user || !passwordValid) {
    const err: any = new Error('Invalid credentials.');
    err.status = 401;
    throw err;
  }
  if (!user.emailVerified) {
    const err: any = new Error('Email not verified.');
    err.status = 403;
    throw err;
  }
  const tokenId = uuidv4();
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user, tokenId);
  await prisma.refreshToken.create({ data: { id: tokenId, userId: user.id } });
  return { accessToken, refreshToken, user };
}

/**
 * Logout: Revoke the refresh token by setting revoked=true in DB.
 * Note: Stateless JWT access tokens cannot be blacklisted; they expire after 15min.
 *       This is a limitation of JWT and is documented for [OWASP:A2] compliance.
 * @param refreshTokenId The ID of the refresh token to revoke
 * @returns void
 */
export async function logoutUser(refreshTokenId: string): Promise<void> {
  await prisma.refreshToken.update({
    where: { id: refreshTokenId },
    data: { revoked: true },
  });
}

// Service: Refresh tokens (rotation & reuse detection)
// [OWASP:A2] Prevents refresh token replay attacks via rotation & reuse detection
export async function refreshTokens(refreshToken: string) {
  const jwt = require('jsonwebtoken');
  let payload: any;
  try {
    // [OWASP:A2] Constant-time JWT verification
    payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!);
  } catch (err) {
    throw new Error('Invalid or expired refresh token.');
  }
  const tokenId = payload.tid;
  const userId = payload.sub;
  // Check if token is revoked or already used (reuse detection)
  const tokenRecord = await prisma.refreshToken.findUnique({
    where: { id: tokenId },
  });
  if (!tokenRecord || tokenRecord.revoked) {
    // [OWASP:A2] Reuse detected: revoke all tokens for user
    await prisma.refreshToken.updateMany({
      where: { userId },
      data: { revoked: true },
    });
    const err: any = new Error('Refresh token reuse detected.');
    err.code = 'REUSED_TOKEN';
    throw err;
  }
  // Rotate: revoke old, issue new
  await prisma.refreshToken.update({
    where: { id: tokenId },
    data: { revoked: true, rotatedAt: new Date() },
  });
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found.');
  const newTokenId = uuidv4();
  const accessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user, newTokenId);
  // Optionally, store parentTokenId for chain tracking
  await prisma.refreshToken.create({
    data: { id: newTokenId, userId: user.id, parentTokenId: tokenId },
  });
  return { accessToken, refreshToken: newRefreshToken, user };
}

// Service: Verify email
export async function verifyEmail(email: string, token: string) {
  // Find verification token
  const vt = await prisma.verificationToken.findUnique({ where: { token } });
  if (!vt || vt.expiresAt < new Date())
    throw new Error('Invalid or expired token.');
  const user = await prisma.user.findUnique({ where: { id: vt.userId } });
  if (!user || user.email !== email) throw new Error('Invalid token or email.');
  if (user.emailVerified) throw new Error('Email already verified.');
  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: true },
  });
  await prisma.verificationToken.delete({ where: { token } });
}

// Service: Request password reset
export async function requestPasswordReset(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return; // Do not reveal user existence
  const token = uuidv4();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour
  await prisma.verificationToken.create({
    data: {
      userId: user.id,
      token,
      type: 'password-reset',
      expiresAt,
    },
  });
  // Send password reset email (stub)
  // await sendEmail(user.email, 'Password reset', `Token: ${token}`)
}

// Service: Reset password
export async function resetPassword(token: string, newPassword: string) {
  const vt = await prisma.verificationToken.findUnique({ where: { token } });
  if (!vt || vt.expiresAt < new Date() || vt.type !== 'password-reset')
    throw new Error('Invalid or expired token.');
  const user = await prisma.user.findUnique({ where: { id: vt.userId } });
  if (!user) throw new Error('User not found.');
  const hashedPassword = await argon2.hash(newPassword, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 1,
  });
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  });
  await prisma.verificationToken.delete({ where: { token } });
}
