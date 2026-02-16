# Copilot Instructions for AuthKit

## Project Overview

- **AuthKit** is a monorepo for scaffolding secure, production-ready authentication backends in TypeScript, Python, Java, and C#.
- All templates (per language/framework) are under `templates/` and are self-contained with their own source, tests, and docs.
- The native CLI (not npm/pip) is the entry point for generating/scaffolding projects.

## Key Architectural Patterns

- **JWT Auth**: Access (15min) + Refresh (7d) tokens, with rotation & reuse detection. See ARCHITECTURE.md for details.
- **Full Auth Flow**: Register, verify email, login, refresh, reset password, logout.
- **RBAC**: User/Admin/Moderator roles implemented in all templates.
- **Security**: All templates implement OWASP Top 10 mitigations (see ARCHITECTURE.md and README.md).
- **Testing**: Each template includes unit/integration tests for all critical flows.
- **CI/CD**: Lint, test, and security checks run on every PR (see .github/workflows/ci.yml in generated projects).

## Developer Workflows

- **Scaffold a project**: Run `authkit init` and follow the interactive prompts.
- **Run dev environment**: If present, use `docker compose up --build` in the generated project.
- **Access API docs**: Visit `/docs` in the running service (Swagger/OpenAPI).
- **Testing**: Use the language/framework's standard test runner in each template's `tests/` directory.
- **Linting**: Each template includes language-appropriate lint configs (ESLint, Flake8, etc.).

## Conventions & Patterns

- **Template Isolation**: No cross-template dependencies; each is standalone.
- **Extensibility**: Add new templates by creating a new folder under `templates/` and registering with the CLI.
- **Sensitive Config**: Never hardcode secrets; use environment variables and `.env.example`.
- **Docs**: Each template has its own README and OpenAPI schema; global docs live in `/docs`.

## Key Files & Directories

- `ARCHITECTURE.md`: High-level design, security, and template structure.
- `templates/`: All language/framework templates.
- `cli/`: Source for the native CLI.
- `docs/`: Global documentation.
- `scripts/`: Utility scripts for dev/CI.

## Example: Adding a New Template

1. Create a new folder under `templates/` (e.g., `templates/go-gin/`).
2. Follow the structure in ARCHITECTURE.md.
3. Add tests, lint config, and docs.
4. Register the template with the CLI.

## References

- See `README.md` and `ARCHITECTURE.md` for more details and up-to-date practices.
- For security/design tags, see the summary table in `README.md`.
