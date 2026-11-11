# Changelog

All notable changes to the **Laravel Engineering Handbook** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

