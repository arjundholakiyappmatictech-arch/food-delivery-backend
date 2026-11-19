# Module 04: Server State & TanStack Query

> **TkDodo query key factories, fresh-by-default caching invariants, and standardized mutation lifecycle patterns.**

---

## 1. Directory Contents

1. **[01 - TkDodo Query Key Factory](01-query-key-factory.md):**
   * Centralized query key factory structure (`<feature>Keys`).
   * Hierarchical cache keys (`all`, `lists()`, `list(filters)`, `details()`, `detail(id)`).
   * Safe, hierarchical cache invalidation patterns.

2. **[02 - Caching Rules & Mutation Lifecycles](02-caching-rules.md):**
   * Fresh by default invariant (`staleTime: 0`).
   * Prohibition of blanket caching and transactional data caching.
   * Opt-in static reference caching.
   * Standard mutation flows (`onSuccess`, `onError`, 422 mapping, and optimistic updates).

---

## 2. Invariant Summary Table

| Category | Approved Standard | Forbidden Anti-Pattern |
| :--- | :--- | :--- |
| **Query Keys** | Centralized factory object (`featureKeys`) following TkDodo guidelines. | Hardcoded string arrays (`['items']`, `['items', id]`) across files. |
| **Default Freshness** | `staleTime: 0` (fresh by default; always re-validate server state on remount). | Blanket `staleTime: Infinity` or caching everything globally. |
| **Transactional Data** | Strictly `staleTime: 0` for Cart, Orders, Checkout, Addresses, and Profiles. | Caching rapidly changing or financial/transactional entities. |
| **Reference Data** | Opt-in `staleTime` (e.g. 5–10 min) only for static categories/tags/cuisines. | Re-fetching immutable system configuration on every micro-navigation. |
| **Mutations** | TanStack `useMutation` with targeted `queryClient.invalidateQueries`. | Manual state manipulation instead of invalidation; ignoring errors. |
| **Optimistic Updates** | Permitted only for instant, non-destructive toggles with rollback in `onError`. | Optimistically creating complex financial orders or multi-step mutations. |
