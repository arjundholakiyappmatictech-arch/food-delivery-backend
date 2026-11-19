# Next.js Frontend Engineering Handbook

> **The definitive architectural standard and coding blueprint for modern Next.js 16 + React 19 frontend applications consuming an external Laravel REST API.**

---

## 1. What This Handbook Does

This handbook is a centralized, reusable engineering guide. Instead of reinventing architecture for every project, it establishes a single, reliable way to build Next.js frontends:

* **Strictly Pure JavaScript:** 100% pure JavaScript (`.js`, `.jsx`). Zero TypeScript (`.ts`, `.tsx`), interfaces, or type annotations.
* **5-Tier Clean Architecture:** Deterministic flow from RSC Pages $\rightarrow$ Feature Containers $\rightarrow$ shadcn UI $\rightarrow$ TanStack Hooks $\rightarrow$ Axios Services.
* **Deterministic Backend Contract:** Consumes Laravel ADR-001 response envelopes (`response.data?.data`) and auto-maps 422 error bags to React Hook Form.
* **Dual-Engine State Separation:** Server state exclusively in TanStack Query v5; client UI state in Zustand v5 with atomic selectors (`state => state.property`).
* **Pragmatic Fresh-by-Default Caching:** Default `staleTime: 0`. Blanket caching is forbidden; transactional data is never cached.
* **AI-Ready Precision:** Serves as the ground truth for AI coding assistants (Antigravity, Cursor, Claude Code, Codex) to eliminate hallucinations and architectural drift.

---

## 2. How to Use It in Any Project

### For Developers
1. **Quick Reference:** Read [GUIDELINES.md](GUIDELINES.md) for approved code signatures (Query Hooks, Services, Zustand Stores, Error Mappers).
2. **Building Features:** Follow the 5-tier pipeline: `Page (RSC)` $\rightarrow$ `Feature Container (Client)` $\rightarrow$ `shadcn/ui` $\rightarrow$ `TanStack Hook` $\rightarrow$ `Axios Service`.
3. **Component Colocation:** Place feature-specific UI inside `src/components/<feature>/` and universal primitives inside `src/components/ui/`.

### For AI Coding Assistants
* Reference [`frontend/AGENTS.md`](../AGENTS.md) (or root [`AGENTS.md`](../../AGENTS.md)) as the canonical entry point.
* Custom architecture rules sit at the top of `frontend/AGENTS.md` pointing to [GUIDELINES.md](GUIDELINES.md), while preserving official Next.js guidelines (`<!-- BEGIN:nextjs-agent-rules -->`) below.
* The agent reads [GUIDELINES.md](GUIDELINES.md) first to load company invariants into memory.

### For Adopting in a New Project
1. **Copy Handbook:** Copy the `nextjs-engineering-handbook/` folder into your repository.
2. **Configure AGENTS.md:** Add the custom architecture rules to the top of your `frontend/AGENTS.md` pointing to `GUIDELINES.md`, keeping the official Next.js doc block intact.
3. **Verify Standards:** Verify 100% pure JavaScript, root `@/` aliasing in `jsconfig.json`, and centralized Axios configuration in `src/lib/api/api.js`.

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
