# Agent Instructions

> **Canonical Entry Point for AI Coding Assistants (Antigravity, Cursor, Claude Code, Codex).**

Before writing, refactoring, documenting, or reviewing any backend code in this repository, you must strictly adhere to our project architecture and standards:

1. **Primary Rulebook:** Always inspect and follow [`backend/laravel-engineering-handbook/GUIDELINES.md`](backend/laravel-engineering-handbook/GUIDELINES.md).
2. **HTTP Routing:** Enforce the strict 2-verb model (`GET` for fetching, `POST` for all mutations including `/store`, `/{id}/update`, `/{id}/destroy`, and custom descriptive actions). `PUT`, `PATCH`, and `DELETE` are strictly forbidden.
3. **Response Envelope:** All API responses must follow ADR-001 (`is_error: bool`, `message: string`, `data: mixed|null`, and `errors: object` on 422). On error, `data` is strictly `null` (never `[]`).
4. **Domain Decoupling:** Controllers must remain ultra-thin (typically <15 lines for mutations, up to ~20 lines for paginated/filtered queries purely for coordination; zero business logic permitted). Never call `Auth::user()` inside domain services—always inject the acting `User $user` entity explicitly.
5. **Architectural Purity & Versioning:** Mirror the existing Laravel directory structure. Do not introduce artificial folders (`DTOs/`, `Repositories/`, `Actions/`). When versioning APIs (`v2`), isolate versioning strictly to the HTTP transport layer (`Controllers/V2/`, `Requests/V2/`, `Resources/V2/`); domain services (`app/Services/`) must remain strictly flat and version-agnostic.
6. **Code Safety & Fast Execution:** Never invent database columns or relationships. Use Boost MCP tools (`database-schema`) when writing queries; do not perform speculative disk scouting when instructed to assume scaffolding or prototype.

