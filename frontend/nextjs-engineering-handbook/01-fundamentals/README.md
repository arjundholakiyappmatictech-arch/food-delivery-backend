# Module 01: Fundamentals & Language Standards

> **Foundational rules for modern JavaScript (ESNext / JSX) conventions, path aliasing, and React 19 compiler invariants.**

---

## 1. Directory Contents

1. **[01 - JavaScript Standards & Immutability](01-javascript-standards.md):**
   * Pure JavaScript invariants (zero TypeScript).
   * Immutability and state transformation patterns.
   * Universal `@/` path aliasing.
   * JSDoc annotations for IDE autocomplete.

2. **[02 - React 19 Compiler Invariants](02-react-19-compiler.md):**
   * Automated memoization via `babel-plugin-react-compiler`.
   * Deprecation of manual `useMemo` and `useCallback` boilerplate.
   * Rules of component purity during render.
   * Idiomatic React 19 transition primitives (`useTransition`).

---

## 2. Invariant Summary Table

| Category | Approved Standard | Forbidden Anti-Pattern |
| :--- | :--- | :--- |
| **Language** | Standard JavaScript (`.js`, `.jsx`). | TypeScript (`.ts`, `.tsx`), interfaces, or type annotations (`: string`, `<T>`). |
| **Path Imports** | Root alias `@/` (`@/components/ui/button`, `@/services/featureService`). | Deep relative traversal (`../../components/ui/button`). |
| **Equality** | Strict identity checks (`===`, `!==`). | Loose comparison (`==`, `!=`). |
| **Null Traversal** | Optional chaining (`?.`) and nullish coalescing (`??`). | Risky nested chaining (`a && a.b && a.b.c`) or falsy fallback (`a || b`). |
| **State Mutation** | Pure updates via object spread (`...`), `.map()`, `.filter()`. | Direct in-place mutation (`state.items.push(x)`, `obj.prop = val`). |
| **Memoization** | Automatic compiler memoization (`reactCompiler: true`). | Manual `useCallback` and `useMemo` boilerplate wrappers. |
| **Component Purity** | Pure render functions; side-effects strictly in handlers. | Mutating external variables or triggering side effects during render. |
