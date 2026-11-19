# 5-Tier Layer Responsibilities

---

## 1. The 5-Tier Pipeline (Reusable Template Pattern)

Every feature in the application follows a strict, unidirectional data pipeline mapped directly to the `src/` directory structure:

$$\text{Tier 1: Page (src/app/)} \longrightarrow \text{Tier 2: Container (src/components/)} \longrightarrow \text{Tier 3: shadcn UI (src/components/ui/)} \longrightarrow \text{Tier 4: TanStack Hook (src/lib/hooks/)} \longrightarrow \text{Tier 5: Axios Service (src/services/)}$$

---

## 2. Layer Specifications & Directory Mapping

### Tier 1: Page Shell (`src/app/<feature>/page.js`)
* **Role:** Server Component (RSC) route entry point.
* **Responsibilities:**
  * Defines route metadata (SEO title, description, OpenGraph).
  * Reads route parameters (`params`, `searchParams`).
  * Wraps the feature in a `<Suspense fallback={<Skeleton />}>` boundary.
* **Directory Pattern:** `src/app/<feature>/page.js`
* **Prohibited:** Never place `'use client'` on `page.js`.

### Tier 2: Feature Container (`src/components/<feature>/<Feature>Container.jsx`)
* **Role:** Interactive Client boundary.
* **Responsibilities:**
  * Declares `'use client'`.
  * Calls TanStack Query hooks (Tier 4) and Zustand stores for client state.
  * Manages ephemeral UI states (e.g. `isModalOpen`, `searchQuery`).
  * Passes data and action callbacks down to dumb UI and shadcn/ui components.
* **Directory Pattern:** `src/components/<feature>/<Feature>Container.jsx`
* **Prohibited:** Never call Axios or `fetch` directly in containers.

### Tier 3: shadcn/ui Primitives & Presentational Leaves (`src/components/ui/*.jsx`, `src/components/<feature>/*.jsx`)
* **Role:** Pure rendering leaves and reusable design system controls.
* **shadcn/ui Integration:**
  * All atomic UI controls live in `src/components/ui/*.jsx` (e.g. `button.jsx`, `input.jsx`, `dialog.jsx`, `badge.jsx`).
  * Written in **100% pure JavaScript (JSX)**, styled with **Tailwind CSS v4**, and merged with `cn()`.
  * Standardized on **`lucide-react`** for all icon controls and button accessories.
* **Feature Presentational Components:**
  * Live in `src/components/<feature>/<Feature>Item.jsx`, `<Feature>Card.jsx`, or `<Feature>Form.jsx`.
  * Compose reusable shadcn/ui primitives (`<Button>`, `<Input>`) with Tailwind classes.
  * Pure props in, JSX out.
* **Directory Pattern:** `src/components/ui/*.jsx` and `src/components/<feature>/*.jsx`
* **Prohibited:** Never import stores, custom hooks, or API services into Tier 3.

### Tier 4: TanStack Query Hook (`src/lib/hooks/queries/use<Feature>.js`)
* **Role:** Cache & server state manager.
* **Responsibilities:**
  * Owns the TkDodo Query Key Factory (`<feature>Keys`).
  * Defines `useQuery` and `useMutation` configurations with `staleTime: 0` by default.
  * Handles cache invalidation, background refetching, and optimistic updates.
  * Delegates the actual HTTP transport to Tier 5 services.
* **Directory Pattern:** `src/lib/hooks/queries/use<Feature>.js`
* **Prohibited:** Never write raw `api.get()` calls inside hooks without delegating to Tier 5.

### Tier 5: API Service Layer (`src/services/<feature>Service.js`)
* **Role:** Pure HTTP transport client.
* **Responsibilities:**
  * Wraps the centralized Axios client (`src/lib/api/api.js`).
  * Forwards `signal` from TanStack Query for request cancellation.
  * Enforces the Laravel 2-verb model (`GET` for fetching, `POST` for mutations).
  * Unwraps the Laravel ADR-001 envelope (`return response.data?.data`).
* **Directory Pattern:** `src/services/<feature>Service.js`
* **Prohibited:** Never use React hooks or manage UI state inside services.
