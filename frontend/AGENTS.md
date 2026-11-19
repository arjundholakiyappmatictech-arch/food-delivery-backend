# Frontend Agent Instructions

> **Canonical Entry Point for AI Coding Assistants (Antigravity, Cursor, Claude Code, Codex).**

Before reading, writing, refactoring, documenting, or reviewing any frontend code in this repository, you must strictly adhere to our project architecture and standards:

1. **Primary Rulebook:** Always inspect and follow [`nextjs-engineering-handbook/GUIDELINES.md`](nextjs-engineering-handbook/GUIDELINES.md).
2. **Master Handbook:** Consult [`nextjs-engineering-handbook/README.md`](nextjs-engineering-handbook/README.md) for full module specifications.
3. **Strictly Pure JavaScript:** Write 100% pure JavaScript (`.js`, `.jsx`). Never write TypeScript (`.ts`, `.tsx`), interfaces, or type annotations.
4. **5-Tier Data Flow:** Adhere strictly to: Page (RSC) $\rightarrow$ Feature Container (Client) $\rightarrow$ shadcn UI $\rightarrow$ TanStack Hook $\rightarrow$ Axios Service. Calling Axios or `fetch()` directly in JSX is forbidden.
5. **State Separation:** Server state exclusively in TanStack Query v5; Client UI state in Zustand v5 with atomic selectors (`state => state.property`); Forms in React Hook Form + Zod v4. Zero `useEffect` for data fetching or derived state.
6. **Backend Contract & ADR-001:** Services consume endpoints as defined in `ARCHITECTURE.md` / `backend/routes/api.php`. Always unwrap `response.data?.data`. Map 422 errors automatically to forms using `mapLaravelErrorsToForm()`.
7. **Pragmatic Caching & UI Primacy:** Default `staleTime: 0` (no caching on transactional data like Cart, Orders, Checkout). UI exclusively uses shadcn/ui primitives (`components/ui/*.jsx`) and `lucide-react` icons.

---

<!-- BEGIN:nextjs-agent-rules -->

# Next.js: ALWAYS read docs before coding

Before any Next.js work, find and read the relevant doc in `node_modules/next/dist/docs/`. Your training data is outdated — the docs are the source of truth.

<!-- END:nextjs-agent-rules -->
