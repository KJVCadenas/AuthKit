# Copilot Instructions for AuthKit

## Project Overview

**AuthKit** is a monorepo for scaffolding secure, production-ready authentication backends in 7 language/framework combinations (TypeScript/Express, TypeScript/NestJS, Python/FastAPI, Python/Django, Python/Flask, Java/Spring Boot, C#/ASP.NET Core). All templates under `templates/` are self-contained, isolated, and use consistent authentication patterns. The native Go CLI is the entry point for scaffolding.

## Critical Architecture Decisions

### Monorepo + Isolated Templates

- Each template is **completely independent** — no cross-template dependencies or shared utils.
- When making changes (e.g., adding a feature), you must **replicate the pattern across all 7 templates**.
- Templates are **discovered dynamically** by the CLI (`internal/templates.go`) by scanning `templates/` and parsing README.md metadata.
- Templates follow **identical database schema patterns** across all ORMs:
  - `User` model with `id`, `email`, `password`, `name`, `role` (enum: USER/ADMIN/MODERATOR), `emailVerified`, timestamps
  - `RefreshToken` model with `id`, `userId`, `createdAt`, `revoked` for token rotation & reuse detection
  - `VerificationToken` model with `id`, `userId`, `token`, `type` (email/password-reset), `expiresAt` for email verification and password resets

### JWT Authentication Flow [OWASP:A2]

- **Access Token**: 15-minute expiration, short-lived, used for authenticated requests
- **Refresh Token**: 7-day expiration, rotated on each refresh, includes reuse detection to invalidate all tokens if replayed
- Both tokens contain user ID and role; refresh token also tracks a rotation ID for reuse detection
- Example: `authService.generateTokens(user)` returns `{ accessToken, refreshToken }`

### OWASP + Security by Design

All templates implement these mitigations:

- [A2] Password hashing with Argon2id (memory cost ≥65536) or BCrypt
- [A2] Constant-time login comparisons to prevent user enumeration
- [A3] Environment variables for secrets (never hardcode API keys, DB passwords, JWT secrets)
- [A4] Rate limiting on all auth endpoints (15 min window, 100 reqs limit in Express; scale per framework)
- [A7] Input validation with schemas (Zod in TypeScript, Pydantic in Python, annotations/Spring validation in Java)

### Environment Configuration

Every template has a `.env.example` showing required variables:

```
DATABASE_URL=postgresql://...
JWT_SECRET=...
JWT_REFRESH_SECRET=...
EMAIL_SERVICE_API_KEY=...
CORS_ORIGIN=...
```

Never hardcode these; always read from `process.env`, `os.environ`, or equivalent.

## Common Development Patterns

### Express.js (Prisma)

- Routes: `src/routes/auth.ts` → Controllers: `src/controllers/authController.ts` → Services: `src/services/authService.ts`
- Validation: Zod schemas for request bodies
- Error handling: Async middleware wrapper for error propagation
- Password: Argon2id via `argon2` package
- Testing: Jest with Supertest for HTTP assertions

### NestJS (TypeORM)

- Controllers with decorators (@Post, @UseGuards)
- DTOs with `class-validator` decorators
- Guards for auth and RBAC (@UseGuards(AuthGuard, RoleGuard))
- Global exception filter for consistent errors
- Services layer with dependency injection

### Python Templates (FastAPI, Django, Flask)

- FastAPI: Pydantic v2 models, async/await, dependency injection via function parameters
- Django: Class-based views, custom User model, Django ORM, signals for email verification
- Flask: Blueprints for modularity, Marshmallow or WTForms for validation, Flask-SQLAlchemy
- All use `bcrypt` or `argon2` for password hashing

### Java (Spring Boot)

- Security filter chain with `@PreAuthorize` for RBAC
- DTOs with `@NotBlank` and other validation annotations
- Spring Data JPA for ORM
- `@ControllerAdvice` for global exception handling

### C# (ASP.NET Core)

- Minimal APIs or Controllers (choose one per template)
- DataAnnotations for validation
- EF Core for ORM
- Built-in rate limiting (ASP.NET Core 8+)
- .NET 8 records for immutable DTOs

## Required Test Scenarios

Every template must test:

1. **Registration**: Valid (201), duplicate email (409), missing fields (400), weak password (400)
2. **Email Verification**: Valid token (200), expired (401), invalid (401), already verified (appropriate response)
3. **Login**: Valid credentials (tokens returned), invalid password (401), non-existent user (401 with same timing), unverified user (403)
4. **Token Refresh**: Valid refresh (new tokens), expired (401), reused refresh (all tokens invalidated), missing (400)
5. **Password Reset**: Request sends email, valid token allows change, expired (401), new password hashed correctly
6. **Logout**: Token blacklisted, subsequent requests rejected
7. **RBAC**: User ↔ admin/user endpoints (403 for unauthorized), role changes take effect immediately
8. **Rate Limiting**: Within limit (success), exceeds limit (429), resets after window

Use **Arrange-Act-Assert** pattern; no shared mutable state; test names describe the scenario and expectation.

## Developer Workflows

### Building & Testing a Template

```bash
# TypeScript (Express/NestJS)
npm run dev          # Start dev server (ts-node-dev)
npm test             # Run Jest tests
npm run lint         # ESLint check
npm run build        # Compile to JavaScript

# Python
python -m pytest     # Run tests (FastAPI, Django, Flask)
flask run            # Start Flask dev server
python manage.py runserver  # Django dev server
uvicorn main:app --reload   # FastAPI dev server

# Java
mvn spring-boot:run  # Start Spring Boot
mvn test             # Run tests
mvn clean package    # Build JAR

# C#
dotnet run           # Start web server
dotnet test          # Run tests
dotnet build         # Compile
```

### Running Dev Environment (All Templates)

If a template includes `docker-compose.yml`:

```bash
docker compose up --build
```

This starts PostgreSQL and MailHog (dev email UI at http://localhost:1025). Set `DATABASE_URL` and `EMAIL_SERVICE` env vars accordingly.

### Adding a Feature to All 7 Templates

1. Implement in one template (e.g., express-prisma) with tests
2. Replicate the **logic and structure** (not syntax) to all 6 others, adapting for language idioms
3. Ensure each template has equivalent test coverage
4. Update OpenAPI/API docs in each template's `openapi.yaml`
5. Test all 7: `npm test`, `pytest`, `mvn test`, `dotnet test`

## Convention Conflicts & Resolution

When a feature conflicts with framework conventions, **prefer framework idioms** over cross-template consistency. Example: Django uses class-based views; don't force a service-layer pattern that Django doesn't use natively.

## CLI Development

- Located in `cli/` (Go + Cobra CLI framework)
- `internal/templates.go`: Discovers templates by scanning `templates/` directory; parses README.md for metadata
- `cmd/init.go`, `cmd/list.go`, `cmd/info.go`: Core commands for scaffolding, listing, and template info
- Both interactive (TTY) and non-interactive (CI) modes supported
- When adding a new template: register in CLI template registry and ensure README.md has proper metadata (frontmatter or title/description lines)

## Key Files & Directories

- **ARCHITECTURE.md**: Full design, template structure, feature scope per language
- **README.md**: Feature table, quick start, how to run, testing/CI overview
- **.github/AGENTS.md**: Custom Copilot agents (Planner, Security Reviewer, Test Generator, etc.) — reference for specialized tasks
- **templates/**: 7 production-ready auth backends, each with `src/`, `tests/`, `openapi.yaml`, `.env.example`
- **cli/**: Go CLI source for scaffolding
- **.github/instructions/**: Language/framework-specific coding standards (auto-applied by VS Code Copilot)

## Quick Decision Matrix

| Task                    | Approach                                                                      | File(s)                                    |
| ----------------------- | ----------------------------------------------------------------------------- | ------------------------------------------ |
| Add auth feature        | Implement in one template, replicate to all 6 with language idioms            | `*/src/services/authService.*`, `*/tests/` |
| Update API schema       | Edit each template's `openapi.yaml` to match changes                          | `templates/*/openapi.yaml`                 |
| Add test scenario       | Add to all 7 templates' test suites                                           | `templates/*/tests/`                       |
| New template            | Create folder under `templates/`, follow ARCHITECTURE.md, add metadata to CLI | `templates/{name}/`                        |
| Fix security issue      | Patch all 7 templates, coordinate across frameworks                           | All `templates/`                           |
| Update validation rules | Change Zod/Pydantic/Spring validators across templates                        | `*/src/{validation,models,dto}/*`          |

## References

- **ARCHITECTURE.md**: Detailed design and template feature scope
- **README.md**: Feature matrix, security/design tags, quick start
- **.github/AGENTS.md**: Copilot agent definitions and workflows
- **.github/instructions/**: Per-language coding standards (apply to TypeScript/Python/Java/C# templates)
