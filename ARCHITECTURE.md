# AuthKit Architecture

## Repository Folder Structure

```
AuthKit/
├── cli/                  # Source code for the native CLI
├── templates/            # All language/framework templates
│   ├── typescript-express/
│   ├── typescript-nestjs/
│   ├── python-fastapi/
│   ├── python-django/
│   ├── python-flask/
│   ├── java-springboot/
│   └── csharp-aspnetcore/
├── docs/                 # Documentation (including this file)
├── scripts/              # Utility scripts for development/CI
├── .github/              # GitHub workflows and issue templates
├── CONTRIBUTING.md
├── README.md
└── ARCHITECTURE.md
```

---

## Template Structure (per template)

```
template-root/
├── src/                  # Source code (controllers, services, models, etc.)
├── tests/                # Unit and integration tests
├── .env.example          # Example environment variables
├── docker-compose.yml    # (Optional) Dev environment
├── README.md             # Template-specific usage
├── openapi.yaml          # API schema (Swagger/OpenAPI)
├── scripts/              # DB migrations, seeders, etc.
└── ...                   # Framework/ORM-specific files
```

---

## Feature Scope for Each Template

### Common Features (All Templates)

- Full authentication flow: register, verify email, login, refresh, reset password, logout
- JWT access (15min) + refresh tokens (7d) with rotation & reuse detection
- Constant-time login to prevent user enumeration
- BCrypt/Argon2id password hashing
- Role-Based Access Control (User/Admin/Moderator)
- Rate limiting on all auth endpoints
- Swagger/OpenAPI docs
- (Optional) Docker Compose for PostgreSQL + MailHog
- Unit and integration tests
- Linting and CI config

### TypeScript (Express.js + Prisma)

- Zod validation for all inputs
- Argon2 password hashing
- Async error handling middleware
- Prisma ORM integration
- Modular route/controller structure
- Environment-based config

### TypeScript (NestJS + TypeORM)

- Decorators for validation and DI
- Guards for RBAC and auth
- Passport.js integration for strategies
- TypeORM for DB
- DTOs and service layer
- Global exception filters

### Python (FastAPI + SQLAlchemy 2.x async)

- Pydantic v2 for validation
- Async/await throughout
- SQLAlchemy 2.x async ORM
- Dependency injection via FastAPI
- Background tasks for email
- OpenAPI auto-generation

### Python (Django + Django ORM)

- Class-based views
- Django built-in admin
- Django ORM
- Custom user model
- Signals for email verification
- Django settings for config

### Python (Flask + SQLAlchemy)

- Explicit routing and control
- Flask-SQLAlchemy ORM
- WTForms or Marshmallow for validation
- Blueprint modularity
- Flask-Mail for email

### Java (Spring Boot + Spring Data JPA)

- Spring Security filter chain
- @PreAuthorize for RBAC
- Spring Data JPA ORM
- DTOs and service layer
- Exception handling via @ControllerAdvice
- Configuration via application.properties/yaml

### C# (ASP.NET Core + EF Core)

- Built-in rate limiting (ASP.NET Core 8+)
- EF Core ORM
- Minimal APIs or Controllers
- .NET 8 records for DTOs
- DataAnnotations for validation
- Dependency injection
- Appsettings.json for config

---

## Other Architectural Decisions

- **Monorepo**: All templates and CLI live in a single repository for discoverability and shared tooling.
- **Native CLI**: Written in a cross-platform language (e.g., Go, Rust) and distributed as binaries.
- **Template Isolation**: Each template is self-contained, with its own dependencies, tests, and documentation.
- **Extensibility**: New templates can be added by creating a new folder under `templates/` and registering it with the CLI.
- **Security**: All templates implement OWASP Top 10 mitigations and are reviewed for security best practices.
- **Testing**: Each template must include unit and integration tests for all critical auth flows.
- **CI/CD**: Linting, tests, and security checks run on every PR via GitHub Actions.
- **Documentation**: Each template has its own README and API docs; global docs live in `/docs`.
- **Optional Docker**: Docker Compose is provided for dev convenience but not required for SDK/CLI use.

---

For further details, see each template's README and the main project README.
