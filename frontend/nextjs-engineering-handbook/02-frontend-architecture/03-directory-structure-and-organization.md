# Project Directory Structure & Organization

---

## 1. Architectural Philosophy: Clean, Flat & Lean

This directory layout serves as a universal, reusable template for any Next.js 16 + React 19 application consuming an external Laravel REST API.

### Cardinal Rules:
1. **Forbidden Directories (Zero Bloat):** Never create `repositories/`, `adapters/`, or complex class hierarchies. All frontend logic belongs strictly in the 5-tier pipeline.
2. **Version-Agnostic Flatness:** Never introduce versioned directories (`components/v2/`, `services/v2/`). Version prefixes belong strictly in `NEXT_PUBLIC_API_URL` or isolated in Tier 5 service endpoints.
3. **Transport Shield:** UI components in `components/` never call Axios or `fetch` directly. They strictly consume custom TanStack Query hooks in `lib/hooks/queries/`.
4. **Universal Path Aliasing:** All imports across the entire app use `@/` (e.g. `@/components/ui/button`, `@/services/<feature>Service`).

---

## 2. Standard Directory Map

```text
frontend/
├── public/                       # Static public assets (images, icons, favicons)
│
├── src/
│   ├── app/                      # TIER 1: Next.js App Router (Route Shells & RSC)
│   │   ├── (auth)/               # Route group for auth screens (login, register)
│   │   │   ├── login/page.js
│   │   │   └── register/page.js
│   │   ├── <feature>/            # Domain feature routes (e.g. items, orders)
│   │   │   ├── page.js           # Server Component (RSC) entry point (metadata + Suspense)
│   │   │   ├── loading.js        # Instant streaming skeleton fallback
│   │   │   ├── error.js          # Segment error boundary
│   │   │   └── [id]/page.js      # Dynamic route segment
│   │   ├── layout.js             # Root layout (QueryProvider, html, body)
│   │   ├── page.js               # Root landing / dashboard page
│   │   └── globals.css           # Tailwind CSS v4 root stylesheet
│   │
│   ├── components/               # UI Components Layer
│   │   ├── ui/                   # TIER 3: shadcn/ui Primitives (button.jsx, input.jsx, dialog.jsx)
│   │   ├── <feature>/            # TIER 2 & 3: Feature-scoped components
│   │   │   ├── <Feature>Container.jsx # Tier 2: Interactive Client boundary ('use client')
│   │   │   ├── <Feature>Item.jsx      # Tier 3: Pure presentational card / row
│   │   │   ├── <Feature>Form.jsx      # Tier 3: React Hook Form + Zod form component
│   │   │   └── <Feature>Modal.jsx     # Tier 3: Dialog / Modal composing shadcn/ui
│   │   ├── common/               # Shared composite UI (Navbar, Footer, ConfirmDeleteModal)
│   │   └── skeletons/            # Reusable loading skeletons (TableSkeleton, CardSkeleton)
│   │
│   ├── lib/                      # Core configs, helpers, and state
│   │   ├── api/
│   │   │   └── api.js            # Centralized Axios instance (interceptors, tokens, offline check)
│   │   ├── hooks/                # Custom React & TanStack Query hooks
│   │   │   ├── queries/          # TIER 4: TanStack Query hooks & TkDodo Key Factories
│   │   │   │   └── use<Feature>.js # (e.g. useItemsQuery, useCreateItemMutation)
│   │   │   └── useDebounce.js    # Generic utility hooks
│   │   ├── schemas/              # Zod validation schemas
│   │   │   └── <feature>Schema.js # (e.g. loginSchema.js, itemSchema.js)
│   │   ├── store/                # Zustand stores (Client UI & Session state ONLY)
│   │   │   ├── authStore.js      # Auth token & user session (atomic selectors)
│   │   │   └── <feature>Store.js # Ephemeral UI state (e.g. isDrawerOpen)
│   │   └── utils.js              # Generic helper utilities (cn() helper, formatters)
│   │
│   ├── providers/                # Client-side context providers
│   │   └── QueryProvider.js      # TanStack QueryClientProvider & ReactQueryDevtools
│   │
│   ├── services/                 # TIER 5: API Service Layer (Axios transport)
│   │   └── <feature>Service.js   # Pure async Axios calls (GET/POST, ADR-001 unwrap, signal)
│   │
│   └── utils/                    # Global helper utilities
│       ├── apiError.js           # Normalizes Axios & offline errors
│       └── formErrors.js         # Maps Laravel 422 error bags to React Hook Form
│
├── .env.local                    # Environment variables (NEXT_PUBLIC_API_URL=.../api/v1)
├── jsconfig.json                 # Universal path alias: "@/*": ["./src/*"]
├── next.config.mjs               # Next.js configuration (reactCompiler: true)
├── package.json                  # Dependencies (Next 16, React 19, Tailwind 4, TanStack Query, Zustand)
└── eslint.config.mjs             # ESLint 9 flat configuration
```

---

## 3. File Placement Reference

| File Type | Destination Directory | Example Name |
| :--- | :--- | :--- |
| **Route Page (RSC)** | `src/app/<feature>/` | `page.js` |
| **Feature Container ('use client')** | `src/components/<feature>/` | `<Feature>Container.jsx` |
| **shadcn/ui Primitives** | `src/components/ui/` | `button.jsx`, `input.jsx`, `dialog.jsx` |
| **Feature Presentational UI** | `src/components/<feature>/` | `<Feature>Item.jsx`, `<Feature>Card.jsx` |
| **TanStack Hook & Key Factory** | `src/lib/hooks/queries/` | `use<Feature>.js` |
| **API Service (Axios)** | `src/services/` | `<feature>Service.js` |
| **Zod Schema** | `src/lib/schemas/` | `<feature>Schema.js` |
| **Zustand Store (Client State)** | `src/lib/store/` | `<feature>Store.js` |
| **Error / Form Utilities** | `src/utils/` | `apiError.js`, `formErrors.js` |
