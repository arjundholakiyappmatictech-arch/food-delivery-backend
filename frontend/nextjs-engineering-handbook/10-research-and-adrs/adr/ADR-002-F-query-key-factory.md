# ADR-002-F: Centralized TkDodo Query Key Factory Standard

* **Status:** Accepted
* **Context:** Server State Caching and Invalidation in TanStack Query v5.
* **Scope:** Query Key Definitions, Cache Hierarchies, and Invalidation Mechanics.

---

## 1. Context & Problem Statement

In TanStack Query applications, cache entries are identified by query keys. When developers pass arbitrary inline string arrays across different components and hooks:
1. **Typo Bugs:** Subtle mismatches (e.g. `['items']` in `useQuery` vs `['item']` in `invalidateQueries`) fail silently, leaving stale data in the cache.
2. **Brittle Invalidation:** Inability to invalidate all filtered variations of a collection without inadvertently purging individual detail caches.
3. **High Maintenance Overhead:** Restructuring a cache key requires searching and replacing arbitrary string literals across dozens of files.

---

## 2. Decision

We mandate that **every feature must export a single, centralized query key factory object** following the standard TkDodo pattern:

```javascript
// src/lib/hooks/use<Feature>.js (or colocated queryKeys.js)
export const featureKeys = {
   all: ['<feature>'],
   lists: () => [...featureKeys.all, 'list'],
   list: (filters = {}) => [...featureKeys.lists(), { filters }],
   details: () => [...featureKeys.all, 'detail'],
   detail: (id) => [...featureKeys.details(), id],
};
```

### Hierarchy Rules:
1. **`all`:** Root feature namespace array.
2. **`lists()`:** Base array for all collection queries under this feature.
3. **`list(filters)`:** Specific collection with filter, sorting, or pagination parameters.
4. **`details()`:** Base array for all single-entity detail queries.
5. **`detail(id)`:** Specific record cache identified by primary key or slug.

### Invalidation Invariants:
* **Collection Refresh:** After a mutation that creates or re-orders items, invalidate collection lists:
  `queryClient.invalidateQueries({ queryKey: featureKeys.lists() });`
* **Single Record Refresh:** After updating a specific entity, invalidate its specific detail cache:
  `queryClient.invalidateQueries({ queryKey: featureKeys.detail(id) });`
* **Full Feature Purge:** On major updates or deletions, invalidate the entire feature tree:
  `queryClient.invalidateQueries({ queryKey: featureKeys.all });`
* **Inline Arrays Banned:** Passing ad-hoc arrays like `queryKey: ['items']` directly into `useQuery` or `useMutation` is strictly forbidden.

---

## 3. Consequences

### Positive:
* **Type Safety in Pure JS:** Autocomplete and centralized references eliminate cache mismatch bugs without needing TypeScript.
* **Granular Control:** Precise hierarchical invalidation without flushing unrelated caches.
* **Centralized Maintenance:** Cache keys can be renamed or modified in a single location.

### Negative:
* Developers must create and export the `featureKeys` factory before writing their first `useQuery` hook for a new feature.
