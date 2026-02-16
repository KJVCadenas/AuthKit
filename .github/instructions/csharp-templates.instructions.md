---
applyTo: "templates/**/*.cs"
---

# C# (ASP.NET Core) Template Coding Standards

## General

- Target .NET 8+ (LTS)
- Use `record` types for DTOs
- Use nullable reference types (`<Nullable>enable</Nullable>`)
- Follow Microsoft C# coding conventions

## ASP.NET Core + EF Core

- Minimal APIs or Controller-based (prefer Controllers for auth endpoints)
- Built-in rate limiting middleware (ASP.NET Core 8+)
- EF Core with code-first migrations
- Dependency injection via `IServiceCollection`
- Configuration via `appsettings.json` with environment overrides
- Global exception handling middleware

## JWT Implementation [OWASP:A2]

```csharp
// Configure in Program.cs
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Secret"]!))
        };
    });
```

## Error Handling Pattern [OWASP:A6]

```csharp
// Use Problem Details (RFC 7807)
public class AppException : Exception
{
    public int StatusCode { get; }
    public string ErrorCode { get; }

    public AppException(string message, int statusCode = 500, string errorCode = "INTERNAL_ERROR")
        : base(message)
    {
        StatusCode = statusCode;
        ErrorCode = errorCode;
    }
}
```

## Password Hashing [OWASP:A3]

```csharp
// Use BCrypt.Net-Next or Microsoft.AspNetCore.Identity
using BCrypt.Net;

public string HashPassword(string password) =>
    BCrypt.Net.BCrypt.HashPassword(password, workFactor: 12);

public bool VerifyPassword(string password, string hash) =>
    BCrypt.Net.BCrypt.Verify(password, hash);
```

## Rate Limiting [OWASP:A4]

```csharp
// Built-in rate limiting in ASP.NET Core 8+
builder.Services.AddRateLimiter(options =>
{
    options.AddFixedWindowLimiter("auth", limiterOptions =>
    {
        limiterOptions.PermitLimit = 10;
        limiterOptions.Window = TimeSpan.FromMinutes(1);
        limiterOptions.QueueLimit = 0;
    });
});
```

## Naming Conventions

- Namespaces: `AuthKit.<Template>.<Feature>`
- Classes: `PascalCase` (e.g., `AuthController`)
- Methods: `PascalCase` (e.g., `VerifyEmailAsync`)
- Properties: `PascalCase` (e.g., `AccessToken`)
- Private fields: `_camelCase` (e.g., `_tokenService`)
- Constants: `PascalCase` (e.g., `MaxLoginAttempts`)
- DTOs: `record` with suffix `Request` / `Response`
