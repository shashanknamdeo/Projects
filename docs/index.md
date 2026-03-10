# Repository Architecture

This repository is organized as a **monorepo** containing multiple independent projects. Each project follows a standardized structure:

```
ProjectName/
├── README.md       # Project overview and setup instructions
├── LICENSE         # Legal protection
├── docs/           # Architecture diagrams, specs, and guides
└── <source>/       # Project-specific source code
```

## Projects

| Folder | Project | Domain |
|--------|---------|--------|
| `HireIQ/` | Automated Job Application Platform | Backend / AI / Automation |
| `IntelliTrade/` | AI-Powered Trading Analytics | FinTech / ML / Real-Time |
| `NeuroLearn/` | AI-Powered Study Assistant | EdTech / LLM / Full-Stack |
| `Snk/` | Mobile File Sync & Backup | Mobile / Cloud / AWS |
| `Gossipy/` | Voice-Based AI Chat App | Mobile / Voice AI / AWS |

## Conventions

- **Environment variables**: Each project uses `.env` files (not committed). See `.env.example` for templates.
- **Virtual environments**: Python projects use `PythonVirtualEnvironment/` (gitignored).
- **Dependencies**: Node projects use `node_modules/` (gitignored). See `package.json` for deps.
