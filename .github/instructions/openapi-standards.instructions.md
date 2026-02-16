---
applyTo: "templates/**/openapi.yaml,templates/**/openapi.yml"
---

# OpenAPI Schema Standards

## Version

- Use OpenAPI 3.1.0 specification

## Required Sections

- `info` with title, description, version, and contact
- `servers` with localhost (dev) and configurable base URL
- `paths` with all auth endpoints fully documented
- `components/schemas` with reusable request/response models
- `components/securitySchemes` with JWT Bearer definition
- `tags` for logical grouping

## Auth Endpoints to Document

All templates must document these endpoints:

1. `POST /auth/register` — User registration
2. `POST /auth/verify-email` — Email verification
3. `POST /auth/login` — User login
4. `POST /auth/refresh` — Token refresh
5. `POST /auth/reset-password` — Request password reset
6. `PUT /auth/reset-password` — Complete password reset
7. `POST /auth/logout` — User logout
8. `GET /users/me` — Get current user profile
9. `GET /users` — List users (Admin only)
10. `PUT /users/:id/role` — Update user role (Admin only)

## Schema Conventions

- Use descriptive property names matching the code DTOs
- Include `example` values for all properties
- Use `format` for emails, dates, UUIDs
- Set `minLength` / `maxLength` for strings
- Mark `required` fields explicitly
- Never include password hashes in response schemas

## Error Schema

```yaml
ErrorResponse:
  type: object
  required: [error]
  properties:
    error:
      type: object
      required: [code, message]
      properties:
        code:
          type: string
          example: "VALIDATION_ERROR"
        message:
          type: string
          example: "Invalid email format"
        details:
          type: array
          items:
            type: object
            properties:
              field:
                type: string
              message:
                type: string
```
