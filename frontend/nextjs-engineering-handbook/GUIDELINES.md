# Next.js Frontend Engineering Guidelines

> **The definitive rulebook for modern Next.js applications consuming an external Laravel REST API.**

---

## 1. Technology Stack Matrix

* **Language:** Pure JavaScript (`.js`, `.jsx`). **Zero TypeScript (`.ts`, `.tsx`) or type annotations.**
* **Framework:** Next.js 16 + React 19 (App Router, React Compiler active).
* **Server State & API Calling:** TanStack React Query v5 (`@tanstack/react-query`).
* **HTTP Client:** Axios (`src/lib/api/api.js`).
* **Client UI State:** Zustand v5 with atomic selectors.
* **Forms & Validation:** React Hook Form + Zod v4 (`@hookform/resolvers/zod`).
* **UI Components & Icons:** shadcn/ui patterns (`components/ui/*.jsx`) + `lucide-react`.
* **Styling:** Tailwind CSS v4 + `cn()` utility (`clsx` + `tailwind-merge`).

---

## 2. Ten Unbreakable Architectural Invariants

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

---

## 3. Reference Signatures

### Query Key Factory & TanStack Hook (`hooks/queries/useAddresses.js`)
```javascript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAddresses, deleteAddress } from '@/services/addressService';

export const addressKeys = {
   all: ['addresses'],
   lists: () => [...addressKeys.all, 'list'],
   list: (filters) => [...addressKeys.lists(), { filters }],
   detail: (id) => [...addressKeys.all, 'detail', id],
};

export function useAddressesQuery(filters = {}) {
   return useQuery({
      queryKey: addressKeys.list(filters),
      queryFn: ({ signal }) => getAddresses(filters, signal),
      staleTime: 0, // Fresh by default
   });
}

export function useDeleteAddressMutation() {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: (id) => deleteAddress(id),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: addressKeys.lists() }),
   });
}
```

### API Service (`services/addressService.js`)
```javascript
import api from '@/lib/api/api';

export async function getAddresses(filters = {}, signal) {
   const response = await api.get('/addresses', { params: filters, signal });
   return response.data?.data ?? [];
}

export async function createAddress(payload, signal) {
   const response = await api.post('/addresses/store', payload, { signal });
   return response.data?.data;
}

export async function updateAddress(id, payload, signal) {
   const response = await api.post(`/addresses/${id}/update`, payload, { signal });
   return response.data?.data;
}

export async function deleteAddress(id, signal) {
   const response = await api.post(`/addresses/${id}/destroy`, {}, { signal });
   return response.data?.data;
}
```

### Zustand Store with Atomic Selectors (`lib/store/authStore.js`)
```javascript
import { create } from 'zustand';

export const useAuthStore = create((set) => ({
   token: null,
   user: null,
   setAuth: (token, user) => set({ token, user }),
   clearAuth: () => set({ token: null, user: null }),
}));

// Atomic Selectors:
export const useAuthToken = () => useAuthStore((s) => s.token);
export const useCurrentUser = () => useAuthStore((s) => s.user);
```

### Laravel 422 Error Mapper (`utils/formErrors.js`)
```javascript
export function mapLaravelErrorsToForm(laravelErrors, setError) {
   if (!laravelErrors || typeof setError !== 'function') return;

   Object.entries(laravelErrors).forEach(([field, messages]) => {
      const message = Array.isArray(messages) ? messages[0] : String(messages);
      setError(field, { type: 'server', message });
   });
}
```

---

## 4. Topic Modules Directory

Consult the handbook topic modules for in-depth specifications and architectural references:

### Active Modules

#### [01 - Fundamentals & Language Standards](01-fundamentals/README.md)
* **What it Does:** Enforces modern JavaScript (ESNext/JSX) standards, immutability patterns, root `@/` aliasing, and React 19 compiler optimization rules across all frontend code.
* **Child Specifications:** [01 - JavaScript Standards & Immutability](01-fundamentals/01-javascript-standards.md) | [02 - React 19 Compiler Invariants](01-fundamentals/02-react-19-compiler.md)
* **Actionable Directives for AI Agents:**
  * **Strictly JavaScript:** Write 100% pure JavaScript (`.js`, `.jsx`). Never write TypeScript (`.ts`, `.tsx`), interfaces, or inline type annotations (`: string`, `<T>`).
  * **JSDoc Type Hints:** Use lightweight JSDoc annotations (`@param`, `@returns`) on service methods and complex utility functions for IDE/AI autocomplete without build overhead.
  * **Strict Operators:** Always use strict equality (`===`, `!==`). Use optional chaining (`?.`) to prevent undefined crashes, and nullish coalescing (`??`) to avoid falsy zero bugs (`fee ?? 50`).
  * **Immutability:** Never mutate state or props in-place. Use spread (`...`), `.map()`, and `.filter()` for pure state transformations.
  * **Path Aliasing:** Use root `@/` aliasing (`@/components/...`, `@/services/...`) exclusively. Deep relative directory traversal (`../../..`) is forbidden.
  * **Compiler Invariants:** Manual `useCallback` and `useMemo` wrappers are forbidden; `babel-plugin-react-compiler` automatically memoizes pure components. Keep render functions pure and idempotent.
  * **Async Transitions:** Use React 19's `useTransition` for non-urgent background UI updates and async Action execution with automatic `isPending` state.

