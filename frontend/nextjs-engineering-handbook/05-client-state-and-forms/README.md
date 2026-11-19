# Module 05: Client State & Form Validation

> **Zustand v5 atomic selectors, pure client UI state boundaries, React Hook Form integration, and Zod v4 validation pipelines.**

---

## 1. Directory Contents

1. **[01 - Zustand Atomic Selectors](01-zustand-selectors.md):**
   * State separation invariant: Server state (TanStack) vs. Client state (Zustand).
   * Zustand v5 store setup and state updates.
   * Atomic selector mandate (`useStore((state) => state.prop)`) to eliminate redundant re-renders.
   * Client-side session and UI preference persistence.

2. **[02 - Zod & 422 Error Mapping](02-zod-form-mapping.md):**
   * React Hook Form with `@hookform/resolvers/zod` in pure JavaScript.
   * Two-phase validation lifecycle (Zod pre-flight $\rightarrow$ Laravel 422 response binding).
   * Connecting RHF with shadcn/ui components.
   * Zero `useEffect` invariant for derived state or form synchronization.

---

## 2. Invariant Summary Table

| Category | Approved Standard | Forbidden Anti-Pattern |
| :--- | :--- | :--- |
| **State Ownership** | Server state in TanStack Query; UI state (modals, theme, filters) in Zustand. | Copying or mirroring API entities into Zustand stores. |
| **Zustand Consumption** | Atomic selectors: `useUIStore((state) => state.isOpen)`. | Destructuring full stores: `const { isOpen } = useUIStore()`. |
| **Form Management** | React Hook Form controlled via `useForm` + `zodResolver(schema)`. | Manual React `useState` per input field with custom validation. |
| **Validation Flow** | Two-phase: Client-side Zod validation $\rightarrow$ Server 422 mapping. | Suppressing server errors or showing generic toast alerts for form fields. |
| **Derived State** | Inline computed variables during render: `const isValid = a && b`. | Using `useEffect` to copy, calculate, or sync derived form/UI state. |
| **Language** | Pure JavaScript (`.js`, `.jsx`) Zod schemas (`z.string().min(1)`). | TypeScript types, generics (`z.infer<typeof schema>`), or interfaces. |
