import request from 'supertest';
import app from '../src/app';

describe('Auth Endpoints', () => {
  it('should register a new user', async () => {
    // Arrange
    const user = {
      email: 'test@example.com',
      password: 'Password123!',
      name: 'Test User',
    };
    // Act
    const res = await request(app).post('/auth/register').send(user);
    // Assert
    expect(res.statusCode).toEqual(201);
    expect(res.body.message).toMatch(/verify your email/i);
  });

  it('should not register with invalid email', async () => {
    // Arrange
    const user = {
      email: 'not-an-email',
      password: 'Password123!',
      name: 'Test User',
    };
    // Act
    const res = await request(app).post('/auth/register').send(user);
    // Assert
    expect(res.statusCode).toEqual(400);
  });

  it('should not login unverified user', async () => {
    // Arrange
    const user = {
      email: 'unverified@example.com',
      password: 'Password123!',
      name: 'Unverified',
    };
    await request(app).post('/auth/register').send(user);
    // Act
    const res = await request(app).post('/auth/login').send({
      email: user.email,
      password: user.password,
    });
    // Assert
    expect(res.statusCode).toEqual(403);
  });

  it('should login verified user and set JWT cookies', async () => {
    // Arrange: create and manually verify user
    const user = {
      email: 'verified@example.com',
      password: 'Password123!',
      name: 'Verified',
    };
    await request(app).post('/auth/register').send(user);
    // Simulate email verification in DB
    // (Assumes prisma is available and test DB is used)
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    await prisma.user.update({
      where: { email: user.email },
      data: { emailVerified: true },
    });
    // Act
    const res = await request(app).post('/auth/login').send({
      email: user.email,
      password: user.password,
    });
    // Assert
    expect(res.statusCode).toEqual(200);
    expect(res.headers['set-cookie']).toBeDefined();
    const setCookie = res.headers['set-cookie'];
    const cookies = Array.isArray(setCookie)
      ? setCookie.join(';')
      : typeof setCookie === 'string'
        ? setCookie
        : '';
    expect(cookies).toMatch(/accessToken=.*HttpOnly/);
    expect(cookies).toMatch(/refreshToken=.*HttpOnly/);
  });

  describe('POST /auth/register', () => {
    it('should not register duplicate email', async () => {
      const user = {
        email: 'dupe@example.com',
        password: 'Password123!',
        name: 'Dupe',
      };
      await request(app).post('/auth/register').send(user);
      const res = await request(app).post('/auth/register').send(user);
      expect(res.statusCode).toBe(400);
    });
    it('should not register with weak password', async () => {
      const user = { email: 'weak@example.com', password: '123', name: 'Weak' };
      const res = await request(app).post('/auth/register').send(user);
      expect(res.statusCode).toBe(400);
    });
    it('should not register with missing fields', async () => {
      const user = { email: '', password: '', name: '' };
      const res = await request(app).post('/auth/register').send(user);
      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /auth/login', () => {
    it('should not login with wrong password', async () => {
      const user = {
        email: 'wrongpass@example.com',
        password: 'Password123!',
        name: 'WrongPass',
      };
      await request(app).post('/auth/register').send(user);
      // Simulate verification
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();
      await prisma.user.update({
        where: { email: user.email },
        data: { emailVerified: true },
      });
      const res = await request(app)
        .post('/auth/login')
        .send({ email: user.email, password: 'WrongPassword123!' });
      expect(res.statusCode).toBe(401);
    });
    it('should not login non-existent user', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ email: 'nope@example.com', password: 'SomePassword123' });
      expect(res.statusCode).toBe(401);
    });
  });

  // RBAC and protected route tests
  describe('RBAC', () => {
    it('should forbid USER from admin route', async () => {
      const user = {
        email: 'user1@example.com',
        password: 'Password123!',
        name: 'User1',
      };
      await request(app).post('/auth/register').send(user);
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();
      await prisma.user.update({
        where: { email: user.email },
        data: { emailVerified: true },
      });
      // Simulate login
      const loginRes = await request(app)
        .post('/auth/login')
        .send({ email: user.email, password: user.password });
      const setCookieHeader = loginRes.headers['set-cookie'];
      let accessToken: string | undefined = undefined;
      if (Array.isArray(setCookieHeader)) {
        accessToken = setCookieHeader.find((c: string) =>
          c.startsWith('accessToken'),
        );
      } else if (typeof setCookieHeader === 'string') {
        accessToken = setCookieHeader.startsWith('accessToken')
          ? setCookieHeader
          : undefined;
      }
      // Try to access admin route (assume /admin/protected exists and uses RBAC)
      const res = await request(app)
        .get('/admin/protected')
        .set('Cookie', accessToken ? accessToken : '');
      expect([401, 403]).toContain(res.statusCode); // 401 if not logged in, 403 if forbidden
    });
  });

  // Security and validation edge cases
  describe('Security/Validation', () => {
    it('should return 401 for missing Authorization', async () => {
      const res = await request(app).get('/admin/protected');
      expect([401, 403]).toContain(res.statusCode);
    });
    it('should reject malformed JSON', async () => {
      const res = await request(app)
        .post('/auth/register')
        .set('Content-Type', 'application/json')
        .send('{badjson');
      expect([400, 415]).toContain(res.statusCode);
    });
    it('should reject buffer overflow/long fields', async () => {
      const user = {
        email: 'a'.repeat(300) + '@example.com',
        password: 'P'.repeat(300),
        name: 'N'.repeat(300),
      };
      const res = await request(app).post('/auth/register').send(user);
      expect(res.statusCode).toBe(400);
    });
    it('should reject invalid data types', async () => {
      const user = { email: 123, password: {}, name: [] };
      const res = await request(app).post('/auth/register').send(user);
      expect(res.statusCode).toBe(400);
    });
    it('should reject expired/invalid JWT', async () => {
      const res = await request(app)
        .get('/admin/protected')
        .set('Cookie', 'accessToken=invalid.jwt.token');
      expect([401, 403]).toContain(res.statusCode);
    });
  });

  // Edge case: empty body
  it('should reject empty request body', async () => {
    const res = await request(app).post('/auth/register').send();
    expect(res.statusCode).toBe(400);
  });

  // Edge case: unicode/special chars
  it('should register user with unicode chars', async () => {
    const user = {
      email: 'üñîçødë@example.com',
      password: 'Pässwørd123!',
      name: 'Üser',
    };
    const res = await request(app).post('/auth/register').send(user);
    expect([201, 400]).toContain(res.statusCode); // Accept if validation allows
  });
});

