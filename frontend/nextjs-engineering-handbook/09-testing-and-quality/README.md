# Module 09: Testing & Quality Assurance

> **Component testing with React Testing Library and Vitest, user-centric accessibility queries, and network-level Laravel contract mocking with Mock Service Worker (MSW).**

> [!IMPORTANT]
> **Workflow Mandate: Testing is Strictly On-Demand**
> During initial and active feature development, primary focus remains 100% on domain implementation, 5-tier architecture, and UX.
> **AI agents and developers must NEVER create test files, test suites, or execute test commands unless the user explicitly requests testing.**

---

## 1. Directory Contents

1. **[01 - Component Testing & User-Centric Assertions](01-component-testing.md):**
   * Pure JavaScript test setup with Vitest and React Testing Library (`*.test.jsx`).
   * Custom test harness wrapping smart containers in `QueryClientProvider` (`retry: false`).
   * User-centric query hierarchy (`getByRole`, `findByRole`, `getByText`).
   * Prohibition of implementation detail testing (testing what the user sees, not internal state).

2. **[02 - MSW Contract Mocking & Laravel Alignment](02-msw-mocking.md):**
   * Network-level API mocking using Mock Service Worker (MSW v2).
   * Exact emulation of the Laravel ADR-001 response envelope (`is_error`, `message`, `data`, `errors`).
   * Simulating 422 validation errors to test form error binding (`mapLaravelErrorsToForm`).
   * Strict 2-verb mock alignment (`http.get` and `http.post` only; `http.put` and `http.delete` are forbidden).

---

## 2. Invariant Summary Table

| Category | Approved Standard | Forbidden Anti-Pattern |
| :--- | :--- | :--- |
| **Language** | Pure JavaScript (`.test.jsx`, `.js`). | TypeScript interfaces, type assertions, or `.tsx` test files. |
| **Test Runner** | Vitest or Jest with React Testing Library. | Legacy Enzyme or testing private component state directly. |
| **Element Queries** | User-facing queries: `getByRole('button')`, `findByText(...)`. | Querying by CSS class names (`container.querySelector('.btn')`) or test IDs unless unavoidable. |
| **Async Elements** | Async `await screen.findByRole(...)` for elements loaded via TanStack Query. | Arbitrary `setTimeout` waits or accessing unrendered elements with `getByRole`. |
| **API Mocking** | Mock Service Worker (MSW) intercepting network requests. | Mocking Axios module internals (`vi.mock('axios')`) creating brittle mocks. |
| **Laravel Envelope** | MSW handlers return `{ is_error, message, data, errors }`. | Returning raw unwrapped objects or non-standard payloads in mock handlers. |
| **HTTP Verbs** | Mock handlers use `http.get` and `http.post` exclusively. | Defining `http.put`, `http.patch`, or `http.delete` mock routes. |
| **Query Client in Tests** | Fresh `QueryClient` per test with `{ queries: { retry: false } }`. | Sharing a global `QueryClient` with retries enabled across tests. |
