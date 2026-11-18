# Laravel Engineering Handbook

> **The definitive architectural standard and coding blueprint for modern Laravel applications.**

---

## 1. What This Handbook Does

This handbook is a centralized, reusable engineering guide. Instead of reinventing architecture for every project, it establishes a single, reliable way to build Laravel backends:

* **Ultra-Thin Controllers & Safe Transactions:** Controllers coordinate requests and manage database transactions (`DB::beginTransaction()`, `DB::commit()`, `DB::rollBack()`).
* **Decoupled Business Logic:** Flat services (`app/Services/`) focus purely on business rules without transaction wrappers or HTTP state (`Auth::user()` is forbidden in services).
* **Deterministic API Contracts:** Strict 2-verb routing (`GET`/`POST`) and unified JSON responses ([ADR-001](10-research/adr/ADR-001-unified-api-response-envelope.md)).
* **Database & Concurrency Safety:** Foreign key protection (`restrictOnDelete()`), pessimistic locking (`lockForUpdate()`), and method-based `casts(): array`.
* **AI-Ready Precision:** Serves as the ground truth for AI coding assistants (Antigravity, Cursor, Claude Code) to prevent code hallucinations.

---

## 2. How to Use It in Any Project

### For Developers
1. **Quick Reference:** Read [GUIDELINES.md](GUIDELINES.md) for approved code signatures (Controllers, Form Requests, Services, Resources).
2. **Building Features:** Follow the 5-tier pipeline: `FormRequest` $\rightarrow$ `Controller` $\rightarrow$ `Domain Service` $\rightarrow$ `API Resource` $\rightarrow$ `Pest Feature Test`.
3. **Reviewing Code:** Use the 5-point review rubric in [06-code-quality](06-code-quality/README.md) to evaluate PRs before merging.

### For AI Coding Assistants
* Reference [`backend/AGENTS.md`](../AGENTS.md) (or root [`AGENTS.md`](../../AGENTS.md)) as the canonical entry point.
* Custom architecture rules sit at the top of `AGENTS.md` pointing to [GUIDELINES.md](GUIDELINES.md), while preserving existing Laravel Boost guidelines below.
* The agent reads [GUIDELINES.md](GUIDELINES.md) first to load company invariants into memory.

### For Adopting in a New Project
1. **Copy Handbook:** Copy the `laravel-engineering-handbook/` folder into your repository.
2. **Configure AGENTS.md:** Add the custom architecture rules to the top of your `AGENTS.md` (e.g., [`backend/AGENTS.md`](../AGENTS.md)) pointing to `GUIDELINES.md`, while keeping existing framework and tool guidelines intact.
3. **Format & Verify:** Format with Laravel Pint (`vendor/bin/pint --format agent`) and verify static types with Larastan Level 8.

---

## 3. Module Quick Links

All 10 modules are active and production-ready:

1. **[01-fundamentals/](01-fundamentals/README.md):** PHP 8.4 typing, enums in `casts(): array`, exhaustive `match()`, pragmatic SOLID.
2. **[02-application-architecture/](02-application-architecture/README.md):** 6 backend layers, flat `app/Services/`, no artificial folders (`DTOs/`, `Repositories/`).
3. **[03-api-engineering/](03-api-engineering/README.md):** 2-verb routing (`GET`/`POST`), array validation, `$this->whenLoaded()` guarded resources.
4. **[04-business-logic/](04-business-logic/README.md):** Pure services, `User $user` injection, transaction pre-flights, typed domain exceptions (`100–599`).
5. **[05-database-engineering/](05-database-engineering/README.md):** `restrictOnDelete()` safety, `lockForUpdate()` concurrency, method-based `casts()`.
6. **[06-code-quality/](06-code-quality/README.md):** Laravel Pint, Larastan Level 8, 5-point Invariant Review Rubric.
7. **[07-security-and-performance/](07-security-and-performance/README.md):** Webhook HMAC SHA256 verification, `->afterCommit()` cache safety, Sanctum decoupling.
8. **[08-testing-and-quality-assurance/](08-testing-and-quality-assurance/README.md):** Pest feature tests, strict `postJson()` testing, external-only gateway mocking (`Http::fake()`).
9. **[09-ai-engineering/](09-ai-engineering/README.md):** Laravel MCP tools delegating to flat domain services, exception shielding.
10. **[10-research/](10-research/README.md):** Real-world discovery report (RES-001) & official response envelope standard (ADR-001).
