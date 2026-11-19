# AI Agent Rules & Engineering Guardrails

> **Canonical operational instructions for AI coding assistants (Antigravity, Cursor, Claude Code, Codex) working within the Next.js frontend codebase.**

---

## 1. Prime Directive

Before generating, editing, or refactoring code in the frontend repository, AI agents must strictly abide by the core architectural invariants defined in [`nextjs-engineering-handbook/GUIDELINES.md`](../GUIDELINES.md).

Never violate these rules to implement shortcuts, and never introduce unauthorized technologies (TypeScript, raw Axios calls in JSX, or Next.js Route Handlers).

---

## 2. Invariant Enforcement & Decision Matrix

| Domain | AI Agent Standard | Forbidden Action |
| :--- | :--- | :--- |
| **Language** | 100% pure JavaScript (`.js`, `.jsx`). | Writing TypeScript (`.ts`, `.tsx`), interfaces, or type annotations. |
| **Backend Boundaries** | Next.js is strictly a presentation layer. Laravel owns all domain logic. | Writing Route Handlers (`app/api/**`) or Server Actions querying databases. |
| **Data Transport** | 5-Tier Data Flow: Page $\rightarrow$ Container $\rightarrow$ UI $\rightarrow$ Hook $\rightarrow$ Service. | Calling `api.get()` or `api.post()` directly inside JSX components. |
| **API Contract** | Match backend endpoints (`GET`/`POST`). Unwrap `response.data?.data`. | Inventing unrouted methods; returning raw Axios wrappers. |
| **Server State** | Centralized `featureKeys` factory with TanStack Query v5. Default `staleTime: 0`. | Hardcoded string query keys (`['items']`); blanket caching on transactional data. |
| **Client UI State** | Zustand v5 with atomic selectors (`state => state.property`). | Destructuring entire stores; mirroring server state into stores. |
| **Forms** | React Hook Form + pure JS Zod v4. Map 422 errors via `mapLaravelErrorsToForm()`. | Manual `useState` form inputs; writing TypeScript types for schemas. |
| **UI Components** | Pure JS shadcn/ui primitives (`components/ui/*.jsx`) + `lucide-react`. | Importing heavy UI libraries; mixing icon sets; raw inline `<svg>` dumps. |
| **Navigation & RSC** | Keep root `page.js` as RSC. Next.js 16 `await params`. Imports from `next/navigation`. | Synchronous `params` access; legacy `next/router` imports; client root pages. |
| **Testing** | Strictly on-demand: focus 100% on building features first. | Generating test files or running test suites unprompted. |

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