#### [02 - Frontend Architecture & 5-Tier Data Flow](02-frontend-architecture/README.md)
* **What it Does:** Defines the 5-tier pipeline, Single Responsibility Principle (SRP) per layer, smart vs. dumb component decoupling, and flat directory conventions.
* **Child Specifications:** [01 - 5-Tier Layer Responsibilities](02-frontend-architecture/01-layer-responsibilities.md) | [02 - Component Colocation](02-frontend-architecture/02-component-colocation.md) | [03 - Directory Structure & Organization](02-frontend-architecture/03-directory-structure-and-organization.md)
* **Actionable Directives for AI Agents:**
  * **5-Tier Execution:** Always adhere to: Page (RSC) $\rightarrow$ Feature Container (Client) $\rightarrow$ shadcn UI $\rightarrow$ TanStack Hook $\rightarrow$ Axios Service.
  * **Transport Shield:** Never call `api.get()` or `api.post()` inside JSX components; always route requests through TanStack Query hooks and API services.
  * **Leaf Boundaries:** Keep root `page.js` as Server Components (RSC); push `'use client'` down to interactive feature containers.
  * **Dumb UI Separation:** Presentational components (`components/ui/` or `*Item.jsx`) must remain pure: props in, JSX out. Never import stores or services into them.
  * **Flatness Invariant:** Never create versioned directories (`components/v2/`, `services/v2/`). All features remain flat and version-agnostic.

#### [03 - API Consumer Layer & Laravel Contracts](03-api-consumer-layer/README.md)
* **What it Does:** Configures the centralized Axios client, enforces the strict 2-verb HTTP communication model (`GET`/`POST`), guarantees request cancellation via `AbortSignal`, unwraps Laravel ADR-001 response envelopes, and normalizes 422 validation errors.
* **Child Specifications:** [01 - Axios Client Architecture](03-api-consumer-layer/01-axios-client.md) | [02 - ADR-001 Envelope & 2-Verb Model](03-api-consumer-layer/02-adr-001-envelope.md)
* **Actionable Directives for AI Agents:**
  * **Centralized Client:** All HTTP communication must go through `src/lib/api/api.js`. Ad-hoc Axios instances and raw `fetch()` calls are strictly forbidden.
  * **Strict 2-Verb Model:** Only use `GET` (for queries) and `POST` (for mutations: `/store`, `/{id}/update`, `/{id}/destroy`, and descriptive actions). `PUT`, `PATCH`, and `DELETE` are strictly forbidden.
  * **Response Unwrapping:** Tier 5 service functions must unwrap and return `response.data?.data`. Never leak HTTP wrappers or ADR-001 envelope metadata into hooks or components.
  * **Mandatory Cancellation:** Always accept `{ signal }` in service methods and forward it directly to Axios (`api.get(url, { signal })`).
  * **Automated 422 Mapping:** Use `mapLaravelErrorsToForm(parsed.errors, form.setError)` to bind Laravel validation error bags directly to React Hook Form field state.
  * **Bearer Interceptor:** Rely on the centralized request interceptor to attach authentication tokens from `localStorage`. Never manually pass auth headers in services.

#### [04 - Server State & TanStack Query](04-server-state-tanstack-query/README.md)
* **What it Does:** Establishes the TkDodo centralized query key factory standard, enforces the fresh-by-default (`staleTime: 0`) caching invariant, outlines transactional vs. static reference caching rules, and standardizes mutation lifecycles and safe optimistic updates.
* **Child Specifications:** [01 - TkDodo Query Key Factory](04-server-state-tanstack-query/01-query-key-factory.md) | [02 - Fresh by Default Caching](04-server-state-tanstack-query/02-caching-rules.md)
* **Actionable Directives for AI Agents:**
  * **Query Key Factory:** Every feature must export a centralized `featureKeys` factory (`all`, `lists()`, `list(filters)`, `details()`, `detail(id)`). Hardcoded string arrays (`['items']`, `['items', id]`) are strictly forbidden.
  * **Fresh by Default:** Set `staleTime: 0` as the default on all queries. Re-fetch and re-verify state whenever components remount.
  * **Zero Caching on Transactional Data:** Never assign `staleTime > 0` to transactional or user data (Cart, Orders, Checkout, Addresses, Profile, Balances).
  * **Opt-in Reference Caching:** Only static reference data (Categories, Cuisines, Country lists, Tags) may opt into a `staleTime` (5–10 minutes).
  * **Mutation Invalidation:** Always invalidate query keys (`featureKeys.all` or `featureKeys.lists()`) in `onSuccess`. Never manually mutate cache arrays unless performing a sanctioned optimistic toggle.
  * **Optimistic Update Safeguards:** Optimistic updates are strictly limited to non-destructive boolean toggles (e.g., bookmarks, favorites). Multi-step mutations or deletions must never be optimistic, and rollbacks via `context.previousItem` in `onError` are mandatory.

