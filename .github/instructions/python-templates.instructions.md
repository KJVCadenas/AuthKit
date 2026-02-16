---
applyTo: "templates/**/*.py"
---

# Python Template Coding Standards

## General

- Target Python 3.11+
- Use type hints on all function signatures
- Use `pathlib.Path` over `os.path`
- Prefer f-strings for string formatting
- Follow PEP 8 style guide (enforced via Flake8 / Ruff)

## FastAPI (SQLAlchemy 2.x async) Templates

- Pydantic v2 models for request/response validation
- Async/await throughout — no sync database calls
- SQLAlchemy 2.x async session with `async_sessionmaker`
- Dependency injection via `Depends()` for DB sessions, auth, etc.
- Background tasks for non-blocking operations (email sending)
- Auto-generated OpenAPI docs at `/docs`

## Django (Django ORM) Templates

- Custom user model extending `AbstractUser`
- Class-based views (CBVs) for CRUD operations
- Django REST Framework serializers for validation
- Signals for side effects (email verification triggers)
- Settings split: `base.py`, `development.py`, `production.py`

## Flask (SQLAlchemy) Templates

- Blueprint modularity — one blueprint per feature domain
- Marshmallow schemas for validation
- Flask-SQLAlchemy for ORM integration
- Flask-Mail for transactional email
- Application factory pattern (`create_app()`)

## Password Hashing [OWASP:A3]

```python
# FastAPI / Flask — use passlib with bcrypt or argon2
from passlib.context import CryptContext
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

# Django — configure in settings
PASSWORD_HASHERS = [
    "django.contrib.auth.hashers.Argon2PasswordHasher",
    "django.contrib.auth.hashers.BCryptSHA256PasswordHasher",
]
```

## Error Handling Pattern

```python
# Use explicit exception classes
class AuthError(Exception):
    def __init__(self, message: str, status_code: int = 401, code: str = "AUTH_ERROR"):
        self.message = message
        self.status_code = status_code
        self.code = code
        super().__init__(self.message)
```

## Naming Conventions

- Files/modules: `snake_case.py`
- Classes: `PascalCase`
- Functions/variables: `snake_case`
- Constants: `ALL_CAPS`
- Private members: prefix with `_`
