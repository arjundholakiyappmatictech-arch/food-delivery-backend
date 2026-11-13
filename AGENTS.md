# Agent Instructions

> **Canonical Entry Point for AI Coding Assistants (Antigravity, Cursor, Claude Code, Codex).**

Before writing, refactoring, documenting, or reviewing any backend code in this repository, you must strictly adhere to our project architecture and standards:

1. **Primary Rulebook:** Always inspect and follow [`backend/laravel-engineering-handbook/GUIDELINES.md`](backend/laravel-engineering-handbook/GUIDELINES.md).
2. **HTTP Routing:** Enforce the strict 2-verb model (`GET` for fetching, `POST` for all mutations including `/store`, `/{id}/update`, `/{id}/destroy`, and custom descriptive actions). `PUT`, `PATCH`, and `DELETE` are strictly forbidden.
3. **Response Envelope:** All API responses must follow ADR-001 (`is_error: bool`, `message: string`, `data: mixed|null`, and `errors: object` on 422). On error, `data` is strictly `null` (never `[]`).
4. **Domain Decoupling:** Controllers must remain ultra-thin (<15 lines). Never call `Auth::user()` inside domain services—always inject the acting `User $user` entity explicitly.
5. **Architectural Purity:** Mirror the existing Laravel directory structure. Do not introduce artificial folders (`DTOs/`, `Repositories/`, `Actions/`) unless explicitly instructed.
6. **Code Safety:** Never invent database columns, relationships, or framework methods. Always inspect the active codebase, models, and migrations first.

