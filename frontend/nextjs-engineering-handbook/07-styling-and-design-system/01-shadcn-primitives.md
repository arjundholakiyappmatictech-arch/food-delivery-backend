# shadcn Component Patterns & `cn()` Composition

---

## 1. Pure JavaScript Architecture (`src/components/ui/`)

In Next.js 16 + React 19, UI components follow the **shadcn/ui** pattern: primitives live directly inside the repository under `src/components/ui/*.jsx` rather than being imported as a black-box npm package.

### Core Invariants:
* **Strictly JavaScript:** Written in pure `.jsx`. Never write TypeScript interfaces, generics, or type annotations.
* **Radix UI Primitives:** Backed by headless, accessible Radix UI primitives (`@radix-ui/react-dialog`, `@radix-ui/react-slot`, etc.).
* **Ref Forwarding:** Wrapped in `React.forwardRef` to ensure full interoperability with DOM references and animation libraries.

---

## 2. The `cn()` Class Merging Utility (`src/lib/utils.js`)

All dynamic styling must pass through the centralized `cn()` helper:

```javascript
// src/lib/utils.js
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
   return twMerge(clsx(inputs));
}
```

### Why `cn()` is Mandatory
1. **Conditional Class Merging (`clsx`):** Evaluates objects, booleans, and arrays cleanly: `cn('base-class', isActive && 'active-class')`.
2. **Conflict Resolution (`tailwind-merge`):** Prevents Tailwind CSS conflicts. Standard string concatenation causes stylesheet order bugs:
   ```javascript
   // ❌ Raw template string (Bug: conflicting padding rules fight in stylesheet):
   className={`px-4 py-2 ${customClass}`} // If customClass is 'px-8', both px-4 and px-8 exist!

   // ✅ Approved (twMerge safely overrides px-4 with px-8):
   className={cn('px-4 py-2', customClass)}
   ```

---

## 3. Variant Modeling with `class-variance-authority` (cva)

Component visual variants (intents, sizes, states) are declared using `cva` rather than messy nested ternary statements in JSX:

```javascript
// src/components/ui/button.jsx
import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
   'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
   {
      variants: {
         variant: {
            default: 'bg-primary text-primary-foreground shadow hover:bg-primary/90',
            destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
            outline: 'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
            secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
            ghost: 'hover:bg-accent hover:text-accent-foreground',
            link: 'text-primary underline-offset-4 hover:underline',
         },
         size: {
            default: 'h-9 px-4 py-2',
            sm: 'h-8 rounded-md px-3 text-xs',
            lg: 'h-10 rounded-md px-8',
            icon: 'h-9 w-9',
         },
      },
      defaultVariants: {
         variant: 'default',
         size: 'default',
      },
   }
);

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
   const Comp = asChild ? Slot : 'button';
   return (
      <Comp
         className={cn(buttonVariants({ variant, size, className }))}
         ref={ref}
         {...props}
      />
   );
});
Button.displayName = 'Button';

export { Button, buttonVariants };
```

---

## 4. The Polymorphic Slot Pattern (`asChild`)

Using Radix UI's `<Slot>` allows buttons and triggers to forward their styles and behaviors to child components (e.g. Next.js `<Link>`) without rendering invalid nested interactive HTML:

```javascript
// ❌ Forbidden (Invalid HTML: nesting <a> inside <button>):
<button>
   <Link href="/dashboard">Go to Dashboard</Link>
</button>

// ✅ Approved (Renders a single <a> element with full Button variant styles):
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function DashboardLink() {
   return (
      <Button asChild variant="outline" size="sm">
         <Link href="/dashboard">Go to Dashboard</Link>
      </Button>
   );
}
```

---

## 5. Dumb Presentational UI Contract

Presentational components (`components/ui/*` and `*Item.jsx`) must remain completely decoupled from application logic:

* **Pure Contract:** Inputs via props, events via callbacks (`onClick`, `onSelect`), rendering JSX.
* **Strictly Forbidden Inside UI Primitives:**
  1. Importing Axios services (`@/services/*`).
  2. Calling TanStack Query hooks (`useQuery`, `useMutation`).
  3. Consuming Zustand stores (`useUIStore`, `useAuthStore`).
* **Why:** Decoupled UI components are 100% testable, universally reusable across different features, and immune to state side-effects.