describe('Refresh Token Rotation & Reuse Detection', () => {
  let agent: request.SuperTest<request.Test>;
  let user: any;
  let prisma: any;
  beforeAll(async () => {
    agent = request(app);
    const { PrismaClient } = require('@prisma/client');
    prisma = new PrismaClient();
    user = {
      email: 'refreshuser@example.com',
      password: 'Password123!',
      name: 'Refresh User',
    };
  });
  beforeEach(async () => {
    // Clean up user if exists
    await prisma.refreshToken.deleteMany({
      where: {
        userId:
          (await prisma.user.findUnique({ where: { email: user.email } }))
            ?.id || undefined,
      },
    });
    await prisma.user.deleteMany({ where: { email: user.email } });
    // Register and verify user
    await agent.post('/auth/register').send(user);
    await prisma.user.update({
      where: { email: user.email },
      data: { emailVerified: true },
    });
  });
  afterAll(async () => {
    const found = await prisma.user.findUnique({
      where: { email: user.email },
    });
    if (found) {
      await prisma.refreshToken.deleteMany({ where: { userId: found.id } });
      await prisma.verificationToken.deleteMany({
        where: { userId: found.id },
      });
      await prisma.user.deleteMany({ where: { email: user.email } });
    }
    await prisma.$disconnect();
  });
  it('rotates refresh token and revokes old on use', async () => {
    // Login to get initial tokens
    const loginRes = await agent
      .post('/auth/login')
      .send({ email: user.email, password: user.password });
    const cookies = loginRes.headers['set-cookie'];
    let refreshCookie: string | undefined;
    if (Array.isArray(cookies)) {
      refreshCookie = cookies.find((c: string) => c.startsWith('refreshToken'));
    } else if (typeof cookies === 'string') {
      refreshCookie = cookies.startsWith('refreshToken') ? cookies : undefined;
    }
    if (!refreshCookie) throw new Error('refreshCookie not set after login');
    const refreshRes = await agent
      .post('/auth/refresh')
      .set('Cookie', refreshCookie)
      .send();
    expect(refreshRes.statusCode).toBe(200);
    const newCookies = refreshRes.headers['set-cookie'];
    let newRefreshCookie: string | undefined;
    if (Array.isArray(newCookies)) {
      newRefreshCookie = newCookies.find((c: string) =>
        c.startsWith('refreshToken'),
      );
    } else if (typeof newCookies === 'string') {
      newRefreshCookie = newCookies.startsWith('refreshToken')
        ? newCookies
        : undefined;
    }
    expect(newRefreshCookie).toBeDefined();
    // Old token should now be revoked in DB
    const parts = refreshCookie.split('=');
    if (parts.length < 2) throw new Error('Malformed refreshCookie');
    const payload = require('jsonwebtoken').decode(parts[1]!.split(';')[0]);
    if (!payload || typeof payload !== 'object' || !('tid' in payload))
      throw new Error('Failed to decode refresh token');
    const tokenId = (payload as { tid: string }).tid;
    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { id: tokenId },
    });
    expect(tokenRecord.revoked).toBe(true);
  });
  it('revokes all tokens and rejects on reuse of old refresh token', async () => {
    // Login to get fresh tokens
    const loginRes = await agent
      .post('/auth/login')
      .send({ email: user.email, password: user.password });
    const cookies = loginRes.headers['set-cookie'];
    let refreshCookie: string | undefined;
    if (Array.isArray(cookies)) {
      refreshCookie = cookies.find((c: string) => c.startsWith('refreshToken'));
    } else if (typeof cookies === 'string') {
      refreshCookie = cookies.startsWith('refreshToken') ? cookies : undefined;
    }
    // Use refresh endpoint (first use)
    if (!refreshCookie) throw new Error('refreshCookie not set after login');
    const refreshRes = await agent
      .post('/auth/refresh')
      .set('Cookie', refreshCookie)
      .send();
    expect(refreshRes.statusCode).toBe(200);
    // Reuse old refresh token (should trigger reuse detection)
    const reuseRes = await agent
      .post('/auth/refresh')
      .set('Cookie', refreshCookie)
      .send();
    expect(reuseRes.statusCode).toBe(401);
    expect(reuseRes.body.error).toMatch(/reuse detected/i);
    // All tokens for user should be revoked
    const userRecord = await prisma.user.findUnique({
      where: { email: user.email },
    });
    const tokens = await prisma.refreshToken.findMany({
      where: { userId: userRecord.id },
    });
    expect(tokens.every((t: any) => t.revoked)).toBe(true);
  });
});

