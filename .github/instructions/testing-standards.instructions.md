---
applyTo: "templates/**/tests/**,templates/**/*.test.*,templates/**/*.spec.*,templates/**/test_*"
---

# Testing Standards for AuthKit Templates

## General Principles

- **Arrange-Act-Assert** pattern for all tests
- **Isolated tests** — each test manages its own setup and teardown
- **No shared mutable state** between tests
- **Descriptive names** that explain the scenario and expected outcome
- **Coverage target** ≥ 80% for auth-critical code paths

## Required Test Scenarios

### Registration

- Valid registration returns 201 with user data (no password hash)
- Duplicate email returns 409
- Missing required fields returns 400 with field-level errors
- Invalid email format returns 400
- Weak password returns 400

### Email Verification

- Valid token verifies user
- Expired token returns 401
- Invalid token returns 401
- Already-verified user returns appropriate response

### Login

- Valid credentials return access + refresh tokens
- Invalid password returns 401 (generic message, no user enumeration)
- Non-existent user returns 401 (same response timing as invalid password)
- Unverified user returns 403

### Token Refresh

- Valid refresh token returns new access + refresh tokens
- Expired refresh token returns 401
- Reused refresh token triggers reuse detection (invalidate all tokens)
- Missing refresh token returns 400

### Password Reset

- Request reset sends email (verify side effect)
- Valid reset token allows password change
- Expired reset token returns 401
- New password is hashed correctly

### Logout

- Token added to blacklist
- Blacklisted token rejected on subsequent requests

### RBAC

- User can access user-level endpoints
- User cannot access admin endpoints (403)
- Admin can access admin endpoints
- Role changes take effect immediately

### Rate Limiting

- Requests within limit succeed
- Requests exceeding limit return 429
- Rate limit resets after window

## Test Data

- Use factory functions or fixtures for test users
- Password for test users: `TestPassword123!` (never in production)
- Use unique emails per test: `test-{uuid}@example.com`
- Clean up test data in teardown/afterEach hooks
