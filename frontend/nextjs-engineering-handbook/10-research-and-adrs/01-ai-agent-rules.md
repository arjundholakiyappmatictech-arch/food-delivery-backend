# AI Agent Rules & Engineering Guardrails

> **Canonical operational instructions for AI coding assistants (Antigravity, Cursor, Claude Code, Codex) working within the Next.js frontend codebase.**

---

## 1. Prime Directive

Before generating, editing, or refactoring code in the frontend repository, AI agents must strictly abide by the 10 Core Architectural Invariants. 

Never violate these rules to implement shortcuts, and never introduce unauthorized technologies.

---

## 2. The 10 Inviolable Frontend Invariants

1. **Strictly JavaScript:** Write pure JavaScript (`.js`, `.jsx`) only. Never write TypeScript (`.ts`, `.tsx`), interfaces, generics, or type annotations.
2. **Frontend-Only Scope:** Next.js 16 is strictly a presentation layer. No Route Handlers (`app/api/**`) doing backend work, and no Server Actions connecting to databases. All business logic lives in Laravel.
3. **5-Tier Data Flow:** Page (RSC) $\rightarrow$ Feature Container (Client) $\rightarrow$ shadcn UI $\rightarrow$ TanStack Hook $\rightarrow$ Axios Service. Never call Axios directly inside JSX components.
4. **State Separation:** Server state exclusively in **TanStack Query v5**; Client UI state in **Zustand v5** with atomic selectors (`state => state.property`); Forms in **React Hook Form + Zod v4**. Zero `useEffect` for data fetching or derived state.
5. **Pragmatic Caching (Fresh by Default):** Default `staleTime: 0` on all queries. Blanket caching everywhere is forbidden. Transactional data (Cart, Orders, Addresses, Checkout, Profile) is **never** cached. Opt-in caching only for static reference data (categories/tags).
6. **UI Components & Controls:** Use **shadcn/ui** patterns (`components/ui/*.jsx`) with **`lucide-react`** exclusively for all icons and controls. Class composition using `cn()` utility (`clsx` + `tailwind-merge`).
7. **Laravel Contract & 2-Verb Alignment:** Strictly 2-verb HTTP (`GET` and `POST` only; `PUT`, `PATCH`, `DELETE` are forbidden). Unify with Laravel ADR-001 envelope: unwrap `response.data?.data`. Map 422 errors automatically to forms using `mapLaravelErrorsToForm()`.
8. **TkDodo Query Key Factory:** Every query hook must define a centralized query key factory (`featureKeys`). Hardcoded string query keys are forbidden.
9. **React 19 & Compiler Optimization:** No manual `useMemo` or `useCallback` boilerplate; `babel-plugin-react-compiler` handles memoization. Push `'use client'` down to leaves. Keep root pages as React Server Components (RSC).
10. **Flat & Version-Agnostic Structure:** Keep components, stores, and hooks flat (no `v2/` folders). API version prefixes belong strictly in `NEXT_PUBLIC_API_URL` or isolated in Tier 5 service endpoints.

---

## 3. Workflow Mandate: On-Demand Testing Only

> [!IMPORTANT]
> **Focus 100% on Feature Development First**
> During initial and active development, AI assistants must prioritize implementing clean features, rock-solid architecture, and polished UI.
> **Never generate test files (`*.test.jsx`), test suites, or execute test commands unless the user explicitly asks for testing.**

---

## 4. Operational Guardrails for AI Generation

### A. Code Generation Guardrails
* **No Speculative Types:** When creating Zod schemas, do not write `z.infer`. Stick to pure JavaScript schema definitions.
* **No Direct Axios Calls in JSX:** If a component needs to fetch or mutate data, verify that a Tier 4 TanStack Query hook and a Tier 5 service function exist first.
* **Always Forward `AbortSignal`:** When generating service functions, always declare `{ signal }` as a parameter and pass it into the Axios request options (`api.get('/items', { signal })`).
* **Atomic Zustand Consumption:** When consuming Zustand stores, never destructure the store (`const { prop } = useStore()`). Always write atomic selectors (`const prop = useStore((state) => state.prop)`).

### B. Route Segment Safety
* **Keep `page.js` as RSC:** Never mark root `page.js` with `'use client'`. Extract parameters via `const { id } = await params;` and pass them into the Client Component container.
* **App Router Navigation Only:** Always import `useRouter`, `usePathname`, and `useSearchParams` from `next/navigation`. Importing from `next/router` will crash the application and is strictly forbidden.
