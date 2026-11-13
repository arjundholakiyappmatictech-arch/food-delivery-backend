# Changelog

All notable changes to the **Laravel Engineering Handbook** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.1-draft] - 2026-11-12

### Added
- **Module 01 (Core Fundamentals & Language Standards):**
  - Authored `01-fundamentals/README.md` defining language baselines and role in backend reliability.
  - Authored `01-fundamentals/01-php-typing-and-modern-syntax.md` detailing strict types, constructor property promotion, match expressions, and backed enums.
  - Authored `01-fundamentals/02-solid-in-laravel.md` defining pragmatic SOLID implementation across controllers, services, and domain exceptions.
- **Module 02 (Application Architecture & Layer Boundaries):**
  - Authored `02-application-architecture/README.md` establishing end-to-end request lifecycle and unidirectional data flow.
  - Authored `02-application-architecture/01-layer-responsibilities.md` defining strict separation of concerns across the 6 backend layers and code review checklist.
  - Authored `02-application-architecture/02-dependency-injection-and-container.md` codifying constructor auto-wiring, singleton vs. transient lifecycles, and approved facade usage.
  - Authored `02-application-architecture/03-directory-structure-and-organization.md` codifying our lean, real-world project directory map and banning artificial enterprise bloat.
- **Module 03 (API Engineering):**
  - Authored `03-api-engineering/README.md` establishing API lifecycle architecture and navigation.
  - Authored `03-api-engineering/01-routing-conventions.md` detailing the 2-verb model (`GET`/`POST`), versioning, and action suffixes.
  - Authored `03-api-engineering/02-form-requests-and-validation.md` covering array syntax, contextual ownership validation, and policy authorization.
  - Authored `03-api-engineering/03-api-resources.md` detailing N+1 prevention via `whenLoaded()`, explicit type casting, and ADR-001 integration.
- **ADR-001 (Unified API Response Envelope Specification):**
  - Ratified formal Architecture Decision Record at `12-research/adr/ADR-001-unified-api-response-envelope.md`.
  - Codified the backend JSON Schema response envelope specification.

### Changed
- **Pragmatic SOLID Architecture (01-fundamentals/02-solid-in-laravel.md):**
  - Codified mandatory enforcement of **S, O, L, and I**.
  - Codified team decision to defer speculative **DIP interfaces** in favor of direct concrete constructor injection for single-provider services, preserving 1-click IDE navigation (`Ctrl + Click`) and avoiding interface bloat.
- **Response Format Invariants (GUIDELINES.md):**
  - Codified strict backend requirement that `data` MUST be `null` on error (prohibiting `"data": []` empty arrays that cause schema type mutations).
  - Codified requirement that `message` is mandatory across ALL responses, including HTTP 422 validation errors.
  - Standardized granular field validation errors as an associative map (`array<string, array<string>>`) on 422 responses alongside top-level `message`.

---

## [1.0.0-draft] - 2026-11-07

### Added
- **Foundation Structure:**
  - Established root handbook structure at `backend/laravel-engineering-handbook/`.
  - Authored central `README.md` establishing mission, version compatibility matrix, and navigation.
  - Authored canonical `GUIDELINES.md` summarizing golden rules, mandatory standards vs. forbidden anti-patterns, and AI pair-programming guardrails.
  - Authored `CONTRIBUTING.md` defining standard ADR and revision processes.
- **Research & Discovery:**
  - Authored `12-research/01-food-delivery-discovery.md` documenting comprehensive audit of `E:\food-delivery-backend\backend`.
  - Identified 14 major architectural findings covering Routing, Validation, Response Envelopes, Exceptions, Services, Transactions, Migrations, Eloquent typing, Listeners, and AI MCP integration.
  - Established strict boundary separating reusable global engineering standards from food-delivery domain logic.

### Changed
- **API Design Alignment (Team Standard):**
  - Updated Section 2 and Section 3.A of `GUIDELINES.md` to enforce the 2-verb HTTP model: `GET` for data retrieval (`index`, `show`) and `POST` for all state mutations (`store`, `update`, `destroy`, and custom actions).
  - Explicitly specified standard CRUD URL action suffixes (`/store`, `/{id}/update`, `/{id}/destroy`) while permitting descriptive custom names for domain actions (`/{id}/cancel`, `/{id}/verify`).
  - Enforced `v1` URL prefixing across all API routes while removing the requirement for route `name()` attributes.
- **Response Envelope Alignment (Company Standard):**
  - Updated Section 2 and Section 3.C of `GUIDELINES.md` to enforce the company's JSON envelope standard: `"is_error": false|true`, `"data": ...`, `"message": "..."`.
- **Exception Handling Alignment (Team Standard):**
  - Updated Section 2 and Section 3.A of `GUIDELINES.md` to enforce the controller-level `try / catch (Throwable $e)` pattern delegating to Base Controller `handleException($e)`.
  - Established the separation between custom domain exceptions (extending `AppException`) and predefined system exceptions (`ModelNotFoundException`, `QueryException`, `AuthorizationException`), keeping `bootstrap/app.php` completely untouched.
- **Service Context Alignment (Team Standard):**
  - Updated Section 2 and Section 3.D of `GUIDELINES.md` to require explicitly passing the acting user as `User $user` to all service methods, avoiding global `Auth::user()` coupling and enforcing `$user` parameter naming.
- **Database & Queue Integrity Standards:**
  - Enforced isolating external HTTP APIs outside `DB::transaction()` boundaries to prevent connection exhaustion.
  - Standardized `->afterCommit()` chaining and `public bool $afterCommit = true;` on transactional Queue Job classes.
  - Mandated strict return types on all Eloquent relationships and method-based `protected function casts(): array`.
  - Required complete, reversible `down()` methods in all migrations and enforced `restrictOnDelete()` / Soft Deletes over `cascadeOnDelete()` for financial/order records.
  - Prohibited double-queuing in event listeners; standardized on synchronous listeners dispatching queued jobs or dedicated queued listeners.

