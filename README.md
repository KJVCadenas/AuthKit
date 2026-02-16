# AuthKit

A multi-language authentication backend scaffolding toolkit for rapid, secure, and production-ready project bootstrapping.

## Overview

AuthKit enables developers from TypeScript, Python, Java, and C# backgrounds to quickly scaffold robust authentication backends using best practices and idioms of each ecosystem. All templates are maintained in a single repository and are designed for easy integration with popular ORMs and databases.

---

## Supported Languages, Frameworks, and ORMs

| Language   | Framework    | ORM             | Key Features                           |
| ---------- | ------------ | --------------- | -------------------------------------- |
| TypeScript | Express.js   | Prisma          | Zod validation, argon2, async errors   |
| TypeScript | NestJS       | TypeORM         | Decorators, DI, guards, Passport       |
| Python     | FastAPI      | SQLAlchemy 2.x  | Pydantic v2, async/await throughout    |
| Python     | Django       | Django ORM      | Class-based views, built-in admin      |
| Python     | Flask        | SQLAlchemy      | Lightweight, explicit control          |
| Java       | Spring Boot  | Spring Data JPA | Security filter chain, @PreAuthorize   |
| C#         | ASP.NET Core | EF Core         | Built-in rate limiting, .NET 8 records |

---

## Features

- **Full Auth Flow**: Register → Verify Email → Login → Refresh → Reset Password → Logout
- **JWT Auth**: Access (15min) + Refresh (7d) tokens, rotation & reuse detection
- **Constant-Time Login**: Prevents user enumeration [OWASP:A2]
- **Password Hashing**: BCrypt/Argon2id [OWASP:A3]
- **RBAC**: User / Admin / Moderator roles
- **Rate Limiting**: On all auth endpoints [OWASP:A4]
- **Swagger/OpenAPI**: API documentation
  **Docker Compose (optional)**: Included in generated templates for PostgreSQL + MailHog (dev email UI)

3. **(Optional) Run with Docker Compose**:

If your generated project includes a `docker-compose.yml`, you can quickly start a dev environment:

```sh
docker compose up --build
```

> **Note:** AuthKit ships as a native CLI (not an npm or pip package). Download the binary or build from source, then run directly from your terminal. Docker Compose is only included in generated templates for convenience and is not required to use the CLI/SDK itself.

---

## Usage

1. **Install CLI** (coming soon)
2. **Scaffold a project:**

```sh
authkit init
```

When you run `authkit init`, you'll see an interactive menu:

```
Choose from the available templates:

| No. | Language   | Framework    | ORM             | Key Features                           |
|-----|------------|--------------|-----------------|----------------------------------------|
| >1. | TypeScript | Express.js   | Prisma          | Zod validation, argon2, async errors   |
|  2. | TypeScript | NestJS       | TypeORM         | Decorators, DI, guards, Passport       |
|  3. | Python     | FastAPI      | SQLAlchemy 2.x  | Pydantic v2, async/await throughout    |
|  4. | Python     | Django       | Django ORM      | Class-based views, built-in admin      |
|  5. | Python     | Flask        | SQLAlchemy      | Lightweight, explicit control          |
|  6. | Java       | Spring Boot  | Spring Data JPA | Security filter chain, @PreAuthorize   |
|  7. | C#         | ASP.NET Core | EF Core         | Built-in rate limiting, .NET 8 records |

↑ - Navigate up
↓ - Navigate down
Enter - Confirm template
```

> **Note:** AuthKit ships as a native CLI (not an npm or pip package). Download the binary or build from source, then run directly from your terminal.

3. **Run with Docker Compose**:

```sh
docker compose up --build
```

4. **Access API docs**: Visit `/docs` (Swagger/OpenAPI)

---

## Security, Design, and Accessibility

- **Security**: Implements OWASP Top 10 mitigations (A1–A10) in each template. Constant-time login, secure password storage, rate limiting, and JWT best practices.
- **Design**: SOLID principles applied per language [SOLID:SRP, O/C, LSP, ISP, DI].
- **Accessibility**: API docs and UIs meet WCAG 2.1 AA [WCAG:2.1.1, 2.4.7].

---

## Testing & CI

- **Unit/Integration Tests**: Each template includes tests for auth flows and security features.
- **Accessibility Tests**: For API docs and UIs.
- **CI Example**:
  ```yaml
  # .github/workflows/ci.yml
  name: CI
  on: [push, pull_request]
  jobs:
    test:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v3
        - name: Set up Node.js
          uses: actions/setup-node@v3
          with:
            node-version: "20"
        - name: Install dependencies
          run: npm ci
        - name: Lint
          run: npm run lint
        - name: Test
          run: npm test
        - name: Security Audit
          run: npm audit --audit-level=high || true
  ```
- **Linting**: Each template ships with language-appropriate lint configs (e.g., ESLint, Flake8, Checkstyle, dotnet analyzers).

---

## Contributing

- See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.
- All changes require security review and SAST for sensitive areas.

---

## License

MIT

---

## Attributions

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [WCAG 2.1](https://www.w3.org/WAI/standards-guidelines/wcag/)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)

---

## Quickstart

1. Download or build the AuthKit CLI binary for your platform.
2. Scaffold a new project:

```sh
./authkit create --lang typescript --framework express --orm prisma
```

3. (Optional) If your generated project includes a `docker-compose.yml`, start the dev environment:

```sh
docker compose up --build
```

4. Access API docs at `/docs` in your running service.

> **Note:** The CLI is a native binary, not an executable package. Docker Compose is only included in generated templates for convenience and is not required to use the CLI/SDK itself. See Usage above.

---

## Summary Table

| Mitigation/Principle | Tag          |
| -------------------- | ------------ |
| Security             | OWASP:A1–A10 |
| Design               | SOLID        |
| Accessibility        | WCAG 2.1 AA  |
| Testing              | Unit/CI      |
| CI                   | GitHub CI    |
| Linting              | Per-template |

---

For questions or support, open an issue or discussion in this repo.
