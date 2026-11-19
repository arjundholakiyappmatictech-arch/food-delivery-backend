# JavaScript Standards & Immutability

---

## 1. Strictly JavaScript (No TypeScript)

This project is written in **100% standard JavaScript (ESNext / JSX)**. 

* **Rule:** Never generate `.ts`, `.tsx`, `interface`, `type`, or inline type annotations (`: string`, `: number`, `<T>`).
* **File Extensions:** Use `.js` for logic/services/stores/hooks/utils; use `.jsx` for components.

---

## 2. JSDoc for Autocomplete (Zero Build Overhead)

When documenting complex data shapes or service methods, use standard **JSDoc**. This provides full IDE and AI autocomplete without TypeScript build friction:

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

## 3. Modern Operators & Strict Equality

* **Strict Identity:** Always use `===` and `!==`. Never use loose `==` or `!=`.
* **Optional Chaining (`?.`):** Safe property access on nested objects.
* **Nullish Coalescing (`??`):** Default fallback only on `null` or `undefined`. Never use `||` for defaults if `0`, `""`, or `false` are valid values.

```javascript
// ❌ Forbidden:
if (user.role == 'admin') ...
const city = address && address.city ? address.city : '';
const count = data.count || 10; // Overwrites count if count is 0!

// ✅ Approved:
if (user?.role === 'admin') ...
const city = address?.city ?? '';
const count = data?.count ?? 10;
```

---

## 4. Immutability & State Updates

React components and Zustand stores must **never mutate objects or arrays in-place**. Always return fresh copies using spread (`...`), `.map()`, or `.filter()`.

```javascript
// ❌ Forbidden (In-place mutation):
cartItems.push(newItem);
user.is_verified = true;

// ✅ Approved (Immutable copies):
const nextCart = [...cartItems, newItem];
const updatedUser = { ...user, is_verified: true };

// Array updates:
const updatedList = list.map((item) =>
   item.id === targetId ? { ...item, status: 'active' } : item
);
```

---

## 5. Universal Path Aliasing (`@/`)

All cross-folder imports must use the `@/` root alias configured in `jsconfig.json`. Deep relative directory traversal is strictly forbidden.

```javascript
// ❌ Forbidden:
import { Button } from '../../../components/ui/button';
import api from '../../lib/api/api';

// ✅ Approved:
import { Button } from '@/components/ui/button';
import api from '@/lib/api/api';
```
