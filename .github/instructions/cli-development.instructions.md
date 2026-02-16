---
applyTo: "cli/**"
---

# CLI Development Standards

## Overview

The AuthKit CLI is a native cross-platform binary (Go or Rust) that scaffolds authentication project templates.

## Core Commands

- `authkit init` — Interactive template selection and project scaffolding
- `authkit create --lang <language> --framework <framework> --orm <orm>` — Non-interactive scaffolding
- `authkit list` — List available templates
- `authkit version` — Show CLI version

## CLI Conventions

- Use structured error messages with exit codes
- Support both interactive (TTY) and non-interactive (CI) modes
- Use environment variables for configuration override
- Provide `--verbose` / `--quiet` flags for output control
- Color output when TTY is detected, plain text otherwise
- Follow semantic versioning for releases

## Template Registration

When adding a new template:

1. Add metadata to the template registry
2. Include language, framework, ORM, and key features
3. Add validation for required dependencies
4. Test both interactive and non-interactive scaffolding paths

## Distribution

- Build binaries for Linux (amd64, arm64), macOS (amd64, arm64), Windows (amd64)
- Use GitHub Releases for distribution
- Provide checksums for verification
- No runtime dependencies required (static binary)
