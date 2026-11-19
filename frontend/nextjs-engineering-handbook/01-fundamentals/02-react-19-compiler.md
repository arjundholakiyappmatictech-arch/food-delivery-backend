# React 19 Compiler Invariants

---

## 1. Automatic Compiler Optimization

This project runs **Next.js 16 + React 19** with `reactCompiler: true` enabled in `next.config.mjs` via `babel-plugin-react-compiler`.

The compiler analyzes pure JavaScript components at build time and automatically memoizes:
* JSX elements
* Component return values
* Internal handler functions
* Calculated values

---

## 2. Deprecation of Manual `useCallback` & `useMemo`

Because the compiler handles memoization automatically, writing manual `useCallback` and `useMemo` hooks is **strictly forbidden boilerplate** unless profiling proves an explicit edge case.

```javascript
// ❌ Forbidden (Manual useCallback/useMemo clutter):
import { useCallback, useMemo } from 'react';

const filteredAddresses = useMemo(() => {
   return addresses.filter((a) => a.city === selectedCity);
}, [addresses, selectedCity]);

const handleDelete = useCallback((id) => {
   deleteAddress(id);
}, [deleteAddress]);

// ✅ Approved (Clean, readable, pure JavaScript functions):
const filteredAddresses = addresses.filter((a) => a.city === selectedCity);

function handleDelete(id) {
   deleteAddress(id);
}
```

---

## 3. Rules of Component Purity

The React Compiler relies on **component purity** to safely memoize code:

1. **Idempotent Renders:** A component must return the same JSX given the same props and state.
2. **Never Mutate Variables During Render:** Never alter props, external variables, or state during render.
3. **Side-Effects in Handlers Only:** Network calls, timers, and store mutations must occur inside event handlers or TanStack Query mutations—**never** in the body of the component.

```javascript
// ❌ Forbidden (Mutating during render):
let renderCount = 0;
function ItemList({ items }) {
   renderCount++; // Side effect during render!
   items.sort(); // Mutates props in-place!
   return <div>...</div>;
}

// ✅ Approved:
function ItemList({ items }) {
   const sorted = [...items].sort(); // Copies first
   return <div>...</div>;
}
```

---

## 4. React 19 Transition Primitives (`useTransition`)

For non-urgent UI updates (e.g. filtering a long list of items or switching tabs without blocking input), use React 19's native `useTransition`:

```javascript
import { useState, useTransition } from 'react';

export function ItemSearch() {
   const [query, setQuery] = useState('');
   const [isPending, startTransition] = useTransition();

   const handleSearchChange = (e) => {
      const nextValue = e.target.value;
      // Urgent: updates the text input immediately
      setQuery(nextValue);

      // Non-urgent: deferred filter transition keeps UI responsive
      startTransition(() => {
         // Filter transition or search state
      });
   };

   return <input value={query} onChange={handleSearchChange} />;
}
```
