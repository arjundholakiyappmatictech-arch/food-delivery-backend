# Repository Agent Instructions

> **Canonical Entry Point for AI Coding Assistants (Antigravity, Cursor, Claude Code, Codex).**

Before reading, writing, refactoring, documenting, or reviewing code in this repository, you must strictly adhere to the designated domain architecture and standards:

---

## 1. Backend Instructions (Laravel)
* **Primary Backend Instructions:** [`backend/AGENTS.md`](backend/AGENTS.md)
* **Master Rulebook:** [`backend/laravel-engineering-handbook/GUIDELINES.md`](backend/laravel-engineering-handbook/GUIDELINES.md)

### Core Backend Invariants
1. **Primary Rulebook:** Always inspect and follow [`backend/laravel-engineering-handbook/GUIDELINES.md`](backend/laravel-engineering-handbook/GUIDELINES.md).
2. **HTTP Routing:** Enforce the strict 2-verb model (`GET` for fetching, `POST` for all mutations including `/store`, `/{id}/update`, `/{id}/destroy`, and custom descriptive actions). `PUT`, `PATCH`, and `DELETE` are strictly forbidden.
3. **Response Envelope:** All API responses must follow ADR-001 (`is_error: bool`, `message: string`, `data: mixed|null`, and `errors: object` on 422). On error, `data` is strictly `null` (never `[]`).
4. **Domain Decoupling & Transactions:** Controllers manage transactions at the HTTP boundary (`DB::beginTransaction()`, `DB::commit()`, and `DB::rollBack()` in the single catch block). Services remain strictly focused on business logic without managing transactions. Controllers remain ultra-thin (<15 lines for mutations; zero business logic). Never call `Auth::user()` inside domain services—always inject the acting `User $user` entity explicitly.
5. **Architectural Purity & Versioning:** Mirror the existing Laravel directory structure. Do not introduce artificial folders (`DTOs/`, `Repositories/`, `Actions/`). Flat `app/Services/`.
6. **Code Safety & Fast Execution:** Never invent database columns or relationships. Use Boost MCP tools (`database-schema`) when writing queries.
7. **Transaction Safety, Concurrency & Data Integrity:** Execute external HTTP API calls outside transactions. Dispatch jobs using `->afterCommit()`. Apply `lockForUpdate()` inside domain services on records vulnerable to race conditions.

---

## 2. Frontend Instructions (Next.js)
* **Primary Frontend Instructions:** [`frontend/AGENTS.md`](frontend/AGENTS.md)
* **Master Rulebook:** [`frontend/nextjs-engineering-handbook/GUIDELINES.md`](frontend/nextjs-engineering-handbook/GUIDELINES.md)

### Core Frontend Invariants
1. **Strictly JavaScript:** Write pure JavaScript (`.js`, `.jsx`) only. Never write TypeScript (`.ts`, `.tsx`), interfaces, or type annotations.
2. **Frontend-Only Scope:** Next.js 16 is strictly a presentation layer. No Route Handlers (`app/api/**`) doing backend work, and no Server Actions connecting to databases. All business logic lives in Laravel.
3. **5-Tier Data Flow:** Page (RSC) $\rightarrow$ Feature Container (Client) $\rightarrow$ shadcn UI $\rightarrow$ TanStack Hook $\rightarrow$ Axios Service. Never call Axios directly inside JSX components.
4. **State Separation:** Server state exclusively in **TanStack Query v5**; Client UI state in **Zustand v5** with atomic selectors (`state => state.property`); Forms in **React Hook Form + Zod v4**. Zero `useEffect` for data fetching or derived state.
5. **Pragmatic Caching (Fresh by Default):** Default `staleTime: 0` on all queries. Blanket caching everywhere is forbidden. Transactional data (Cart, Orders, Addresses, Checkout) is **never** cached. Opt-in caching only for static reference data (categories/cuisines).
6. **UI Components & Controls:** Use **shadcn/ui** patterns (`components/ui/*.jsx`) with **`lucide-react`** exclusively for all icons and controls. Class composition using `cn()` utility (`clsx` + `tailwind-merge`).
7. **Laravel Contract & 2-Verb Alignment:** Strictly 2-verb HTTP (`GET` and `POST` only; `PUT`, `PATCH`, `DELETE` are forbidden). Unify with Laravel ADR-001 envelope: unwrap `response.data?.data`. Map 422 errors automatically to forms using `mapLaravelErrorsToForm()`.
8. **TkDodo Query Key Factory:** Every query hook must define a centralized query key factory (`featureKeys`). Hardcoded string query keys are forbidden.
9. **React 19 & Compiler Optimization:** No manual `useMemo` or `useCallback` boilerplate; `babel-plugin-react-compiler` handles memoization. Push `'use client'` down to leaves. Keep root pages as React Server Components (RSC).
10. **Flat & Version-Agnostic Structure:** Keep components, stores, and hooks flat (no `v2/` folders). API version prefixes belong strictly in `NEXT_PUBLIC_API_URL` or isolated in Tier 5 service endpoints.
