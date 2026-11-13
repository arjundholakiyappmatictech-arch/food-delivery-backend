# Laravel Engineering Handbook

> **A central, production-grade knowledge base establishing reusable software architecture, API contracts, database engineering, and AI-assisted workflows across modern Laravel applications.**

---

## 1. Mission & Philosophy

This engineering handbook is **not** documentation for any single product or application. It is the authoritative engineering standard designed to be reused across all current and future Laravel projects developed in our organization.

Modern Laravel applications move quickly. Without a shared engineering foundation, individual projects diverge in architectural patterns, error responses, database integrity, and validation styles. 

This handbook establishes:
* **Engineering Consistency:** Uniform folder structure, API contracts, controller responsibilities, and service boundaries.
* **Production Reliability:** Strict database transactions, concurrency guards, reversible migrations, and zero silent failures.
* **Type Safety & Maintainability:** Strict PHP 8.4 typing, Eloquent relationship signatures, and automated static analysis.
* **AI-Assisted Precision:** Standardized instructions and Model Context Protocol (MCP) workflows enabling AI assistants (such as Antigravity, Claude Code, and Cursor) to write accurate, idiomatic code without hallucinating patterns.

---

## 2. Version Support Matrix

The standards in this handbook are tested and verified against the following runtime baselines:

| Component | Minimum Supported | Recommended Baseline | Current Target |
| :--- | :--- | :--- | :--- |
| **PHP Runtime** | `8.2.x` | `8.3.x` | `8.4.x` (CLI / OPcache) |
| **Laravel Framework** | `11.x` | `12.x` | `13.x` (Bootstrap Application API) |
| **Testing Suite** | PHPUnit 11+ | Pest 3+ | Pest 4.x |
| **Code Style** | PSR-12 / PER-CS2 | Laravel Pint default | Laravel Pint (`preset: laravel`) |
| **Auth Protocol** | Sanctum 3+ | Sanctum 4+ | Laravel Sanctum / Passport |
| **AI Integration** | Manual Prompting | `laravel/mcp` v1.0+ | `laravel/boost` + Native MCP |

Where modern framework versions introduce cleaner syntax (such as Laravel 11+ `bootstrap/app.php`, model `casts()` methods, and route-based schedule definitions), the handbook adopts modern conventions while explaining backwards compatibility where applicable.

---

## 3. Standards Classification System

Every recommendation throughout this handbook is strictly categorized into one of five classification tiers:

```
┌────────────────────────────────────────────────────────────────────────┐
│ 1. Official Laravel Convention                                         │
│    Built directly into Laravel documentation and framework core.        │
├────────────────────────────────────────────────────────────────────────┤
│ 2. Widely Accepted PHP Engineering Standard                           │
│    PHP-FIG PSRs (PSR-12, PSR-4), PER-CS, SOLID principles, type safety.│
├────────────────────────────────────────────────────────────────────────┤
│ 3. Approved Engineering Standard (Our Organization)                    │
│    Mandatory conventions we enforce across all our repositories.       │
├────────────────────────────────────────────────────────────────────────┤
│ 4. Optional Architectural Pattern                                      │
│    Patterns (e.g. Repositories, DTOs, CQRS) with explicit trade-offs.  │
├────────────────────────────────────────────────────────────────────────┤
│ 5. Project-Specific Conventions                                        │
│    Domain logic belonging solely to an individual application.         │
└────────────────────────────────────────────────────────────────────────┘
```

> [!IMPORTANT]
> **Cardinal Rule:** Never present an optional pattern as an official Laravel convention, and never bleed project-specific domain rules into global standards.

---

## 4. Handbook Directory Map

The handbook is structured into focused modules for human developers and AI assistants:

```
laravel-engineering-handbook/
├── README.md                           # This document: Overview, vision & navigation
├── GUIDELINES.md                       # Canonical rulebook for AI agents & developers
├── CHANGELOG.md                        # Semantic version history of standards
├── CONTRIBUTING.md                     # Process for proposing changes & ADRs
│
├── 01-fundamentals/                    # [ACTIVE] PHP 8.4 types, SOLID, language baselines
├── 02-application-architecture/        # [ACTIVE] Layer boundaries, DI, exact project directory map
├── 03-api-engineering/                 # [ACTIVE] 2-verb routing, Form Requests, API Resources
├── 04-business-logic/                  # [ROADMAP] Decoupled Services, Actions, AppException hierarchy
├── 05-database-engineering/            # [ROADMAP] Migrations, Eloquent relations, indexing, transactions
├── 06-code-quality/                    # [ROADMAP] Pint styling, Larastan analysis, code review rubric
├── 07-security-performance/            # [ROADMAP] Sanctum auth, Policies, webhooks, caching, secrets
├── 08-testing-quality-assurance/       # [ROADMAP] Pest testing, feature tests, service mocks
├── 09-ai-engineering/                  # [ROADMAP] AI development workflow, Laravel Boost, MCP tools
├── 10-reusable-templates/              # [ROADMAP] Reference templates & stubs (Markdown specs)
├── 11-references/                      # [ROADMAP] Official Laravel docs, ecosystem links, tooling
├── 12-research/                        # [ACTIVE] Codebase discovery reports (RES-001) & ADRs (ADR-001)
└── 13-project-integration/             # [ROADMAP] Adopting the handbook across other Laravel projects
```

---

## 5. How to Use This Handbook

### For Human Developers
1. **Starting a New Feature:** Read the relevant section in [`02-application-architecture/`](02-application-architecture/README.md) or [`03-api-engineering/`](03-api-engineering/README.md) before writing controllers or service classes.
2. **Reviewing Pull Requests:** Use [`02-application-architecture/01-layer-responsibilities.md`](02-application-architecture/01-layer-responsibilities.md) and [`01-fundamentals/02-solid-in-laravel.md`](01-fundamentals/02-solid-in-laravel.md) as objective evaluation rubrics.
3. **Architecture Decisions:** Consult [`12-research/README.md`](12-research/README.md) to review ratified ADRs.

### For AI Coding Assistants (Antigravity, Claude Code, Cursor, Codex)
1. **Entry Point:** Ingest root [`AGENTS.md`](../../AGENTS.md), which serves as the canonical pointer to [`GUIDELINES.md`](GUIDELINES.md).
2. **Mandatory First Read:** Always read [`GUIDELINES.md`](GUIDELINES.md) first to load organizational guardrails into memory.
3. **Inspect Before Changing:** Read the target project's `composer.json` to identify exact Laravel and PHP versions.
4. **No Speculation:** Never invent classes, methods, or database columns not already defined in the codebase.
5. **Clean Decoupling:** Keep business logic pure; never couple domain service classes to global HTTP request or session state.

---

## 6. Maintenance & Governance

* **Location:** `backend/laravel-engineering-handbook`
* **Current Version:** `v1.0.1-draft`
* **Maintainer:** Senior Laravel Engineering Team
* **License:** Internal Engineering Standard

