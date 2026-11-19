# Module 07: Design System & shadcn/ui

> **Pure JavaScript shadcn/ui component primitives, class composition via `cn()`, Tailwind CSS v4 semantic tokens, and exclusive `lucide-react` iconography.**

---

## 1. Directory Contents

1. **[01 - shadcn Component Patterns & `cn()` Composition](01-shadcn-primitives.md):**
   * Pure JavaScript shadcn/ui architecture in `components/ui/*.jsx`.
   * Class merging via `cn()` (`clsx` + `tailwind-merge`).
   * Component variants using `class-variance-authority` (cva).
   * Polymorphic Slot pattern with `@radix-ui/react-slot` (`asChild`).
   * Dumb presentational contract: pure components with zero API or store imports.

2. **[02 - Tailwind CSS v4 & Lucide Iconography](02-tailwind-lucide.md):**
   * Tailwind CSS v4 CSS variables and semantic color tokens (`background`, `foreground`, `primary`, `destructive`, `muted`, `border`).
   * Exclusive icon mandate: `lucide-react` for all UI icons and controls (mixed icon libraries or inline SVGs are strictly forbidden).
   * Accessibility standards: `aria-label` for icon-only buttons and visible focus rings (`focus-visible:ring-2`).

---

## 2. Invariant Summary Table

| Category | Approved Standard | Forbidden Anti-Pattern |
| :--- | :--- | :--- |
| **Language** | 100% Pure JavaScript (`.jsx`). | TypeScript interfaces, type annotations, or `.tsx` files. |
| **Component Primitives** | shadcn/ui patterns colocated in `components/ui/*.jsx`. | Heavy monolithic UI kits (MUI, Ant Design) or ad-hoc unstyled HTML. |
| **Class Composition** | Universal `cn()` helper (`clsx` + `tailwind-merge`). | Raw string concatenation (`className={"btn " + (active ? "a" : "")}`). |
| **Variants** | `class-variance-authority` (cva) for button sizes and intents. | Fragile nested ternary class expressions in JSX templates. |
| **Polymorphism** | `asChild` with Radix UI Slot for composite triggers and links. | Nesting interactive elements (`<button><Link>...</Link></button>`). |
| **Icon Library** | Strictly `lucide-react` for all icons and interactive controls. | Mixing `@heroicons`, `react-icons`, FontAwesome, or ad-hoc inline SVGs. |
| **Semantic Tokens** | Tailwind semantic tokens (`bg-background`, `text-primary`, `border-border`). | Hardcoded hex codes (`bg-[#ffffff]`, `text-[#ff0000]`) bypassing dark mode. |
| **Presentational Purity** | Dumb UI primitives: props in, JSX out (zero business logic). | Importing Axios services, TanStack hooks, or Zustand stores into `components/ui/`. |
