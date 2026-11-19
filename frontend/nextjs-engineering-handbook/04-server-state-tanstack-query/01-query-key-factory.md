# TkDodo Query Key Factory

---

## 1. Why Hardcoded Query Keys are Forbidden

Passing inline string arrays directly to `useQuery` or `useMutation` is strictly forbidden:

```javascript
// ❌ Forbidden (Hardcoded, fragile strings):
const { data } = useQuery({
   queryKey: ['items', filterId],
   queryFn: () => getItems(filterId),
});

// Later in another file:
queryClient.invalidateQueries({ queryKey: ['item'] }); // ⚠️ Typo bug: cache never invalidates!
```

### The Pitfalls of Inline Keys:
1. **Typo Bugs:** Pluralization mismatches (`['items']` vs `['item']`) fail silently.
2. **Brittle Invalidation:** Inability to reliably invalidate all variations of a feature's lists without also blowing away detail caches.
3. **High Refactoring Cost:** Renaming or restructuring cache keys requires searching and replacing across dozens of files.

---

## 2. Centralized Query Key Factory Pattern

Following TkDodo's standardized query key factory architecture, every feature must export a single, hierarchical key factory object:

```javascript
// src/lib/hooks/use<Feature>.js (or a colocated queryKeys.js file)
export const featureKeys = {
   all: ['<feature>'],
   lists: () => [...featureKeys.all, 'list'],
   list: (filters = {}) => [...featureKeys.lists(), { filters }],
   details: () => [...featureKeys.all, 'detail'],
   detail: (id) => [...featureKeys.details(), id],
};
```

### Key Anatomy
* `featureKeys.all`: Root key for the entire feature namespace (e.g. `['items']`).
* `featureKeys.lists()`: Sub-scope for all collection queries (e.g. `['items', 'list']`).
* `featureKeys.list(filters)`: Specific collection with filter parameters (e.g. `['items', 'list', { filters: { page: 1, sort: 'desc' } }]`).
* `featureKeys.details()`: Sub-scope for all single-entity detail queries (e.g. `['items', 'detail']`).
* `featureKeys.detail(id)`: Specific single-entity record (e.g. `['items', 'detail', 42]`).

---

## 3. Hierarchical Cache Invalidation

Because keys are structured as arrays extending from general to specific, TanStack Query matches prefix keys hierarchically:

```javascript
import { useQueryClient } from '@tanstack/react-query';
import { featureKeys } from '@/lib/hooks/useFeature';

const queryClient = useQueryClient();

// 1. Invalidate EVERYTHING under the feature (all lists + all details):
queryClient.invalidateQueries({ queryKey: featureKeys.all });

// 2. Invalidate ALL list variations (search, paginated, filtered) while preserving detail caches:
queryClient.invalidateQueries({ queryKey: featureKeys.lists() });

// 3. Invalidate ONLY one specific detail record:
queryClient.invalidateQueries({ queryKey: featureKeys.detail(id) });
```

---

## 4. Canonical Hook Implementation (Tier 4)

Tier 4 custom hooks consume the factory keys and pass the TanStack `signal` directly into Tier 5 service functions:

```javascript
// src/lib/hooks/useFeature.js
import { useQuery } from '@tanstack/react-query';
import { getFeatureList, getFeatureDetail } from '@/services/featureService';

export const featureKeys = {
   all: ['features'],
   lists: () => [...featureKeys.all, 'list'],
   list: (filters = {}) => [...featureKeys.lists(), { filters }],
   details: () => [...featureKeys.all, 'detail'],
   detail: (id) => [...featureKeys.details(), id],
};

export function useFeatureList(filters = {}) {
   return useQuery({
      queryKey: featureKeys.list(filters),
      queryFn: ({ signal }) => getFeatureList(filters, signal),
      staleTime: 0, // Fresh by default
   });
}

export function useFeatureDetail(id) {
   return useQuery({
      queryKey: featureKeys.detail(id),
      queryFn: ({ signal }) => getFeatureDetail(id, signal),
      enabled: Boolean(id),
      staleTime: 0, // Fresh by default
   });
}
```

---

## 5. Live Search & Filter Input Debouncing

When connecting search inputs or live filter fields to TanStack Query, querying the backend on every single keystroke triggers multiple rapid API requests and creates race conditions.

### The Debounced Query Pattern
Wrap rapid input values with a 300ms debounce before passing them to the query key:

```javascript
// src/components/feature/FeatureSearch.jsx
'use client';

import { useState, useEffect } from 'react';
import { useFeatureList } from '@/lib/hooks/useFeature';
import { Input } from '@/components/ui/input';

export function FeatureSearch() {
   const [searchTerm, setSearchTerm] = useState('');
   const [debouncedSearch, setDebouncedSearch] = useState('');

   // 300ms debounce delay
   useEffect(() => {
      const handler = setTimeout(() => {
         setDebouncedSearch(searchTerm);
      }, 300);

      return () => clearTimeout(handler);
   }, [searchTerm]);

   // Query fires ONLY when user pauses typing:
   const { data: items, isFetching } = useFeatureList({ search: debouncedSearch });

   return (
      <div className="w-full max-w-sm">
         <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search items..."
         />
      </div>
   );
}
```

* **Outcome:** Eliminates 80% of unnecessary backend queries and prevents out-of-order race conditions.
