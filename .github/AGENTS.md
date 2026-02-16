# AuthKit — Custom Copilot Agents & Skills

This directory contains custom GitHub Copilot agents and skill instruction files tailored for the AuthKit monorepo.

## Requirements

- **VS Code** ≥ 1.106
- **GitHub Copilot** extension with an active subscription (Free, Pro, or Enterprise)
- `github.copilot.chat.codeGeneration.useInstructionFiles` set to `true` in VS Code settings

## Directory Structure

```
.github/
├── agents/                          # Custom Copilot agent definitions
│   ├── authkit.agent.md             # Primary coding assistant (orchestrator)
│   ├── planner.agent.md             # Feature/refactor planning agent
│   ├── security-reviewer.agent.md   # OWASP-focused security auditor
│   ├── test-generator.agent.md      # Test generation specialist
│   ├── template-scaffolder.agent.md # Template creation/extension agent
│   ├── api-designer.agent.md        # OpenAPI schema designer
│   └── code-reviewer.agent.md       # Code quality reviewer
├── instructions/                    # Skill instruction files (auto-applied by glob)
│   ├── typescript-templates.instructions.md
│   ├── python-templates.instructions.md
│   ├── java-templates.instructions.md
│   ├── csharp-templates.instructions.md
│   ├── openapi-standards.instructions.md
│   ├── testing-standards.instructions.md
│   └── cli-development.instructions.md
├── copilot-instructions.md          # Global workspace instructions
└── AGENTS.md                        # This file
```

## Agents

| Agent                   | Purpose                                                  | Tools                        | Edits Files? |
| ----------------------- | -------------------------------------------------------- | ---------------------------- | :----------: |
| **AuthKit**             | Primary coding assistant — develop, debug, maintain      | Full toolkit                 |     Yes      |
| **Planner**             | Generate implementation plans for features/refactors     | Read-only (search, fetch)    |      No      |
| **Security Reviewer**   | Audit code for OWASP vulnerabilities and auth weaknesses | Read-only (search, codebase) |      No      |
| **Test Generator**      | Generate comprehensive tests for all templates           | Full toolkit                 |     Yes      |
| **Template Scaffolder** | Create new templates or extend existing ones             | Full toolkit                 |     Yes      |
| **API Designer**        | Design and validate OpenAPI 3.1 schemas                  | Limited (search, edit)       |     Yes      |
| **Code Reviewer**       | Review code quality, SOLID adherence, conventions        | Read-only (search, codebase) |      No      |

## Agent Workflows (Handoffs)

Agents support seamless handoffs to transition between specialized tasks:

```
                    ┌──────────────┐
                    │   Planner    │
                    └──────┬───────┘
                           │ "Start Implementation"
                           ▼
┌─────────────┐    ┌──────────────┐    ┌───────────────────┐
│ API Designer│◄───│   AuthKit    │───►│ Template Scaffolder│
└─────────────┘    └──────┬───────┘    └───────────────────┘
                          │
              ┌───────────┼───────────┐
              ▼           ▼           ▼
    ┌──────────────┐ ┌──────────┐ ┌──────────────┐
    │Security Rev. │ │Test Gen. │ │ Code Reviewer│
    └──────────────┘ └──────────┘ └──────────────┘
```

### Example Workflow: New Feature

1. **Plan** → Select the _Planner_ agent, describe the feature → Get a structured plan
2. **Implement** → Handoff to _AuthKit_ agent → Code the feature across templates
3. **Test** → Handoff to _Test Generator_ → Generate unit/integration tests
4. **Review** → Handoff to _Security Reviewer_ → Audit for vulnerabilities
5. **Review** → Handoff to _Code Reviewer_ → Check quality and conventions

## Skill Instructions

Instruction files are automatically applied based on `applyTo` glob patterns:

| Instruction File                       | Applies To                  | Purpose                               |
| -------------------------------------- | --------------------------- | ------------------------------------- |
| `typescript-templates.instructions.md` | `templates/**/*.ts,*.tsx`   | TS/Express/NestJS coding standards    |
| `python-templates.instructions.md`     | `templates/**/*.py`         | Python/FastAPI/Django/Flask standards |
| `java-templates.instructions.md`       | `templates/**/*.java`       | Java/Spring Boot standards            |
| `csharp-templates.instructions.md`     | `templates/**/*.cs`         | C#/ASP.NET Core standards             |
| `openapi-standards.instructions.md`    | `templates/**/openapi.yaml` | OpenAPI schema conventions            |
| `testing-standards.instructions.md`    | `templates/**/tests/**`     | Testing requirements and patterns     |
| `cli-development.instructions.md`      | `cli/**`                    | CLI development conventions           |

## Usage

### Select an Agent

1. Open Chat (Ctrl+Alt+I)
2. Click the agent dropdown at the top of the Chat view
3. Select one of the AuthKit custom agents

### Quick Access

Type `/agents` in the chat input to open the Configure Custom Agents menu.

### Example Prompts

**AuthKit Agent:**

> Add email verification via OTP to the Express template

**Planner Agent:**

> Plan adding OAuth2 social login (Google, GitHub) across all templates

**Security Reviewer Agent:**

> Review the FastAPI template's token refresh implementation

**Test Generator Agent:**

> Generate integration tests for the Spring Boot login and RBAC flows

**Template Scaffolder Agent:**

> Scaffold a new Go + Gin template following existing conventions

**API Designer Agent:**

> Design the OpenAPI schema for a new `/auth/2fa` endpoint

**Code Reviewer Agent:**

> Review the recent changes to the NestJS auth guard implementation

## MCP Servers

The workspace includes MCP server configurations in `.vscode/mcp.json`:

- **Context7** — Up-to-date library documentation
- **GitHub MCP** — GitHub API integration
- **Fetch** — Web page retrieval for research

## Customization

### Adding a New Agent

1. Create a new `.agent.md` file in `.github/agents/`
2. Define YAML frontmatter (name, description, tools, model, handoffs)
3. Write behavioral instructions in the Markdown body
4. The agent appears automatically in the agents dropdown

### Adding New Instructions

1. Create a new `.instructions.md` file in `.github/instructions/`
2. Set the `applyTo` glob pattern in the YAML frontmatter
3. Write coding standards in the Markdown body
4. Instructions are automatically applied when editing matching files

### Sharing Across Team

All agent and instruction files are in `.github/` and version-controlled, so they are shared with anyone who clones the repo.
