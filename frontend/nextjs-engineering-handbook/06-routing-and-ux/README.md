# Module 06: Routing, UX & App Router

> **Next.js 16 App Router navigation, dynamic route segments, Route Groups, and declarative loading/error UX.**

---

## 1. Directory Contents

1. **[01 - RSC Boundaries & Next.js 16 Navigation](01-rsc-boundaries.md):**
   * Server Component (`page.js`) $\rightarrow$ Client Component (`<Feature>Container.jsx`) boundary.
   * Next.js 16 async dynamic APIs (`await params` and `await searchParams`).
   * Strict navigation package rules (`next/navigation` and `next/link` only; legacy `next/router` is forbidden).
   * Programmatic navigation and query parameter management.

2. **[02 - Routing Patterns & Architecture](02-routing-patterns.md):**
   * Mandatory core filesystem conventions (`page.js` and `layout.js`).
   * Mandatory single dynamic segments (`[id]`) with `await params`.
   * High-priority Route Groups `(folder)` for clean multi-layout organization.
   * Conditional dynamic metadata generation (`generateMetadata`).
   * Niche catch-all segments (`[...slug]`) for documentation and deep trees.

3. **[03 - Loading, Error States & Route Protection](03-loading-error-states.md):**
   * Built-in route segments: `loading.js` (Suspense skeletons) and `error.js` (interactive recovery).
   * 404 handling via `notFound()` and `not-found.js`.
   * Client-side auth route guard patterns.
   * Perceived performance standards with shadcn skeletons.

---

## 2. Invariant Summary Table

| Category | Approved Standard | Forbidden Anti-Pattern |
| :--- | :--- | :--- |
| **Page Component** | Root `page.js` is a React Server Component (RSC) without `'use client'`. | Marking root `page.js` with `'use client'`; fetching client data in root. |
| **Dynamic Params** | Asynchronous `await params` and `await searchParams` (Next.js 15/16). | Accessing `params.id` synchronously (causes runtime warnings/errors). |
| **Route Segment Matching** | Strict use of `[id]` for resources and `[...slug]` for deep paths. | Writing manual regex or client-side URL parsing to detect segments. |
| **Route Groups** | Use `(folder)` to share layouts or organize without affecting URLs. | Hardcoding repetitive URL prefixes to achieve separate layouts. |
| **Navigation Hooks** | `useRouter`, `usePathname`, `useSearchParams` from `next/navigation`. | Importing router hooks from legacy `next/router` (crashes in App Router). |
| **Links** | `<Link href="...">` from `next/link` for internal transitions. | Standard HTML `<a href="...">` (triggers full browser page reload). |
| **Loading UX** | Declarative `loading.js` with layout-matching shadcn `Skeleton`. | Blocking white screens, raw spinners, or ad-hoc `isLoading` flags everywhere. |
| **Error Handling** | Declarative `error.js` (`'use client'`) with retry `reset()` callback. | Unhandled React crashes breaking the entire application tree. |
| **Route Protection** | Clean client auth guard redirecting to login before mounting private UI. | Flashing protected UI before redirecting or missing client checks. |
