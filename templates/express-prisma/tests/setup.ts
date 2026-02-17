import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

beforeAll(async () => {
  // Ensure database is connected
  await prisma.$connect();

  // Push database schema
  const { execSync } = require('child_process');
  try {
    execSync('npx prisma db push --skip-generate --force-reset', {
      stdio: 'pipe',
    });
  } catch (error) {
    console.error('Failed to push database schema:', error);
  }
});

beforeEach(async () => {
  // Clean database between tests
  await prisma.verificationToken.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

export { prisma };
