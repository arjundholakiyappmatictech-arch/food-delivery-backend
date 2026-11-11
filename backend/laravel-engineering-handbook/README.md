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
├── 01-fundamentals/                    # PHP 8.4 types, Laravel core concepts, SOLID
├── 02-application-architecture/        # Directory organization, dependency injection, layers
├── 03-api-engineering/                 # REST URIs, versioning, Form Requests, Resources
├── 04-business-logic/                  # Decoupled Services, Actions, DTOs, custom exceptions
├── 05-database-engineering/            # Migrations, Eloquent relations, indexing, transactions
├── 06-code-quality/                    # Pint styling, Larastan analysis, code review rubric
├── 07-security-performance/            # Sanctum auth, Policies, webhooks, caching, secrets
├── 08-testing-quality-assurance/       # Pest testing, feature tests, service mocks
├── 09-ai-engineering/                  # AI development workflow, Laravel Boost, MCP tools
├── 10-reusable-templates/              # Production-ready stubs (Controllers, Requests, Tests)
├── 11-references/                      # Official Laravel docs, ecosystem links, tooling
├── 12-research/                        # Codebase discovery reports, ADRs, version research
└── 13-project-integration/             # Adopting the handbook across other Laravel projects
```

---

## 5. How to Use This Handbook

### For Human Developers
1. **Starting a New Feature:** Read the relevant section in `03-api-engineering/` or `04-business-logic/` before writing controllers or service classes.
2. **Reviewing Pull Requests:** Use `06-code-quality/03-code-review-checklist.md` as an objective evaluation checklist.
3. **Database Schema Changes:** Review `05-database-engineering/02-database-design-migrations.md` to guarantee safe foreign keys, reversible migrations, and performance indexing.

### For AI Coding Assistants (Antigravity, Claude Code, Cursor)
1. **Mandatory First Read:** Always read [`GUIDELINES.md`](GUIDELINES.md) first to load organizational guardrails into memory.
2. **Inspect Before Changing:** Read the target project's `composer.json` to identify exact Laravel and PHP versions.
3. **No Speculation:** Never invent classes, methods, or database columns not already defined in the codebase.
4. **Clean Decoupling:** Keep business logic pure; never couple domain service classes to global HTTP request or session state.

---

## 6. Maintenance & Governance

* **Canonical Location:** `E:\food-delivery-backend\backend\laravel-engineering-handbook`
* **Current Version:** `v1.0.0-draft`
* **Maintainer:** Senior Laravel Engineering Lead
* **License:** Internal Engineering Standard