describe('Email Verification', () => {
  it('should verify email with valid token', async () => {
    const user = {
      email: 'verify@example.com',
      password: 'Password123!',
      name: 'Verify',
    };
    await request(app).post('/auth/register').send(user);
    // Get the verification token from DB
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    const vt = await prisma.verificationToken.findFirst({
      where: { user: { email: user.email }, type: 'email' },
    });
    expect(vt).toBeDefined();
    // Verify email
    const res = await request(app)
      .post('/auth/verify-email')
      .send({ email: user.email, token: vt!.token });
    expect(res.statusCode).toBe(200);
    // Check user is verified
    const updatedUser = await prisma.user.findUnique({
      where: { email: user.email },
    });
    expect(updatedUser!.emailVerified).toBe(true);
    // Token should be deleted
    const vtAfter = await prisma.verificationToken.findUnique({
      where: { token: vt!.token },
    });
    expect(vtAfter).toBeNull();
  });

  it('should not verify with expired token', async () => {
    const user = {
      email: 'expired@example.com',
      password: 'Password123!',
      name: 'Expired',
    };
    await request(app).post('/auth/register').send(user);
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    // Set token to expired
    await prisma.verificationToken.updateMany({
      where: { user: { email: user.email }, type: 'email' },
      data: { expiresAt: new Date(Date.now() - 1000) },
    });
    const vt = await prisma.verificationToken.findFirst({
      where: { user: { email: user.email }, type: 'email' },
    });
    const res = await request(app)
      .post('/auth/verify-email')
      .send({ email: user.email, token: vt!.token });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/expired/i);
  });

  it('should not verify with invalid token', async () => {
    const res = await request(app)
      .post('/auth/verify-email')
      .send({ email: 'invalid@example.com', token: 'invalid-token' });
    expect(res.statusCode).toBe(400);
  });

  it('should not verify already verified email', async () => {
    const user = {
      email: 'already@example.com',
      password: 'Password123!',
      name: 'Already',
    };
    await request(app).post('/auth/register').send(user);
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    // Manually verify
    await prisma.user.update({
      where: { email: user.email },
      data: { emailVerified: true },
    });
    const vt = await prisma.verificationToken.findFirst({
      where: { user: { email: user.email }, type: 'email' },
    });
    const res = await request(app)
      .post('/auth/verify-email')
      .send({ email: user.email, token: vt!.token });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/already verified/i);
  });
});

