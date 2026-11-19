# JavaScript Standards & Immutability

> **Company language standards, JSDoc autocomplete conventions, and state immutability rules.**

---

## 1. Strictly Pure JavaScript (No TypeScript)

This codebase is 100% standard JavaScript (ESNext / JSX). Next.js official documentation defaults to TypeScript, but our company standard strictly enforces pure JavaScript:

* **Inviolable Rule:** Never generate `.ts`, `.tsx`, `interface`, `type`, generics, or inline type annotations (`: string`, `: number`, `<T>`).
* **File Extensions:** Use `.js` for logic, services, stores, hooks, and utilities; use `.jsx` for React components.

---

## 2. JSDoc for Autocomplete (Zero Build Overhead)

To provide IDE and AI agent autocomplete without TypeScript build friction or compilation overhead, document service methods and complex utility parameters using standard **JSDoc**:

```javascript
/**
 * @param {string} id
 * @param {Object} payload
 * @param {string} payload.title
 * @param {string} payload.status
 * @param {AbortSignal} [signal]
 * @returns {Promise<Object>}
 */
export async function updateEntity(id, payload, signal) {
   const response = await api.post(`/entities/${id}/update`, payload, { signal });
   return response.data?.data;
}
```

---

## 3. Immutability & Pure State Transformations

Components, hooks, and Zustand stores must **never mutate objects or arrays in-place**. Always return fresh copies using spread (`...`), `.map()`, or `.filter()`:

```javascript
// ❌ Forbidden (In-place mutation risks stale React renders):
items.push(newItem);
entity.status = 'active';

// ✅ Approved (Immutable copies):
const nextItems = [...items, newItem];
const updatedEntity = { ...entity, status: 'active' };

// Array updates:
const updatedList = list.map((item) =>
   item.id === targetId ? { ...item, status: 'active' } : item
);
```

---

## 4. Universal Path Aliasing (`@/`)

All cross-folder imports must use the `@/` root alias configured in `jsconfig.json`. Deep relative directory traversal (`../../..`) is strictly forbidden:

```javascript
// ❌ Forbidden:
import { Button } from '../../../components/ui/button';
import api from '../../lib/api/api';

// ✅ Approved:
import { Button } from '@/components/ui/button';
import api from '@/lib/api/api';
```
