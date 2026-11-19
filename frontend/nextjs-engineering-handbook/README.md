# Next.js Frontend Engineering Handbook

> **The definitive architectural standard and coding blueprint for modern Next.js 16 + React 19 frontend applications consuming an external Laravel REST API.**

---

## 1. What This Handbook Does

This handbook is a centralized, reusable engineering guide. Instead of reinventing architecture for every project, it establishes a single, reliable way to build Next.js frontends:

* **Strictly Pure JavaScript:** 100% pure JavaScript (`.js`, `.jsx`). Zero TypeScript (`.ts`, `.tsx`), interfaces, or type annotations.
* **5-Tier Clean Architecture:** Deterministic flow from RSC Pages $\rightarrow$ Feature Containers $\rightarrow$ shadcn UI $\rightarrow$ TanStack Hooks $\rightarrow$ Axios Services.
* **Strict 2-Verb Laravel REST Contract:** Outbound communication is strictly `GET` and `POST`. Consumes the Laravel ADR-001 envelope (`response.data?.data`) and auto-maps 422 error bags.
* **Dual-Engine State Separation:** Server state exclusively in TanStack Query v5; client UI state in Zustand v5 with atomic selectors (`state => state.property`).
* **Pragmatic Fresh-by-Default Caching:** Default `staleTime: 0`. Blanket caching is forbidden; transactional data is never cached.
* **AI-Ready Precision:** Serves as the ground truth for AI coding assistants (Antigravity, Cursor, Claude Code, Codex) to eliminate hallucinations and architectural drift.

---

## 2. Ten Unbreakable Architectural Invariants

1. **Strictly JavaScript:** Pure JavaScript (`.js`, `.jsx`) only. Zero TypeScript (`.ts`, `.tsx`), interfaces, or type annotations.
2. **Frontend Scope:** Next.js 16 is strictly a presentation layer. All business logic and databases live in Laravel.
3. **5-Tier Data Flow:** Page (RSC) $\rightarrow$ Feature Container (Client) $\rightarrow$ shadcn UI $\rightarrow$ TanStack Hook $\rightarrow$ Axios Service. Never call Axios directly inside JSX.
4. **State Separation:** Server state exclusively in TanStack Query. Client UI state in Zustand with atomic selectors (`state => state.property`). Forms in React Hook Form + Zod. Zero `useEffect` for data fetching or derived state.
5. **Fresh by Default (`staleTime: 0`):** No blanket caching. Transactional data (Cart, Orders, Addresses, Checkout, Profile) is never cached. Opt-in caching only for static reference data (categories/tags).
6. **UI Components & Controls:** shadcn/ui patterns (`components/ui/*.jsx`) with `lucide-react` icons and controls. Class composition using `cn()` utility (`clsx` + `tailwind-merge`).
7. **2-Verb HTTP & ADR-001:** Strictly `GET` and `POST` (no `PUT`, `PATCH`, `DELETE`). Unwrap `response.data?.data`. Auto-map Laravel 422 errors to form fields via `mapLaravelErrorsToForm()`.
8. **TkDodo Query Key Factory:** Centralized query key factory per feature (`featureKeys`). Hardcoded string query keys are forbidden.
9. **React 19 & Compiler:** No manual `useMemo` or `useCallback` boilerplate. Push `'use client'` down to leaves. Keep root pages as React Server Components (RSC).
10. **Flat & Version-Agnostic Structure:** Keep components, stores, and hooks flat (no `v2/` folders). API version prefixes belong strictly in `NEXT_PUBLIC_API_URL` or isolated in Tier 5 service endpoints.

---

## 3. Module Quick Links

All 10 topic modules are active, complete, and production-ready:

1. **[01-fundamentals/](01-fundamentals/README.md):** Pure JavaScript standards, JSDoc autocomplete, React 19 Compiler automated memoization, async transitions.
2. **[02-frontend-architecture/](02-frontend-architecture/README.md):** 5-Tier data flow, dumb UI separation, smart container pattern, universal directory structure.
3. **[03-api-consumer-layer/](03-api-consumer-layer/README.md):** Centralized Axios client, universal Bearer interceptor, mandatory AbortSignal cancellation, ADR-001 envelope unwrapping.
4. **[04-server-state-tanstack-query/](04-server-state-tanstack-query/README.md):** TkDodo query key factories (`featureKeys`), fresh-by-default caching, mutation lifecycles, and optimistic update safeguards.
5. **[05-client-state-and-forms/](05-client-state-and-forms/README.md):** Zustand v5 atomic selectors, state mirroring prohibition, React Hook Form + Zod v4, zero `useEffect` for derived values.
6. **[06-routing-and-ux/](06-routing-and-ux/README.md):** App Router RSC vs. Client boundaries, Next.js 16 `await params`, Route Groups, layout-matching skeletons, client auth guards.
7. **[07-styling-and-design-system/](07-styling-and-design-system/README.md):** shadcn/ui pure JS primitives, `cn()` composition, cva variants, polymorphic `asChild` slots, exclusive `lucide-react` iconography.
8. **[08-performance-and-assets/](08-performance-and-assets/README.md):** Next.js `<Image />` optimization, CLS elimination, remotePatterns, dynamic code splitting via `next/dynamic`, barrel file ban.
9. **[09-testing-and-quality/](09-testing-and-quality/README.md):** On-demand testing workflow, React Testing Library + Vitest, user-centric queries, MSW v2 network contract mocking.
10. **[10-research-and-adrs/](10-research-and-adrs/README.md):** Frontend ADR-001-F (Response Envelope), ADR-002-F (Query Key Factory), and autonomous AI agent rules and guardrails.