describe('Password Reset', () => {
  it('should request password reset and create token', async () => {
    const user = {
      email: 'reset@example.com',
      password: 'Password123!',
      name: 'Reset',
    };
    await request(app).post('/auth/register').send(user);
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    await prisma.user.update({
      where: { email: user.email },
      data: { emailVerified: true },
    });
    const res = await request(app)
      .post('/auth/request-password-reset')
      .send({ email: user.email });
    expect(res.statusCode).toBe(200);
    // Check token created
    const vt = await prisma.verificationToken.findFirst({
      where: { user: { email: user.email }, type: 'password-reset' },
    });
    expect(vt).toBeDefined();
  });

  it('should reset password with valid token', async () => {
    const user = {
      email: 'resetvalid@example.com',
      password: 'Password123!',
      name: 'ResetValid',
    };
    await request(app).post('/auth/register').send(user);
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    await prisma.user.update({
      where: { email: user.email },
      data: { emailVerified: true },
    });
    // Request reset
    await request(app)
      .post('/auth/request-password-reset')
      .send({ email: user.email });
    const vt = await prisma.verificationToken.findFirst({
      where: { user: { email: user.email }, type: 'password-reset' },
    });
    // Reset password
    const newPassword = 'NewPassword123!';
    const res = await request(app)
      .put('/auth/reset-password')
      .send({ token: vt!.token, password: newPassword });
    expect(res.statusCode).toBe(200);
    // Check password updated and hashed
    const updatedUser = await prisma.user.findUnique({
      where: { email: user.email },
    });
    const argon2 = require('argon2');
    const isValid = await argon2.verify(updatedUser!.password, newPassword);
    expect(isValid).toBe(true);
    // Token deleted
    const vtAfter = await prisma.verificationToken.findUnique({
      where: { token: vt!.token },
    });
    expect(vtAfter).toBeNull();
  });

  it('should not reset with expired token', async () => {
    const user = {
      email: 'resetexpired@example.com',
      password: 'Password123!',
      name: 'ResetExpired',
    };
    await request(app).post('/auth/register').send(user);
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    await prisma.user.update({
      where: { email: user.email },
      data: { emailVerified: true },
    });
    // Create expired token
    const token = require('uuid').v4();
    await prisma.verificationToken.create({
      data: {
        userId: (await prisma.user.findUnique({
          where: { email: user.email },
        }))!.id,
        token,
        type: 'password-reset',
        expiresAt: new Date(Date.now() - 1000),
      },
    });
    const res = await request(app)
      .put('/auth/reset-password')
      .send({ token, password: 'NewPass123!' });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/expired/i);
  });
});

describe('Logout', () => {
  it('should blacklist refresh token on logout', async () => {
    const user = {
      email: 'logout@example.com',
      password: 'Password123!',
      name: 'Logout',
    };
    await request(app).post('/auth/register').send(user);
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    await prisma.user.update({
      where: { email: user.email },
      data: { emailVerified: true },
    });
    // Login
    const loginRes = await request(app)
      .post('/auth/login')
      .send({ email: user.email, password: user.password });
    const cookies = loginRes.headers['set-cookie'];
    if (!Array.isArray(cookies)) throw new Error('set-cookie not array');
    const accessTokenCookie = cookies.find((c: string) => c.startsWith('accessToken'));
    const refreshTokenCookie = cookies.find((c: string) => c.startsWith('refreshToken'));
    const accessToken = accessTokenCookie!.split(';')[0].split('=')[1];
    const refreshToken = refreshTokenCookie!.split(';')[0].split('=')[1];
    // Logout
    const logoutRes = await request(app)
      .post('/auth/logout')
      .set('Cookie', `refreshToken=${refreshToken}`);
    expect(logoutRes.statusCode).toBe(200);
    // Try to refresh with the same token
    const refreshRes = await request(app)
      .post('/auth/refresh')
      .set('Cookie', `refreshToken=${refreshToken}`);
    expect(refreshRes.statusCode).toBe(401);
  });
});

describe('Rate Limiting', () => {
  it('should allow requests within limit', async () => {
    for (let i = 0; i < 10; i++) {
      const res = await request(app)
        .post('/auth/register')
        .send({
          email: `rate${i}@example.com`,
          password: 'Password123!',
          name: 'Rate',
        });
      expect([201, 400]).toContain(res.statusCode); // 400 for duplicates, but within limit
    }
  });

  // Note: Testing exceeding limit requires 101 requests, which may be slow.
  // In a real scenario, adjust rate limit for tests or mock.
  it('should return 429 when exceeding limit', async () => {
    // This test may take time; in practice, lower the limit for tests.
    for (let i = 0; i < 101; i++) {
      await request(app)
        .post('/auth/register')
        .send({
          email: `flood${i}@example.com`,
          password: 'Password123!',
          name: 'Flood',
        });
    }
    const res = await request(app).post('/auth/register').send({
      email: 'last@example.com',
      password: 'Password123!',
      name: 'Last',
    });
    expect(res.statusCode).toBe(429);
  });
});
