# Caching Rules & Mutation Lifecycles

---

## 1. The Fresh-by-Default Invariant (`staleTime: 0`)

By default, every TanStack Query in the application operates under **`staleTime: 0`**. 

```javascript
// Default QueryClient configuration:
const queryClient = new QueryClient({
   defaultOptions: {
      queries: {
         staleTime: 0, // Considered stale immediately
         gcTime: 5 * 60 * 1000, // Kept in garbage collection cache for 5 minutes
         refetchOnWindowFocus: true,
         retry: (failureCount, error) => {
            // Never retry client-side 4xx errors
            if (error?.response?.status >= 400 && error?.response?.status < 500) {
               return false;
            }
            return failureCount < 2;
         },
      },
   },
});
```

### Why Fresh by Default?
* Web applications interact with shared, multi-user backend databases. 
* Blanket caching causes users to see ghost states, out-of-stock items, or outdated order statuses.
* TanStack Query shows cached data instantly from memory while simultaneously validating in the background—giving users instant UI feedback without stale data risks.

---

## 2. The Two Caching Categories

| Category | Typical Entities | Permitted `staleTime` | Rules & Justification |
| :--- | :--- | :--- | :--- |
| **Transactional Data** | Cart, Orders, Checkout, Addresses, User Profiles, Balances | **Strictly `0`** | Must **never** be cached. Financial, inventory, and user transactions require 100% real-time accuracy. |
| **Static Reference Data** | Categories, Cuisines, Country Lists, Tax Brackets, Tags | **Opt-in: 5–10 mins** (`5 * 60 * 1000`) | Infrequently changed lookup tables. Eliminates redundant network traffic on frequent micro-navigations. |

### Opt-in Static Reference Example:
```javascript
export function useReferenceCategories() {
   return useQuery({
      queryKey: categoryKeys.lists(),
      queryFn: ({ signal }) => getCategories(signal),
      staleTime: 10 * 60 * 1000, // 10 minutes cache
      gcTime: 30 * 60 * 1000,    // 30 minutes garbage collection
   });
}
```

---

## 3. Standardized Mutation Lifecycles

Mutations mutate server state and must synchronize the local cache upon completion:

```javascript
// src/lib/hooks/useFeatureMutation.js
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createFeatureItem, updateFeatureItem, deleteFeatureItem } from '@/services/featureService';
import { featureKeys } from '@/lib/hooks/useFeature';
import { parseApiError } from '@/utils/apiError';
import { toast } from 'sonner'; // Or custom toast notification

export function useCreateFeature() {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: createFeatureItem,
      onSuccess: () => {
         toast.success('Created successfully.');
         // Hierarchically invalidate feature lists
         queryClient.invalidateQueries({ queryKey: featureKeys.lists() });
      },
      onError: (error) => {
         const parsed = parseApiError(error);
         if (parsed.status !== 422) {
            toast.error(parsed.message);
         }
      },
   });
}

export function useDeleteFeature() {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: deleteFeatureItem,
      onSuccess: () => {
         toast.success('Removed successfully.');
         queryClient.invalidateQueries({ queryKey: featureKeys.all });
      },
      onError: (error) => {
         const parsed = parseApiError(error);
         toast.error(parsed.message);
      },
   });
}
```

---

## 4. Optimistic Updates Invariants

Optimistic UI updates immediately reflect state changes in the UI before server confirmation. 

### Invariants:
1. **Permitted Only For:** Instant, non-destructive boolean toggles (e.g. favorite/bookmark toggle, simple counter).
2. **Forbidden For:** Resource creation, deletion, financial transactions, checkout, or multi-field updates.
3. **Mandatory Rollback:** Must always snapshot previous state in `onMutate` and restore it in `onError`.

```javascript
export function useToggleBookmark() {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: toggleBookmarkStatus,
      onMutate: async ({ id, isBookmarked }) => {
         // Cancel in-flight queries so they don't overwrite optimistic update
         await queryClient.cancelQueries({ queryKey: featureKeys.detail(id) });

         // Snapshot previous value
         const previousItem = queryClient.getQueryData(featureKeys.detail(id));

         // Optimistically update cache
         queryClient.setQueryData(featureKeys.detail(id), (old) => {
            if (!old) return old;
            return { ...old, is_bookmarked: isBookmarked };
         });

         return { previousItem, id };
      },
      onError: (err, newValues, context) => {
         // Roll back to previous snapshot on error
         if (context?.previousItem) {
            queryClient.setQueryData(featureKeys.detail(context.id), context.previousItem);
         }
         toast.error('Failed to update bookmark status.');
      },
      onSettled: (data, error, { id }) => {
         // Always re-sync with server state
         queryClient.invalidateQueries({ queryKey: featureKeys.detail(id) });
      },
   });
}
```
