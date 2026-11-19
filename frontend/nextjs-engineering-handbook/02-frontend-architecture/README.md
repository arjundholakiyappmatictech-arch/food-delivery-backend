# Module 02: Frontend Architecture & 5-Tier Data Flow

> **Deterministic component layering, strict layer decoupling, and component colocation conventions.**

---

## 1. Directory Contents

1. **[01 - 5-Tier Layer Responsibilities](01-layer-responsibilities.md):**
   * The strict 5-tier request/render lifecycle.
   * Single Responsibility Principle (SRP) for every layer.
   * Total transport isolation (zero Axios in JSX components).

2. **[02 - Component Colocation & Design System](02-component-colocation.md):**
   * Shared design system primitives (`components/ui/`) vs feature components (`components/<feature>/`).
   * Smart Container vs Dumb Presentational pattern.
   * Flat and version-agnostic directory rules.

3. **[03 - Directory Structure & Organization](03-directory-structure-and-organization.md):**
   * The complete, universal directory map for Next.js 16 + React 19.
   * Cardinal architectural rules (no layer bloat, transport shield).
   * File placement reference table.

---

## 2. Invariant Summary Table

| Tier / Concept | Approved Standard | Forbidden Anti-Pattern |
| :--- | :--- | :--- |
| **Tier 1: Page Shell** | Server Component (RSC), exports `metadata`, sets `<Suspense>` boundary. | Putting `'use client'` on `page.js`; data fetching directly in layout. |
| **Tier 2: Feature Container** | Client boundary (`'use client'`), orchestrates query hooks and modal states. | Direct raw Axios calls; inline SQL-like mutations. |
| **Tier 3: shadcn/ui & UI** | shadcn/ui primitives (`src/components/ui/`) + pure props in/out. Styled with Tailwind CSS v4 & `cn()`. | Importing stores, hooks, or API services directly into dumb UI; inventing custom raw buttons. |
| **Tier 4: Query Hooks** | Centralized Query Key Factories (`featureKeys`), optimistic updates. | Hardcoded string query keys (`['addresses']`); uncoordinated refetches. |
| **Tier 5: API Services** | Pure async functions wrapping Axios with AbortSignal and ADR-001 unwrapping. | Calling React hooks in services; using `PUT` or `DELETE` methods. |
| **Directory Layout** | Flat, feature-scoped folders (`components/<feature>/`, `services/`). | Nested versioned folders (`components/v2/`, `services/v2/`). |
