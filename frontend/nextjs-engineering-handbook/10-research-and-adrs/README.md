# Module 10: Research, ADRs & AI Standards

> **Frontend Architectural Decision Records (ADRs), canonical invariants, and operational guardrails for autonomous AI coding assistants.**

---

## 1. Directory Contents

1. **[ADR-001-F: Unified Response Consumer & 2-Verb Alignment](adr/ADR-001-F-api-envelope-consumer.md):**
   * Formal decision on consuming Laravel ADR-001 response envelope (`is_error`, `message`, `data`, `errors`).
   * Tier 5 service unwrapping standard (`response.data?.data`).
   * Strict 2-verb HTTP alignment (`GET` and `POST` only; `PUT`, `PATCH`, `DELETE` are forbidden).
   * Automated 422 error bag dispatching to React Hook Form.

2. **[ADR-002-F: TkDodo Query Key Factory Standard](adr/ADR-002-F-query-key-factory.md):**
   * Formal decision mandating centralized TkDodo query key factories (`<feature>Keys`).
   * Elimination of fragile, hardcoded string keys.
   * Hierarchical cache invalidation mechanics.

3. **[01 - AI Agent Rules & Engineering Guardrails](01-ai-agent-rules.md):**
   * Mandatory operational guardrails for AI coding assistants (Antigravity, Cursor, Claude Code, Codex).
   * Strict enforcement of the 10 Frontend Invariants.
   * On-demand testing rule (focus 100% on building; tests only when explicitly instructed).

---

## 2. Invariant Summary Table

| Category | Approved Standard | Forbidden Anti-Pattern |
| :--- | :--- | :--- |
| **Language** | 100% Pure JavaScript (`.js`, `.jsx`). | Writing TypeScript (`.ts`, `.tsx`), interfaces, or type annotations. |
| **Architectural Boundaries** | 5-Tier Data Flow: RSC $\rightarrow$ Container $\rightarrow$ UI $\rightarrow$ Hook $\rightarrow$ Service. | Calling Axios or mutating state directly inside JSX components. |
| **Backend Integration** | Strict 2-verb HTTP model; unwrap `response.data?.data`. | Using `PUT`, `PATCH`, `DELETE`; leaking envelope metadata to UI. |
| **Server State** | TanStack Query v5 with TkDodo factories (`featureKeys`). | Hardcoded string keys; duplicating server state in client stores. |
| **Client State** | Zustand v5 with atomic selectors (`state => state.prop`). | Destructuring entire stores (`const { a, b } = useStore()`). |
| **Forms & Validation** | React Hook Form + Zod v4 (`.js`); automatic 422 mapping. | Manual `useState` form inputs; showing generic toasts for field errors. |
| **Derived State** | Inline computed variables during render. | Using `useEffect` to synchronize or calculate derived state. |
| **Design System** | shadcn/ui primitives (`components/ui/`) + `lucide-react` icons. | Mixing icon packs, pasting raw SVGs, or using heavy UI libraries. |
| **Testing Workflow** | Strictly on-demand (focus 100% on feature building first). | Automatically generating test files or test suites without explicit prompt. |