#### [05 - Client State & Form Validation](05-client-state-and-forms/README.md)
* **What it Does:** Enforces strict separation between server state (TanStack) and client UI state (Zustand v5), mandates atomic store selectors to prevent over-renders, and standardizes two-phase form validation with React Hook Form, pure JS Zod v4 schemas, and Laravel 422 error bag mapping.
* **Child Specifications:** [01 - Zustand Atomic Selectors](05-client-state-and-forms/01-zustand-selectors.md) | [02 - Zod & 422 Error Mapping](05-client-state-and-forms/02-zod-form-mapping.md)
* **Actionable Directives for AI Agents:**
  * **State Boundary:** Server state belongs exclusively in TanStack Query; UI state (modals, drawers, theme, ephemeral wizard steps) belongs in Zustand. Never mirror API response entities into Zustand stores.
  * **Atomic Selectors:** Consume Zustand stores strictly with atomic selector functions (`useUIStore((state) => state.prop)`). Destructuring the entire store (`const { prop } = useUIStore()`) is forbidden.
  * **Pure JS Zod Schemas:** Declare schemas in pure JavaScript (`.js`). Never write TypeScript types or interfaces (`z.infer`).
  * **Two-Phase Form Validation:** Validate client-side first via `@hookform/resolvers/zod`. On submit rejection, map Laravel 422 error bags directly into input fields via `mapLaravelErrorsToForm(parsed.errors, form.setError)`.
  * **Zero `useEffect` for Derived State:** Never use `useEffect` to calculate or copy derived values from props or form state. Compute derived values inline synchronously during render.

#### [06 - Routing, UX & App Router](06-routing-and-ux/README.md)
* **What it Does:** Defines Server Component (RSC) vs. Client Component boundaries, standardizes official Next.js dynamic routing patterns (`[id]`, `[...slug]`, `[[...slug]]`, Route Groups, Parallel/Intercepting routes), enforces Next.js 16 asynchronous request APIs (`await params`), mandates modern navigation packages (`next/navigation`), and establishes declarative streaming loading/error UX patterns.
* **Child Specifications:** [01 - RSC Boundaries & Next.js 16 Navigation](06-routing-and-ux/01-rsc-boundaries.md) | [02 - Next.js Official Routing Patterns](06-routing-and-ux/02-routing-patterns.md) | [03 - Loading, Error States & Route Protection](06-routing-and-ux/03-loading-error-states.md)
* **Actionable Directives for AI Agents:**
  * **Keep Root Pages as RSC:** Never mark root `page.js` with `'use client'`. Root pages should remain server components that extract dynamic route parameters and pass them to client leaf feature containers.
  * **Async Route Params:** Always `await` dynamic route parameters: `const { id } = await params;` and `const query = await searchParams;`. Synchronous access is strictly forbidden in Next.js 16.
  * **Dynamic Segment Conventions:** Use single `[id]` for individual resources, catch-all `[...slug]` for deep path hierarchies, and optional catch-all `[[...slug]]` for flexible base/nested routes.
  * **Route Groups for Multiple Layouts:** Use `(folder)` to share layouts (e.g. auth vs. dashboard) without injecting artificial path segments into public URLs.
  * **Modern Navigation Imports:** Use `useRouter`, `usePathname`, and `useSearchParams` strictly from `next/navigation`, and `<Link>` from `next/link`. Never import from `next/router` or use raw `<a>` tags for internal routes.
  * **Layout-Matching Skeletons:** Use `loading.js` with shadcn `Skeleton` mirroring the target page geometry. Never block the UI with blank screens or isolated spinners.
  * **Client Error Boundaries:** Colocate `error.js` (`'use client'`) in route segments with recovery retry buttons (`reset()`).
  * **Auth Route Protection:** Wrap private feature containers in client auth guards to verify tokens and redirect without flashing protected UI.

#### [07 - Design System & shadcn/ui](07-styling-and-design-system/README.md)
* **Child Specifications:** [01 - shadcn Component Patterns](07-styling-and-design-system/01-shadcn-primitives.md) | [02 - Tailwind CSS v4 & Lucide Icons](07-styling-and-design-system/02-tailwind-lucide.md)

#### [08 - Performance & Asset Optimization](08-performance-and-assets/README.md)
* **Child Specifications:** [01 - Image Optimization & Next/Image](08-performance-and-assets/01-image-optimization.md) | [02 - Dynamic Code Splitting](08-performance-and-assets/02-dynamic-imports.md)

#### [09 - Testing & Quality Assurance](09-testing-and-quality/README.md)
* **Child Specifications:** [01 - React Testing Library & Vitest](09-testing-and-quality/01-component-testing.md) | [02 - MSW Contract Mocking](09-testing-and-quality/02-msw-mocking.md)

#### [10 - Research, ADRs & AI Standards](10-research-and-adrs/README.md)
* **Child Specifications:** [ADR-001-F - Unified Response Consumer](10-research-and-adrs/adr/ADR-001-F-api-envelope-consumer.md) | [ADR-002-F - Query Key Factory Standard](10-research-and-adrs/adr/ADR-002-F-query-key-factory.md)

