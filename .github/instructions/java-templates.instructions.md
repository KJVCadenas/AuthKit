---
applyTo: "templates/**/*.java"
---

# Java (Spring Boot) Template Coding Standards

## General

- Target Java 17+ (LTS)
- Use `record` types for DTOs where appropriate
- Use `Optional<T>` for nullable return types — never return `null` from service methods
- Follow standard Java naming conventions

## Spring Boot + Spring Data JPA

- Spring Security filter chain for authentication
- `@PreAuthorize` annotations for RBAC on controller methods
- Spring Data JPA repositories (extend `JpaRepository`)
- DTOs for API boundaries — never expose entity classes directly
- Service layer between controllers and repositories
- `@ControllerAdvice` with `@ExceptionHandler` for global error handling
- Configuration via `application.yml` with Spring profiles

## JWT Implementation [OWASP:A2]

```java
// Use jjwt library
@Component
public class JwtTokenProvider {
    @Value("${jwt.secret}")
    private String secret;

    public String generateAccessToken(UserDetails user) {
        return Jwts.builder()
            .setSubject(user.getUsername())
            .setIssuedAt(new Date())
            .setExpiration(new Date(System.currentTimeMillis() + 900_000)) // 15 min
            .signWith(Keys.hmacShaKeyFor(secret.getBytes()), SignatureAlgorithm.HS256)
            .compact();
    }
}
```

## Error Handling Pattern [OWASP:A6]

```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErrorResponse> handleAuthError(AuthenticationException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            .body(new ErrorResponse("AUTH_ERROR", ex.getMessage()));
    }
}
```

## Password Hashing [OWASP:A3]

```java
@Bean
public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder(12); // Cost factor ≥ 12
}
```

## Naming Conventions

- Packages: `com.authkit.<template>.<feature>`
- Classes: `PascalCase` (e.g., `AuthController`)
- Methods/variables: `camelCase` (e.g., `verifyEmail()`)
- Constants: `ALL_CAPS` (e.g., `MAX_LOGIN_ATTEMPTS`)
- DTOs: suffix with `Request` / `Response` (e.g., `LoginRequest`, `TokenResponse`)
