# Next.js Frontend Engineering Handbook

> **Architectural rules and standards for Next.js applications consuming an external Laravel REST API.**

---

## Quick Navigation

* **Master Guidelines & Code Signatures:** [`GUIDELINES.md`](GUIDELINES.md)
* **Frontend Agent Instructions:** [`../AGENTS.md`](../AGENTS.md)

---

## Ten Unbreakable Architectural Invariants

1. **Strictly JavaScript:** Pure JavaScript (`.js`, `.jsx`) only. Zero TypeScript (`.ts`, `.tsx`), interfaces, or type annotations.
2. **Frontend Scope:** Next.js 16 is strictly a presentation layer. All business logic and databases live in Laravel.
3. **5-Tier Data Flow:** Page (RSC) $\rightarrow$ Feature Container (Client) $\rightarrow$ shadcn UI $\rightarrow$ TanStack Hook $\rightarrow$ Axios Service. Never call Axios directly inside JSX.
4. **State Separation:** Server state exclusively in TanStack Query. Client UI state in Zustand with atomic selectors (`state => state.property`). Forms in React Hook Form + Zod. Zero `useEffect` for data fetching.
5. **Fresh by Default (`staleTime: 0`):** No blanket caching. Transactional data (Cart, Orders, Addresses, Checkout) is never cached. Opt-in caching only for static reference data (categories/cuisines).
6. **UI Components & Controls:** shadcn/ui patterns (`components/ui/*.jsx`) with `lucide-react` icons and controls. Class composition using `cn()` utility (`clsx` + `tailwind-merge`).
7. **2-Verb HTTP & ADR-001:** Strictly `GET` and `POST` (no `PUT`, `PATCH`, `DELETE`). Unwrap `response.data?.data`. Auto-map Laravel 422 errors to form fields via `mapLaravelErrorsToForm()`.
8. **TkDodo Query Key Factory:** Centralized query key factory per feature (`featureKeys`). Hardcoded string query keys are forbidden.
9. **React 19 & Compiler:** No manual `useMemo` or `useCallback` boilerplate. Push `'use client'` down to leaves. Keep root pages as React Server Components (RSC).
10. **Flat & Version-Agnostic Structure:** Keep components, stores, and hooks flat (no `v2/` folders). API version prefixes belong strictly in `NEXT_PUBLIC_API_URL` or isolated in Tier 5 service endpoints.
