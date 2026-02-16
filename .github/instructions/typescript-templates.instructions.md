---
applyTo: "templates/**/*.ts,templates/**/*.tsx"
---

# TypeScript Template Coding Standards

## General

- Use TypeScript strict mode (`strict: true` in tsconfig)
- Prefer `const` over `let`; never use `var`
- Use explicit return types on exported functions
- Use `unknown` over `any` where possible

## Express.js (Prisma) Templates

- Use Zod schemas for all request validation
- Use Argon2id for password hashing (minimum memory cost 65536)
- Async error handling via middleware wrapper (`asyncHandler`)
- Prisma client injected via dependency injection pattern
- Route structure: `routes/ → controllers/ → services/ → repositories/`

## NestJS (TypeORM) Templates

- Use class-validator decorators on DTOs
- Use Guards for authentication and RBAC
- Use Passport.js strategies for JWT validation
- Global exception filter for consistent error responses
- Interceptors for response transformation and logging

## JWT Implementation [OWASP:A2]

```typescript
// Access token: short-lived
const accessToken = jwt.sign(payload, secret, { expiresIn: "15m" });
// Refresh token: longer-lived with rotation
const refreshToken = jwt.sign(payload, refreshSecret, { expiresIn: "7d" });
```

## Error Handling Pattern

```typescript
// Use explicit error types with status codes
class AppError extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode: number,
    public readonly code: string,
  ) {
    super(message);
  }
}
```

## Naming Conventions

- Files: `kebab-case.ts` (e.g., `auth-controller.ts`)
- Classes: `PascalCase` (e.g., `AuthService`)
- Functions/variables: `camelCase` (e.g., `verifyEmail`)
- Constants: `ALL_CAPS` (e.g., `MAX_LOGIN_ATTEMPTS`)
- Interfaces: `PascalCase` prefixed with `I` only if needed for disambiguation
