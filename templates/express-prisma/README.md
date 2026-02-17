# Express + Prisma Auth Template

This template scaffolds a secure, production-ready authentication backend using Express.js and Prisma ORM.

## Features

- JWT access/refresh tokens (rotation, reuse detection)
- **JWTs are set in secure, HTTP-only cookies** (not in response bodies)
- Register, verify email, login, refresh, reset password, logout
- RBAC: User/Admin/Moderator roles
- OWASP Top 10 mitigations ([OWASP:A1-A10])
- Unit/integration tests
- Linting with ESLint & Prettier
- OpenAPI docs at `/docs`
- Docker & CI/CD ready

## Quick Start

1. **Install dependencies:**
   ```sh
   npm install
   ```
2. **Setup environment:**
   - Copy `.env.example` to `.env` and fill in secrets.
3. **Run database migrations:**
   ```sh
   npx prisma migrate dev --name init
   ```
4. **Start the server:**
   ```sh
   npm run dev
   ```
5. **Access API docs:**
   - Visit [http://localhost:3000/docs](http://localhost:3000/docs)

## Security Highlights

- Passwords hashed with Argon2 [OWASP:A2]
- Input validation via Zod [OWASP:A1, A5]
- JWT best practices: 15min access, 7d refresh, rotation & reuse detection [OWASP:A2, A5]
- **JWTs are only accessible via HTTP-only cookies** (never exposed to JS) [OWASP:A2, A5]
- Rate limiting, helmet, CORS, CSRF protection [OWASP:A7, A8]
- No secrets in code; use environment variables [OWASP:A6]

## Migration Note

**Breaking change:** As of Feb 2026, all JWTs are now set in secure, HTTP-only cookies. Clients must read tokens from cookies, not from response bodies. See tests for usage examples.

## Development

- **Lint:** `npm run lint`
- **Test:** `npm test`
- **Run with Docker:** `docker compose up --build`

## Extending

- Add new endpoints in `src/routes/`
- Add new models in `prisma/schema.prisma`
- Update OpenAPI docs in `openapi.yaml`

## License

MIT
