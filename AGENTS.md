# Repository Agent Instructions

> **Canonical Entry Point for AI Coding Assistants (Antigravity, Cursor, Claude Code, Codex).**

Before reading, writing, refactoring, documenting, or reviewing code in this repository, strictly adhere to the Full-Stack Matrix and Navigation Order below:

---

## 1. Full-Stack Tech Stack & Invariant Matrix

| Layer / Domain | Approved Technology | Strictly Forbidden | Ground Truth Rulebook |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | **Next.js 16 (App Router) + React 19** | Pages Router (`pages/`), Remix, Vite | [`frontend/AGENTS.md`](frontend/AGENTS.md) |
| **Frontend Language** | **100% Pure JavaScript (`.js`, `.jsx`)** | TypeScript (`.ts`, `.tsx`), interfaces, types | [Module 01: Fundamentals](frontend/nextjs-engineering-handbook/01-fundamentals/01-javascript-standards.md) |
| **Frontend Data Flow** | **5-Tier Flow** (Page $\rightarrow$ Container $\rightarrow$ UI $\rightarrow$ Hook $\rightarrow$ Service) | Calling Axios/fetch directly inside JSX | [Module 02: Architecture](frontend/nextjs-engineering-handbook/02-frontend-architecture/01-layer-responsibilities.md) |
| **Frontend Server State** | **TanStack Query v5** + TkDodo `featureKeys` | Hardcoded string query keys (`['items']`) | [Module 04: Server State](frontend/nextjs-engineering-handbook/04-server-state-tanstack-query/README.md) |
| **Frontend Client State** | **Zustand v5** (Atomic selectors: `s => s.prop`) | Destructuring entire stores (`const { a } = useStore()`) | [Module 05: Client State](frontend/nextjs-engineering-handbook/05-client-state-and-forms/01-zustand-selectors.md) |
| **Frontend Forms** | **React Hook Form + Zod v4 (`.js`)** | Manual `useState` form inputs, `z.infer` | [Module 05: Forms](frontend/nextjs-engineering-handbook/05-client-state-and-forms/02-zod-form-mapping.md) |
| **Frontend UI & Icons** | **shadcn/ui (`components/ui/`) + `lucide-react`** | Heavy UI kits (MUI, AntD), mixed icon packs | [Module 07: Design System](frontend/nextjs-engineering-handbook/07-styling-and-design-system/README.md) |
| **Backend Framework** | **Laravel 12 / 13 (PHP 8.4)** | Raw PHP, microframeworks | [`backend/AGENTS.md`](backend/AGENTS.md) |
| **Backend Architecture** | **Thin Controllers (<15 lines) + Flat Services** | Fat controllers, artificial folders (`DTOs/`, `Repositories/`) | [Module 02: Architecture](backend/laravel-engineering-handbook/02-application-architecture/README.md) |
| **Backend Auth & DB** | **Sanctum (Bearer) + PostgreSQL (Supabase)** | Session cookies for APIs, unconstrained foreign keys | [Module 05: Database](backend/laravel-engineering-handbook/05-database-engineering/README.md) |
| **HTTP Communication** | **Strict 2-Verb Model (`GET` & `POST` only)** | `PUT`, `PATCH`, `DELETE` methods | [ADR-001 / ADR-001-F](ARCHITECTURE.md) |
| **Testing Workflow** | **Strictly On-Demand** (Focus 100% on building first) | Writing tests or running test suites unprompted | [Module 09: Testing](frontend/nextjs-engineering-handbook/09-testing-and-quality/README.md) |

---

## 2. AI Execution & Context Navigation Order

When executing any prompt or user requirement:
1. **Business Rules ("WHAT to build"):** Check [`PROJECT_REQUIREMENTS.md`](PROJECT_REQUIREMENTS.md) for domain rules and user permissions.
2. **Full-Stack Contracts ("HOW to connect"):** Check [`ARCHITECTURE.md`](ARCHITECTURE.md) for 2-verb endpoints, ADR-001 envelope, and token flow.
3. **Backend Agent Instructions:** Follow [`backend/AGENTS.md`](backend/AGENTS.md) (which loads `backend/laravel-engineering-handbook/GUIDELINES.md` & Laravel Boost).
4. **Frontend Agent Instructions:** Follow [`frontend/AGENTS.md`](frontend/AGENTS.md) (which loads `frontend/nextjs-engineering-handbook/GUIDELINES.md`).
