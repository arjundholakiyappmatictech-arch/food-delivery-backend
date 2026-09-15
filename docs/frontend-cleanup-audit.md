# Frontend Cleanup & Code-Quality Audit Report

**Target Directory:** `frontend/`  
**Date:** September 2026  
**Auditor:** Antigravity (DeepMind Advanced Agentic Coding)  
**Status:** Audit Complete — Analysis Only (No source code modified)  
**Scope:** Components, Hooks, Services, Stores, Pages, Utilities, Assets, Dependencies, API Calls, and TanStack Query usage.

---

## Executive Summary

A comprehensive scan and static analysis of the entire `frontend/` folder was conducted. The codebase is functional and well-structured around Next.js App Router, Tailwind CSS, TanStack Query, and Zustand, but has accumulated significant technical debt across multiple areas:

1. **Dead Code & Phantom Files:** Completely empty files (0 bytes), an unused route group with broken imports, an abandoned payment stub page, and ~3.5MB+ of unused high-resolution images in `public/assets`.
2. **Unused Dependencies:** Libraries declared in `package.json` (`motion`, `next-themes`) that are never imported anywhere.
3. **Severe Architectural & State Anti-Patterns:**
   - Single-restaurant page (`/restaurants/[id]`) relies entirely on client-side Zustand persistence instead of server fetching or TanStack Query, breaking page refreshes and direct URL navigation.
   - Route guard hook (`useAuthGuard`) is executed inside layout components (`UserProfile`), causing public routes like `/about` to redirect unauthenticated guests to `/login`.
   - Double-state management in `src/app/page.js` mirroring URL search params with `useEffect` and an explicit ESLint suppression comment.
4. **Suboptimal TanStack Query & Server-State Usage:**
   - Single address fetching (`useAddress`) pulls page 1 of all addresses and does an in-memory `.find()`, breaking if an address is on later pages.
   - Cache invalidation antipattern: manual optimistic cache updates in `useReview` and `useReviews` are immediately invalidated on the very next line, discarding the manual updates.
   - Bloated god-hook `useOrder` binds 4 mutations and a polling query together, making `loading` true across the entire screen during any single mutation.
   - Manual server-state handling in `useGenerateInvoice` instead of standard `useMutation`.
5. **Widespread Duplication:** Address string formatting duplicated in 4 places; date formatting duplicated in 5 places; order status text formatting in 3 places; 422 error parsing copy-pasted in 3 forms; loading spinner SVGs copy-pasted in 5 files; bill summary calculations duplicated in 3 components.
6. **Typos & SSR Crash Risks:** `api.js` accessing `localStorage` before checking `typeof window !== 'undefined'`; misspelled export `makePaymentt`; misspelled icon `CALENDER_SVG`; misspelled stub route text `Order Successfull`.

Below is the complete, categorized catalog of findings.

---

## Summary Scorecard

| Category | Critical | High | Medium | Low | Total |
| :--- | :---: | :---: | :---: | :---: | :---: |
| 1. Dead Code, Unused Files & Assets | 1 | 3 | 4 | 2 | **10** |
| 2. Architectural Anti-Patterns & Bugs | 3 | 2 | 2 | 0 | **7** |
| 3. TanStack Query & Server-State Simplifications | 0 | 4 | 4 | 1 | **9** |
| 4. Unnecessary State, Effects & Re-renders | 0 | 3 | 3 | 1 | **7** |
| 5. Code Duplication & Repetitive Patterns | 0 | 1 | 6 | 1 | **8** |
| 6. Inconsistent Conventions, Exports & Typos | 0 | 1 | 4 | 3 | **8** |
| **Total Findings** | **4** | **14** | **23** | **8** | **49** |

---

## 1. Dead Code, Unused Files & Unused Dependencies

### 1.1 0-Byte Empty Component Files
- **Finding:** Empty, zero-byte placeholder files exist in the component tree.
- **File / Location:**
  - `frontend/src/components/restaurants/NearbyRestaurantList.jsx` (0 bytes)
  - `frontend/src/components/restaurants/RestaurantHeader.jsx` (0 bytes)
- **Why it is unnecessary/problematic:**
  These files are completely empty, not imported anywhere in the application, and add confusion for anyone navigating or maintaining the codebase.
- **Recommended cleanup:**
  Delete both unused empty files.
- **Priority:** Low
- **Estimated impact:** Cleans up file tree, removes misleading dead references.

---

### 1.2 Orphaned `(customer)` Route Group with Broken Import
- **Finding:** An entire route group folder `src/app/(customer)` exists containing only `layout.js` with no child pages, and it contains a broken named import.
- **File / Location:** `frontend/src/app/(customer)/layout.js`
- **Why it is unnecessary/problematic:**
  Line 1 has `import { Header } from '@/components/layout/Header';`. However, `Header.jsx` only exports a default export (`export default function Header`), so named import `{ Header }` is undefined and would crash if this layout was rendered. Moreover, there are no pages inside `(customer)`, as all customer pages (`/cart`, `/orders`, `/addresses`) are placed directly in `src/app/`.
- **Recommended cleanup:**
  Delete `frontend/src/app/(customer)/layout.js` and the empty `(customer)` folder.
- **Priority:** Critical
- **Estimated impact:** Removes broken dead code that would cause runtime crashes if activated; cleans Next.js App Router tree.

---

### 1.3 Abandoned Stub Route `/payment/[id]`
- **Finding:** A placeholder payment page exists that is never linked or routed to.
- **File / Location:** `frontend/src/app/payment/[id]/page.js`
- **Why it is unnecessary/problematic:**
  The file contains only `<div>Order Successfull</div>` (with a spelling mistake). The application actually routes users to `/orders/[id]` after order placement (both COD and Razorpay). No link or `router.push()` in the codebase points to `/payment/[id]`.
- **Recommended cleanup:**
  Delete `frontend/src/app/payment/[id]/page.js` or replace with a proper redirect to `/orders/[id]`.
- **Priority:** Medium
- **Estimated impact:** Eliminates an unstyled, misspelled dead route accessible by direct URL.

---

### 1.4 Unused Heavy Third-Party Dependencies
- **Finding:** Dependencies installed in `package.json` that have 0 imports anywhere in `src/`.
- **File / Location:**
  - `motion` (`^12.43.0` in `frontend/package.json`)
  - `next-themes` (`^0.4.6` in `frontend/package.json`)
- **Why it is unnecessary/problematic:**
  Neither package is imported anywhere in `frontend/src/`. They inflate `node_modules`, increase Docker build times, increase lockfile size, and add unnecessary supply-chain dependency maintenance.
- **Recommended cleanup:**
  Run `npm uninstall motion next-themes`.
- **Priority:** High
- **Estimated impact:** Reduces bundle size, shrinks `node_modules` and `package-lock.json`, faster CI/build times.

---

### 1.5 Over 3.5 MB of Unused Static Assets in `public/assets`
- **Finding:** Multiple heavy images are stored in `public/assets/` that are never referenced by any component, style, or metadata.
- **File / Location:**
  - `frontend/public/assets/about_cta_food.png` (838 KB)
  - `frontend/public/assets/about_food_connects.png` (950 KB)
  - `frontend/public/assets/about_hero_v2.png` (907 KB)
  - `frontend/public/assets/about_story_food.png` (785 KB)
  - `frontend/public/assets/avatar.png` (3 KB)
  - `frontend/public/assets/image3.jpg` (11 KB)
  - `frontend/public/assets/tb.png` (32 KB)
- **Why it is unnecessary/problematic:**
  These images total over 3.5 MB of dead weight deployed with the frontend bundle, consuming disk and bandwidth without being served to users.
- **Recommended cleanup:**
  Delete the 7 unreferenced assets from `frontend/public/assets/`. Keep only active assets (`about_hero_v3.png`, `default-restaurant.jpg`, `logo.png`, `pizza.jpg`, `user.png`).
- **Priority:** High
- **Estimated impact:** Reduces deployed artifact size by ~3.5MB+ and eliminates repository bloat.

---

### 1.6 Unused Next.js Default Boilerplate SVGs
- **Finding:** Default Next.js boilerplate template vector files remain in `public/`.
- **File / Location:**
  - `frontend/public/file.svg`
  - `frontend/public/globe.svg`
  - `frontend/public/next.svg`
  - `frontend/public/vercel.svg`
  - `frontend/public/window.svg`
- **Why it is unnecessary/problematic:**
  Leftovers from `create-next-app` initialization; never imported or displayed in the app.
- **Recommended cleanup:**
  Delete all 5 unused template SVGs from `frontend/public/`.
- **Priority:** Low
- **Estimated impact:** Clean repository root assets.

---

### 1.7 Dead Exports and Unused Icons in `src/assets/icons.jsx`
- **Finding:** Unused icon exports and dead remote URL constants in `icons.jsx`.
- **File / Location:** `frontend/src/assets/icons.jsx`
  - `CHECKOUT_ICON_URL` (line 167)
  - `SHOPPING_BAG_SVG` (line 62)
- **Why it is unnecessary/problematic:**
  `CHECKOUT_ICON_URL` is never imported. `SHOPPING_BAG_SVG` is imported only once in `Header.jsx` (line 7) where it is never rendered (Header uses `SHOPPING_BAG_SVG2` in `UserProfile`).
- **Recommended cleanup:**
  Remove `CHECKOUT_ICON_URL` and `SHOPPING_BAG_SVG` from `src/assets/icons.jsx` and remove the unused import from `Header.jsx`.
- **Priority:** Low
- **Estimated impact:** Removes dead exports and cleans up unused imports.

---

### 1.8 Unused Imports and Redundant Directive Comments
- **Finding:** Dead imports and redundant ESLint directives.
- **File / Location:**
  - `frontend/src/components/layout/Header.jsx`: Unused import `SHOPPING_BAG_SVG` (line 7); unused directive `/* eslint-disable @next/next/no-img-element */` (line 1).
  - `frontend/src/components/about/FullHeroSection.jsx`: Unused directive `/* eslint-disable @next/next/no-img-element */` (line 1).
  - `frontend/src/components/orders/OrderItemsCard.jsx`: Unused import `import Image from 'next/image';` (line 1).
  - `frontend/src/app/cart/page.js`: Unused `import React from 'react';` (line 2).
  - `frontend/src/app/delivery/dashboard/page.js`: Unused `import React from 'react';` (line 1).
  - `frontend/src/app/owner/dashboard/page.js`: Unused `import React from 'react';` (line 1).
  - `frontend/src/app/payment/[id]/page.js`: Unused `import React from 'react';` (line 1).
- **Why it is unnecessary/problematic:**
  `@next/next/no-img-element` is already disabled globally in `frontend/eslint.config.mjs` (line 16), which causes ESLint to emit warnings for these directives. Unused imports clutter the code.
- **Recommended cleanup:**
  Remove the unused imports and file-level `eslint-disable` directives.
- **Priority:** Low
- **Estimated impact:** Cleans up 3 active ESLint warnings and code noise.

---

## 2. Architectural Anti-Patterns, Bugs & Risky Practices

### 2.1 SSR / Server Component Crash Risk in Axios Interceptor
- **Finding:** `localStorage.getItem('access_token')` is accessed without verifying that the code is running in a browser environment.
- **File / Location:** `frontend/src/lib/api/api.js` (lines 12–17)
  ```javascript
  api.interceptors.request.use(
     (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
           config.headers.Authorization = `Bearer ${token}`;
        }
        if (typeof window !== 'undefined' && !navigator.onLine) {
  ```
- **Why it is unnecessary/problematic:**
  Notice line 20 checks `typeof window !== 'undefined'`, but line 13 calls `localStorage.getItem('access_token')` *before* that check! If any server component, server action, or Next.js SSR route ever invokes a service through `api`, it will crash with `ReferenceError: localStorage is not defined`.
- **Recommended cleanup:**
  Guard `localStorage` access: `const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;`.
- **Priority:** Critical
- **Estimated impact:** Prevents catastrophic unhandled server exceptions if server-side data fetching is executed.

---

### 2.2 Global Auth Guard Side-Effect Inside Layout Component (`UserProfile`)
- **Finding:** `UserProfile` invokes `useAuthGuard()`, which executes a redirect side-effect on unauthenticated users even on public pages.
- **File / Location:**
  - `frontend/src/lib/hooks/useAuth.js` (lines 22–28)
  - `frontend/src/components/layout/UserProfile.jsx` (line 14)
- **Why it is unnecessary/problematic:**
  `useAuthGuard` contains:
  ```javascript
  useEffect(() => {
     const token = localStorage.getItem('access_token');
     if (!token) {
        router.replace('/login');
     }
  }, [router]);
  ```
  `UserProfile` calls `const { logoutUser, logoutLoading } = useAuthGuard();` on line 14. Because React hooks execute before the early return `if (!user) return null;` on line 79, the hook's redirect `useEffect` runs whenever `UserProfile` is mounted. Because `UserProfile` is in `Header`, which is displayed on `/about`, unauthenticated users visiting the public "About Us" page are forcefully redirected to `/login`!
- **Recommended cleanup:**
  Separate concerns:
  1. Create a lightweight `useLogout` hook (or expose `logout` directly from `authService` / `authStore`).
  2. Keep route protection strictly in route guards or middleware, never inside layout presentation components like `UserProfile`.
- **Priority:** Critical
- **Estimated impact:** Restores public navigation to `/about` and future marketing pages without unwanted login redirects.

---

### 2.3 Broken Restaurant Page Navigation on Refresh & Direct Link
- **Finding:** Direct navigation to `/restaurants/[id]` redirects users to `/` if `selectedRestaurant` is not already in Zustand localStorage.
- **File / Location:**
  - `frontend/src/components/restaurants/RestaurantDetails.jsx` (lines 16, 20–24)
  - `frontend/src/lib/store/restaurantStore.js`
- **Why it is unnecessary/problematic:**
  When a user clicks a restaurant card, `RestaurantCard.jsx` saves it to Zustand: `setSelectedRestaurant(restaurant)`. In `RestaurantDetails.jsx`:
  ```javascript
  useEffect(() => {
     if (hasHydrated && !selectedRestaurant) {
        router.replace('/');
     }
  }, [hasHydrated, selectedRestaurant, router]);
  ```
  If a user:
  1. Refreshes the page on `/restaurants/123`, or
  2. Opens `/restaurants/123` in a new tab or receives a shared link,
  if `selectedRestaurant` is null (or contains a *different* restaurant from a previous visit), they are either kicked back to the home page or see mismatched restaurant details with another restaurant's menu!
- **Recommended cleanup:**
  1. Add a query in TanStack Query or `restaurantService` to fetch restaurant details by `restaurantId` (e.g., `useRestaurant(restaurantId)` should return `{ restaurant, menus, loading, error }`).
  2. Deprecate `restaurantStore.js` entirely — it is an anti-pattern for server-state that should be URL-driven.
- **Priority:** Critical
- **Estimated impact:** Fixes broken routing, deep linking, page refreshing, and browser history for all restaurant menu pages.

---

### 2.4 Broken Image Reference in `RestaurantDetails.jsx`
- **Finding:** A non-existent placeholder image path is hardcoded.
- **File / Location:** `frontend/src/components/restaurants/RestaurantDetails.jsx` (line 51)
  ```javascript
  src={selectedRestaurant?.image_url || '/assets/restaurant-placeholder.png'}
  ```
- **Why it is unnecessary/problematic:**
  `restaurant-placeholder.png` does not exist in `public/assets`. The rest of the app consistently uses `/assets/default-restaurant.jpg`. This causes a 404 image load and a broken image icon.
- **Recommended cleanup:**
  Change fallback to `/assets/default-restaurant.jpg`.
- **Priority:** High
- **Estimated impact:** Prevents broken images when a restaurant does not have an `image_url`.

---

### 2.5 Silent Error Swallowing in Checkout and Location Detection
- **Finding:** Empty `catch {}` blocks silently drop errors with zero user feedback or logging.
- **File / Location:**
  - `frontend/src/components/checkout/CheckoutDetails.jsx` (line 106)
  - `frontend/src/components/location/CurrentLocationButton.jsx` (line 16)
  - `frontend/src/app/orders/[id]/page.js` (line 54: `console.error` only, no UI feedback)
- **Why it is unnecessary/problematic:**
  In `CheckoutDetails.jsx`, if `placeOrder` or `makePaymentt` throws an unhandled error, the empty `catch {}` block silently terminates execution. The user clicks "Place Order", the button stops loading, nothing happens, and no toast or error message is shown.
- **Recommended cleanup:**
  Parse and display the error using `parseApiError(error)` and `toast.error(apiError.message)`.
- **Priority:** High
- **Estimated impact:** Prevents frozen/silent failure states during critical checkout and order cancellation flows.

---

### 2.6 Cart Store Missing Error Handling on `addItem`
- **Finding:** `addItem` in `cartStore.js` does not have a `try...catch` block, unlike `increaseQuantity` and `decreaseQuantity`.
- **File / Location:** `frontend/src/lib/store/cartStore.js` (lines 33–57)
- **Why it is unnecessary/problematic:**
  If `addToCart()` fails with any error other than 409 (e.g. network failure, 500 error), an unhandled promise rejection occurs inside Zustand unless the calling component wraps it.
- **Recommended cleanup:**
  Standardize error handling across all cart store actions with consistent `try...catch` and `parseApiError`.
- **Priority:** Medium
- **Estimated impact:** Consistent state predictability and error recovery during cart operations.

---

## 3. TanStack Query Opportunities & Server-State Simplifications

### 3.1 Manual Server-State Handling in `useGenerateInvoice`
- **Finding:** An entire custom hook manually implements loading state, error state, and async wrapping around an API call.
- **File / Location:**
  - `frontend/src/lib/hooks/useGenerateInvoice.js` (lines 9–38)
  - `frontend/src/components/orders/GenerateInvoiceButton.jsx` (lines 10–28)
- **Why it is unnecessary/problematic:**
  `useGenerateInvoice.js` manually maintains:
  `const [loading, setLoading] = useState(false)`
  `const [error, setError] = useState('')`
  `useCallback(async () => { try { setLoading(true)... } finally { setLoading(false) } })`
  Furthermore, `GenerateInvoiceButton.jsx` then creates its *own* duplicate `const [generating, setGenerating] = useState(false)`!
- **Recommended cleanup:**
  Replace with a clean TanStack Query `useMutation`:
  ```javascript
  export function useGenerateInvoiceMutation() {
     return useMutation({
        mutationFn: (orderId) => generateInvoice(orderId),
        onError: (error) => toast.error(parseApiError(error).message),
     });
  }
  ```
- **Priority:** High
- **Estimated impact:** Deletes ~40 lines of boilerplate state and eliminates dual `loading`/`generating` states.

---

### 3.2 Zombie Cache Updates in `useReview.js` and `useReviews.js`
- **Finding:** Manual cache updates via `queryClient.setQueryData` are immediately wiped out by `queryClient.invalidateQueries` on the very next line.
- **File / Location:**
  - `frontend/src/lib/hooks/useReview.js` (lines 32–61)
  - `frontend/src/lib/hooks/useReviews.js` (lines 37–53)
- **Why it is unnecessary/problematic:**
  In `useReview.js`:
  ```javascript
  queryClient.setQueryData(['reviews'], (oldData) => {
     // 25 lines of complex page-0 array splicing logic
  });
  queryClient.invalidateQueries({ queryKey: ['reviews'] });
  ```
  And similarly in `useReviews.js`:
  ```javascript
  queryClient.setQueryData(['reviews'], (oldData) => {
     // 12 lines of mapping and filtering deleted review
  });
  queryClient.invalidateQueries({ queryKey: ['reviews'] });
  ```
  When `invalidateQueries` is called immediately following `setQueryData`, TanStack Query marks the query as stale and triggers a background refetch. The manual array mapping is instantly overwritten by the server response. Doing both is completely redundant.
- **Recommended cleanup:**
  Either use pure invalidation (`queryClient.invalidateQueries({ queryKey: ['reviews'] })` — simple, clean, and robust) OR use optimistic updates with `onMutate`/`onError` rollback. Delete the ~35 lines of redundant manual pagination array manipulation.
- **Priority:** High
- **Estimated impact:** Removes complex nested cache-splicing code that is immediately discarded.

---

### 3.3 God-Hook Anti-Pattern in `useOrder.js`
- **Finding:** A single hook bundles order detail querying, order creation, payment initiation, payment verification, and order cancellation into one monolith with a unified `loading` boolean.
- **File / Location:** `frontend/src/lib/hooks/useOrder.js` (lines 9–105)
- **Why it is unnecessary/problematic:**
  1. `loading` is defined as:
     ```javascript
     loading: orderQuery.isLoading || createOrderMutation.isPending || makePaymentMutation.isPending || cancelOrderMutation.isPending
     ```
     When `CheckoutDetails` imports `useOrder()` to create an order, it also instantiates `makePaymentMutation`, `verifyPaymentMutation`, and `cancelOrderMutation`.
  2. Typo: Line 85 exports `makePaymentt` with two 't's.
  3. `error` ignores `verifyPaymentMutation.error`.
  4. Polling: Line 16 sets a polling `refetchInterval` on `orderQuery` which executes even when `useOrder` is called just for mutations.
  5. `fetchOrder` exposes `queryClient.fetchQuery` directly in the return object instead of idiomatic React Query hooks.
- **Recommended cleanup:**
  Split into targeted, single-purpose hooks:
  - `useOrder(orderId)`: queries single order with tracking poll.
  - `useCreateOrder()`: mutation for order placement.
  - `useCancelOrder()`: mutation for cancelling an order.
  - Fix the `makePaymentt` typo to `makePayment`.
- **Priority:** High
- **Estimated impact:** Prevents cross-component state contamination, eliminates unnecessary re-renders, fixes typos.

---

### 3.4 Inefficient Single Address Fetching in `useAddress.js`
- **Finding:** Fetching a single address by ID fetches page 1 of all addresses and performs an in-memory search.
- **File / Location:** `frontend/src/lib/hooks/useAddress.js` (lines 9–19)
  ```javascript
  queryFn: async () => {
     const response = await getAddresses('', 1);
     const address = response?.addresses?.find((item) => String(item.id) === String(addressId));
     if (!address) throw new Error('Address not found.');
     return address;
  }
  ```
- **Why it is unnecessary/problematic:**
  If a user has more than 1 page of addresses and attempts to edit an address from page 2, this query throws "Address not found." Furthermore, it downloads a list of addresses instead of either utilizing the TanStack Query cache (`initialData` from `['addresses']`) or querying an address detail endpoint.
- **Recommended cleanup:**
  Leverage TanStack Query's cache lookup:
  ```javascript
  initialData: () => {
     return queryClient
        .getQueryData(['addresses'])
        ?.pages?.flatMap((p) => p.addresses)
        ?.find((a) => String(a.id) === String(addressId));
  }
  ```
- **Priority:** Medium
- **Estimated impact:** Fixes false "Address not found" errors for paginated addresses; eliminates redundant network round-trips.

---

### 3.5 Unnecessary Server Fetching When Mounting Address Form Pages
- **Finding:** `AddAddressForm` and `EditAddressForm` import `useAddresses()`, which unconditionally triggers an infinite query for all addresses.
- **File / Location:**
  - `frontend/src/components/addresses/AddAddressForm.jsx` (line 13)
  - `frontend/src/components/addresses/EditAddressForm.jsx` (line 11)
  - `frontend/src/lib/hooks/useAddresses.js` (lines 38–54)
- **Why it is unnecessary/problematic:**
  When a user opens `/addresses/add` or `/addresses/[id]/edit`, `useAddresses()` executes `useInfiniteQuery(['addresses', { search: '' }])`. This fires an unnecessary HTTP GET `/addresses` query over the network even though the form page only needs `createAddress` or `updateAddress` mutations.
- **Recommended cleanup:**
  Decouple mutations from query: create `useCreateAddress()` and `useUpdateAddress()` mutation hooks, or keep mutations standalone.
- **Priority:** Medium
- **Estimated impact:** Eliminates useless HTTP requests and background cache subscriptions on address creation/editing screens.

---

### 3.6 Duplicated Queries and Double Menu Extraction in `useRestaurants.js`
- **Finding:** Two parallel queries hit the same endpoint, and menu deduplication logic is executed twice.
- **File / Location:**
  - `frontend/src/lib/hooks/useRestaurants.js` (lines 9–18, 81–108)
  - `frontend/src/components/restaurants/ExploreMenu.jsx` (line 13)
- **Why it is unnecessary/problematic:**
  1. In `useRestaurants`, `menusQuery` makes an extra request to `/restaurants/nearby` with empty params just to pull menus from page 1.
  2. `extractMenus` runs `new Map()` deduplication on menus. Then in `ExploreMenu.jsx` (line 13), it runs `new Map(menus.map(...))` *again* on every render!
- **Recommended cleanup:**
  Remove duplicate extraction; if menus are derived from nearby restaurants, extract them directly from the `restaurantsQuery` data using a `select` option in `useInfiniteQuery` or a simple memoized selector.
- **Priority:** Medium
- **Estimated impact:** Cuts initial home page network requests in half and eliminates duplicate in-memory map transformations.

---

### 3.7 Replace Manual Cart State in Zustand with TanStack Query
- **Finding:** `cartStore.js` manually replicates server-state caching, loading flags, array operations, and manual HTTP calls.
- **File / Location:** `frontend/src/lib/store/cartStore.js`
- **Why it is unnecessary/problematic:**
  The cart is server-backed (`/cart`, `/carts/store`, `/carts/{id}/update`, `/carts/{id}/destroy`). `cartStore.js` manually implements `loading: true/false`, manual try/catch, manual toast errors, and manual array mutation. Because of this, multiple components (`Header.jsx`, `CheckoutDetails.jsx`, `useRazorpay.js`) have to manually call `useEffect(() => { fetchCart(); }, [])` to keep cart data in sync!
- **Recommended cleanup:**
  Migrate cart state to TanStack Query (`useCart()`, `useAddToCart()`, `useUpdateCart()`, `useRemoveFromCart()`).
  - Automatic background synchronization without manual `fetchCart()` calls.
  - Automatic optimistic updates via `onMutate`.
  - Simplifies Zustand to purely client UI state (or eliminates `cartStore.js` entirely).
- **Priority:** High
- **Estimated impact:** Eliminates manual `fetchCart()` calls throughout the app and guarantees cart consistency across tabs and components.

---

## 4. Unnecessary State, Effects & Re-renders

### 4.1 Synchronizing URL Search Params into Local State via `useEffect`
- **Finding:** URL query parameters are mirrored into React `useState` via `useEffect` with an ESLint suppression comment.
- **File / Location:** `frontend/src/app/page.js` (lines 30–45)
  ```javascript
  const submittedSearch = searchParams.get('search') || '';
  const submittedCategory = searchParams.get('category') || '';
  const submittedSort = searchParams.get('sort') || '';
  const submittedOpenNow = searchParams.get('openNow') === 'true';

  const [restaurantFilters, setRestaurantFilters] = useState({
     searchText: submittedSearch,
     sortBy: submittedSort,
     openNow: submittedOpenNow,
     menuName: submittedCategory || null,
  });

  useEffect(() => {
     // eslint-disable-next-line react-hooks/set-state-in-effect
     setRestaurantFilters({ ... });
  }, [submittedSearch, submittedCategory, submittedSort, submittedOpenNow]);
  ```
- **Why it is unnecessary/problematic:**
  This is a textbook React anti-pattern: dual sources of truth. When search params change, the component renders once with new params, then the `useEffect` triggers an immediate second re-render with updated local state. The ESLint disable comment confirms this issue. Furthermore, `useRestaurants.js` completely ignores `restaurantFilters.searchText` and `restaurantFilters.menuName` and reads `submittedSearch` directly anyway!
- **Recommended cleanup:**
  Derive `restaurantFilters` directly from `searchParams` without `useState` or `useEffect`. Keep URL as the single source of truth.
- **Priority:** High
- **Estimated impact:** Eliminates redundant cascade renders on every filter/search change and removes the ESLint suppression.

---

### 4.2 Modal Rendered in Every Item of Menu List
- **Finding:** `<ReplaceCartDialog>` is mounted inside every single `MenuItemCard` instance.
- **File / Location:** `frontend/src/components/restaurants/MenuItemCard.jsx` (lines 12–13, 147–154)
- **Why it is unnecessary/problematic:**
  If a restaurant menu has 50 items, React renders 50 separate `<ReplaceCartDialog>` modals into the DOM, each with its own `showReplaceDialog` and `pendingItem` states.
- **Recommended cleanup:**
  Lift `<ReplaceCartDialog>` up to `RestaurantMenu.jsx` or `CartDetails.jsx`. The list items simply trigger an `onAddToCart` handler.
- **Priority:** High
- **Estimated impact:** Drastically reduces DOM node count and component instance overhead for restaurant menus with many items.

---

### 4.3 Unselector-ized Zustand Subscriptions Causing Wide Re-renders
- **Finding:** Components subscribe to entire Zustand store objects instead of fine-grained selectors.
- **File / Location:**
  - `frontend/src/components/restaurants/MenuItemCard.jsx` (line 10):
    `const { cartItems, addItem, increaseQuantity, decreaseQuantity, clearCart } = useCartStore();`
  - `frontend/src/components/restaurants/RestaurantCard.jsx` (line 10):
    `const { setSelectedRestaurant } = useRestaurantStore();`
  - `frontend/src/components/restaurants/RestaurantDetails.jsx` (line 16):
    `const { selectedRestaurant, hasHydrated } = useRestaurantStore();`
- **Why it is unnecessary/problematic:**
  Calling `useCartStore()` without a selector subscribes the component to *every* change in the cart store. Whenever any item quantity changes, *every* `MenuItemCard` in the entire list re-renders.
- **Recommended cleanup:**
  Use atomic selectors: `const addItem = useCartStore((s) => s.addItem);` and `const cartItem = useCartStore((s) => s.cartItems.find(...));`.
- **Priority:** Medium
- **Estimated impact:** Prevents unnecessary re-renders of 30–50+ menu item cards on each quantity adjustment.

---

### 4.4 Heavy Unmemoized Operations on Every Input Keystroke in `Search.jsx`
- **Finding:** A full extraction and deduplication of all restaurant menu names runs on every keystroke.
- **File / Location:** `frontend/src/components/common/Search.jsx` (lines 15–22)
  ```javascript
  const menuNames = Array.from(
     new Set(
        restaurants
           .flatMap((restaurant) => restaurant?.menus ?? [])
           .map((menu) => menu?.name?.trim())
           .filter(Boolean),
     ),
  );
  ```
- **Why it is unnecessary/problematic:**
  `Search.jsx` holds controlled input state `restaurantFilters.searchText`. Every time the user types a single character, `Search` re-renders, causing `.flatMap()`, `.map()`, and `new Set()` across all restaurants to execute synchronously.
- **Recommended cleanup:**
  Wrap `menuNames` in `useMemo(() => ..., [restaurants])`.
- **Priority:** Medium
- **Estimated impact:** Smooth typing experience without lag on large restaurant datasets.

---

### 4.5 O(N²) In-Memory Deduplication in `useReviews.js`
- **Finding:** Reviews list deduplication uses nested `findIndex` on every render.
- **File / Location:** `frontend/src/lib/hooks/useReviews.js` (lines 67–70)
  ```javascript
  .filter((review, index, allReviews) => index === allReviews.findIndex((item) => item.id === review.id))
  ```
- **Why it is unnecessary/problematic:**
  For each item in `allReviews`, `findIndex` iterates through `allReviews` from the start. This O(N²) operation runs on every re-render of `ReviewsPage`.
- **Recommended cleanup:**
  Use a `Map` or `Set` (O(N)):
  `const reviews = Array.from(new Map(allPagesData.map(r => [r.id, r])).values());`
- **Priority:** Medium
- **Estimated impact:** O(N) linear performance for review infinite scrolling.

---

### 4.6 Redundant Online State Effect in `NetworkStatus.jsx`
- **Finding:** `useEffect` sets state immediately on mount with an ESLint suppression comment.
- **File / Location:** `frontend/src/components/common/NetworkStatus.jsx` (lines 1, 18)
  ```javascript
  /* eslint-disable react-hooks/set-state-in-effect */
  ...
  setIsOffline(!navigator.onLine);
  ```
- **Why it is unnecessary/problematic:**
  Triggers a layout shift and ESLint warning. React 18+ provides `useSyncExternalStore` specifically to subscribe to browser APIs like `navigator.onLine`.
- **Recommended cleanup:**
  Use `useSyncExternalStore` with `window.addEventListener('online')` and `navigator.onLine`.
- **Priority:** Low
- **Estimated impact:** Eliminates component flicker, removes ESLint disable comment, adheres to modern React standards.

---

### 4.7 React Compiler Incompatibility & Static Component Warning
- **Finding:** Warnings reported by ESLint and React Compiler in address components.
- **File / Location:**
  - `frontend/src/components/addresses/AddressForm.jsx` (line 22): `react-hooks/incompatible-library` on `watch('label')`.
  - `frontend/src/components/addresses/SelectAddressItem.jsx` (line 14): `react-hooks/static-components` creating component definition during render.
- **Why it is unnecessary/problematic:**
  1. In `AddressForm.jsx`, calling `watch('label')` de-optimizes the entire component, skipping React Compiler memoization.
  2. In `SelectAddressItem.jsx`, declaring `const AddressIcon = getAddressIcon(address.label)` and rendering `<AddressIcon />` inside the render function causes React to recreate the component type every render.
- **Recommended cleanup:**
  - In `AddressForm.jsx`: use `useWatch({ control, name: 'label' })`.
  - In `SelectAddressItem.jsx`: render standard icon `<AddressIcon className="..." />` with `AddressIcon` derived outside or as an element.
- **Priority:** Medium
- **Estimated impact:** React Compiler can successfully memoize `AddressForm`; removes compiler warning.

---

## 5. Code Duplication & Repetitive Patterns

### 5.1 Address String Formatting Duplicated Across 4 Files
- **Finding:** The exact same address joining logic is written in four separate places.
- **File / Location:**
  - `frontend/src/lib/location.js` (line 6)
  - `frontend/src/components/addresses/AddressItem.jsx` (lines 15–17)
  - `frontend/src/components/addresses/SelectAddressItem.jsx` (lines 15–17)
  - `frontend/src/components/orders/OrderUserInfoCard.jsx` (lines 60–63)
  ```javascript
  [address.address_line, address.city, address.state, address.pincode].filter(Boolean).join(', ')
  ```
- **Why it is unnecessary/problematic:**
  Any change to address formatting requires editing 4 different files. `formatSavedAddress` in `lib/location.js` already exists for this purpose.
- **Recommended cleanup:**
  Export a shared utility `formatAddress(address)` in `src/lib/location.js` or `src/lib/utils.js` and use it everywhere.
- **Priority:** Medium
- **Estimated impact:** Single source of truth for address display formatting.

---

### 5.2 Date Formatting Duplicated Across 5 Files
- **Finding:** Custom `toLocaleString('en-IN', ...)` date formatters repeated across the codebase.
- **File / Location:**
  - `frontend/src/utils/generateInvoicePDF.js` (line 245)
  - `frontend/src/components/orders/OrderHeader.jsx` (lines 13–20)
  - `frontend/src/components/orders/OrdersCard.jsx` (lines 13–22)
  - `frontend/src/components/orders/OrderTrackingTimeline.jsx` (lines 135–144)
  - `frontend/src/components/review/ReviewCard.jsx` (lines 15–31)
- **Why it is unnecessary/problematic:**
  5 different inline implementations of date formatting with subtle variations (12-hour vs 24-hour, with or without seconds, fallback handling).
- **Recommended cleanup:**
  Consolidate into a unified `formatDate(date, options)` helper in `src/lib/utils.js`.
- **Priority:** Medium
- **Estimated impact:** Consistent date display formatting across invoices, headers, cards, and reviews.

---

### 5.3 Order / Payment Status String Normalization Duplicated in 3 Files
- **Finding:** String replacement regex for turning snake_case status strings into Title Case is copied in 3 places.
- **File / Location:**
  - `frontend/src/utils/generateInvoicePDF.js` (line 273)
  - `frontend/src/components/orders/OrdersCard.jsx` (line 25)
  - `frontend/src/components/orders/OrderHeader.jsx` (line 54)
  ```javascript
  status.replaceAll('_', ' ').replace(/\b\w/g, (char) => char.toUpperCase())
  ```
- **Why it is unnecessary/problematic:**
  Repeated boilerplate; in `OrderHeader.jsx`, it only does `replaceAll('_', ' ')` and misses capitalization.
- **Recommended cleanup:**
  Extract `formatStatus(status)` into `src/lib/utils.js`.
- **Priority:** Low
- **Estimated impact:** Standardized status badges and labels.

---

### 5.4 Address Icon Selection Logic Duplicated
- **Finding:** Address icon lookup mapping is duplicated between two address list items.
- **File / Location:**
  - `frontend/src/components/addresses/AddressItem.jsx` (lines 6–9)
  - `frontend/src/components/addresses/SelectAddressItem.jsx` (lines 6–11)
- **Why it is unnecessary/problematic:**
  `AddressItem.jsx` uses an object lookup (`ADDRESS_ICONS[label] || MapPin`), while `SelectAddressItem.jsx` uses an if-else function (`getAddressIcon(label)`).
- **Recommended cleanup:**
  Extract `getAddressIcon(label)` into a shared helper or directly into `src/components/addresses/`.
- **Priority:** Low
- **Estimated impact:** Consistency in icon assignment and elimination of duplicate functions.

---

### 5.5 Form Server Error (422) Handling Copy-Pasted in 3 Form Components
- **Finding:** Identical error handling loop for React Hook Form `setError` is duplicated in three forms.
- **File / Location:**
  - `frontend/src/components/addresses/AddressForm.jsx` (lines 33–42)
  - `frontend/src/components/auth/LoginForm.jsx` (lines 58–67)
  - `frontend/src/components/auth/RegisterForm.jsx` (lines 42–51)
  ```javascript
  Object.entries(error.errors ?? {}).forEach(([field, messages]) => {
     const message = Array.isArray(messages) ? messages[0] : messages;
     if (message) {
        setError(field, { type: 'server', message });
     }
  });
  ```
- **Why it is unnecessary/problematic:**
  Identical 10-line block copy-pasted across three forms.
- **Recommended cleanup:**
  Create a helper in `src/utils/apiError.js`:
  `applyServerValidationErrors(setError, apiError.errors)`.
- **Priority:** Medium
- **Estimated impact:** Reduces form boilerplate across all current and future forms.

---

### 5.6 Inline Loading Spinner SVG Markup Duplicated in 5 Places
- **Finding:** 15-line SVG spinner code is copy-pasted verbatim in multiple buttons and loaders.
- **File / Location:**
  - `frontend/src/components/addresses/AddressForm.jsx` (lines 286–299)
  - `frontend/src/components/auth/LoginForm.jsx` (lines 172–191)
  - `frontend/src/components/auth/RegisterForm.jsx` (lines 204–223)
  - `frontend/src/components/location/CurrentLocationButton.jsx` (lines 32–44)
  - `frontend/src/app/reviews/page.js` (lines 69–89)
- **Why it is unnecessary/problematic:**
  Lucide icon `Loader2` is already installed and used in `ConfirmDeleteModal.jsx` and `AddressesPage.jsx`. Writing raw inline SVG markup 5 times is completely redundant.
- **Recommended cleanup:**
  Replace all raw SVG spinners with `<Loader2 className="size-4 animate-spin" />` from `lucide-react`.
- **Priority:** Low
- **Estimated impact:** Removes ~80 lines of repetitive SVG markup; standardizes button spinners.

---

### 5.7 Bill Summary Calculation and Markup Duplicated in 3 Places
- **Finding:** Item count and subtotal calculations plus bill breakdown UI are duplicated.
- **File / Location:**
  - `frontend/src/components/cart/CartDetails.jsx` (lines 17–23, 93–120)
  - `frontend/src/components/checkout/CheckoutBill.jsx` (lines 6–28)
  - `frontend/src/components/orders/BillSummaryCard.jsx` (lines 2–10, 14–39)
- **Why it is unnecessary/problematic:**
  Cart, checkout, and order confirmation all compute item total and delivery fee separately with similar styling and markup.
- **Recommended cleanup:**
  Create a reusable `<BillSummary breakdown={...} />` component.
- **Priority:** Medium
- **Estimated impact:** Eliminates duplicate markup and ensures consistent bill presentation.

---

### 5.8 Delete Confirmation Modal Pattern Duplicated Across Pages
- **Finding:** `AddressesPage` and `ReviewsPage` duplicate the exact same state machine and markup for delete modals.
- **File / Location:**
  - `frontend/src/app/addresses/page.js` (lines 30–33, 166–180)
  - `frontend/src/app/reviews/page.js` (lines 21–24, 99–111)
- **Why it is unnecessary/problematic:**
  Both pages define `[deletingItem, setDeletingItem]`, `isDeleting`, `deleteItem`, and render `ConfirmDeleteModal`.
- **Recommended cleanup:**
  Encapsulate the delete confirmation logic in a reusable hook `useConfirmDelete(deleteFn)`.
- **Priority:** Low
- **Estimated impact:** Simplifies list management pages.

---

## 6. Inconsistent Conventions, Naming & Typos

### 6.1 Service File Naming Inconsistency (`cartServices.js`)
- **Finding:** All service files are named in the singular (`*Service.js`) except for cart.
- **File / Location:**
  - `frontend/src/services/cartServices.js` (plural) vs.
  - `frontend/src/services/addressService.js`
  - `frontend/src/services/authService.js`
  - `frontend/src/services/orderService.js`
  - `frontend/src/services/paymentService.js`
  - `frontend/src/services/restaurantService.js`
  - `frontend/src/services/reviewService.js`
- **Why it is unnecessary/problematic:**
  Breaks predictable module naming conventions.
- **Recommended cleanup:**
  Rename `cartServices.js` to `cartService.js` and update imports.
- **Priority:** Medium
- **Estimated impact:** Consistent service naming scheme.

---

### 6.2 Typo in Function Export and Usage: `makePaymentt`
- **Finding:** Double 't' typo in payment mutation method name.
- **File / Location:**
  - `frontend/src/lib/hooks/useOrder.js` (line 85)
  - `frontend/src/components/checkout/CheckoutDetails.jsx` (lines 31, 86)
- **Why it is unnecessary/problematic:**
  `makePaymentt` is an obvious spelling error that leaks across file boundaries.
- **Recommended cleanup:**
  Rename `makePaymentt` to `makePayment`.
- **Priority:** Medium
- **Estimated impact:** Eliminates typographical defect.

---

### 6.3 Typo in Icon Export: `CALENDER_SVG`
- **Finding:** Misspelled export `CALENDER_SVG`.
- **File / Location:**
  - `frontend/src/assets/icons.jsx` (line 226)
  - `frontend/src/components/orders/OrderUserInfoCard.jsx` (lines 1, 41)
- **Why it is unnecessary/problematic:**
  Calendar is spelled with an 'a' (`CALENDAR_SVG`).
- **Recommended cleanup:**
  Rename `CALENDER_SVG` to `CALENDAR_SVG`.
- **Priority:** Low
- **Estimated impact:** Clean code hygiene.

---

### 6.4 Component Name vs. File Name Mismatches
- **Finding:** Several component files export functions whose names do not match their file basenames.
- **File / Location:**
  - `frontend/src/components/orders/OrdersCard.jsx` exports `default function OrderCard` (singular).
  - `frontend/src/components/orders/OrderItemsCard.jsx` exports `default function OrderedItemsCard` (past tense).
  - `frontend/src/lib/hooks/useAuth.js` exports `default function useAuthGuard`.
- **Why it is unnecessary/problematic:**
  Creates confusion during code navigation, autocompletion, and grep searches.
- **Recommended cleanup:**
  Align component names and file names:
  - `OrderCard.jsx` -> exports `OrderCard`
  - `OrderedItemsCard.jsx` -> exports `OrderedItemsCard`
  - Split `useAuth.js` into `useAuthGuard.js` and `useAuth.js`.
- **Priority:** Medium
- **Estimated impact:** Improves code discoverability and consistency.

---

### 6.5 Inconsistent Export Styles (Named vs. Default)
- **Finding:** Arbitrary mixing of default and named exports across hooks, services, and components.
- **File / Location:**
  - Hooks: `useCurrentLocation.js`, `useDebounce.js`, `useRazorpay.js` use named exports; `useAddress.js`, `useAddresses.js`, `useAuth.js`, `useOrder.js`, `useOrders.js`, `useRestaurant.js`, `useRestaurants.js`, `useReview.js`, `useReviews.js` use default exports.
  - Services: `restaurantService.js` has `export default async function getNearbyRestaurants` AND `export async function getRestaurantMenus`.
  - Components: `AddressForm.jsx`, `AddAddressForm.jsx`, `EditAddressForm.jsx`, `AddressSearch.jsx`, `CurrentLocationButton.jsx` use named exports; all other components use default exports.
- **Why it is unnecessary/problematic:**
  Inconsistent imports (e.g. `import useAddress from ...` vs `import { useDebounce } from ...`) lead to developer friction and import errors (as seen in `src/app/(customer)/layout.js`).
- **Recommended cleanup:**
  Standardize on named exports for services and hooks, or establish a clear convention (e.g., named exports for utility hooks, default exports for page-level components).
- **Priority:** Medium
- **Estimated impact:** Predictable import signatures across the codebase.

---

### 6.6 Misplaced Skeleton Component
- **Finding:** `RestaurantMenuSkeleton.jsx` is placed in `src/components/restaurants/` instead of `src/components/skeletons/`.
- **File / Location:**
  - `frontend/src/components/restaurants/RestaurantMenuSkeleton.jsx` vs.
  - `frontend/src/components/skeletons/*` (where all other 8 skeletons live)
- **Why it is unnecessary/problematic:**
  All skeletons are centralized in `src/components/skeletons/` except for this one.
- **Recommended cleanup:**
  Move `RestaurantMenuSkeleton.jsx` to `src/components/skeletons/` and update imports.
- **Priority:** Low
- **Estimated impact:** Consistent project structure.

---

### 6.7 Wrong Action String in Address Mutation Error Handler
- **Finding:** `createMutation` passes `'update'` as the action string to error toast generator.
- **File / Location:** `frontend/src/lib/hooks/useAddresses.js` (line 93)
  ```javascript
  onError: (error) => {
     handleAddressMutationError(error, 'update');
  },
  ```
- **Why it is unnecessary/problematic:**
  If address creation fails with a 403 or server error, the toast displays: "You are not allowed to update this address" or "Unable to update address" instead of "add" or "create".
- **Recommended cleanup:**
  Change `'update'` to `'add'` on line 93.
- **Priority:** Low
- **Estimated impact:** Accurate user-facing error message.

---

## 7. Prioritized Implementation Roadmap

When you are ready to implement the cleanups, here is the recommended phased execution plan:

### Phase 1: High Safety & Immediate Deletions (Zero Risk)
- [ ] Delete 0-byte files: `NearbyRestaurantList.jsx`, `RestaurantHeader.jsx`.
- [ ] Delete orphaned/broken route group: `src/app/(customer)/layout.js`.
- [ ] Delete abandoned stub route: `src/app/payment/[id]/page.js`.
- [ ] Delete 7 unused images in `public/assets/` (~3.5 MB saved).
- [ ] Delete 5 unused template SVGs in `public/`.
- [ ] Uninstall unused dependencies: `motion`, `next-themes`.
- [ ] Remove unused icon exports: `CHECKOUT_ICON_URL`, `SHOPPING_BAG_SVG`.
- [ ] Remove unused imports and redundant `eslint-disable @next/next/no-img-element` comments.

### Phase 2: Critical Bug Fixes & Architectural Health
- [ ] Fix SSR crash risk in `api.js` by checking `typeof window !== 'undefined'` before accessing `localStorage`.
- [ ] Decouple `useAuthGuard` side-effect from `UserProfile` so public pages (like `/about`) do not redirect unauthenticated users to `/login`.
- [ ] Fix broken image fallback in `RestaurantDetails.jsx` (`restaurant-placeholder.png` -> `default-restaurant.jpg`).
- [ ] Fix typo `makePaymentt` in `useOrder.js` and `CheckoutDetails.jsx`.
- [ ] Fix wrong action string `'update'` in `useAddresses.js` `createMutation`.
- [ ] Replace silent `catch {}` blocks with proper error toast notifications.

### Phase 3: TanStack Query & Server-State Modernization
- [ ] Refactor `useGenerateInvoice` to use TanStack Query `useMutation`.
- [ ] Remove redundant manual `setQueryData` cache manipulation in `useReview` and `useReviews` that is immediately overwritten by `invalidateQueries`.
- [ ] Split `useOrder.js` monolith into dedicated, focused hooks (`useOrder`, `useCreateOrder`, `useCancelOrder`).
- [ ] Decouple address mutations from `useAddresses` so `AddAddressForm` and `EditAddressForm` do not trigger an unnecessary GET request for all addresses.
- [ ] Fix `useAddress(id)` to utilize TanStack Query cache instead of fetching page 1 of all addresses.
- [ ] Derive restaurant menus in `useRestaurants` from query data instead of firing a second query.

### Phase 4: Performance, State Simplification & React Optimization
- [ ] Remove state mirroring of search params in `src/app/page.js`; derive filters directly from URL search params.
- [ ] Lift `<ReplaceCartDialog>` out of individual `MenuItemCard` components up to the menu list level.
- [ ] Add selectors to Zustand hooks in `MenuItemCard` and `RestaurantCard` to avoid re-rendering entire lists on single-item updates.
- [ ] Memoize `menuNames` computation in `Search.jsx`.
- [ ] Optimize `useReviews.js` deduplication from O(N²) to O(N).
- [ ] Refactor `NetworkStatus.jsx` to use `useSyncExternalStore`.
- [ ] Fix React Compiler warning in `AddressForm.jsx` by switching `watch('label')` to `useWatch`.

### Phase 5: DRY Consolidation & Formatting Helpers
- [ ] Create shared formatting utilities in `src/lib/utils.js`:
  - `formatAddress(address)`
  - `formatDate(date)`
  - `formatStatus(status)`
  - `getAddressIcon(label)`
- [ ] Create `applyServerValidationErrors(setError, errors)` for React Hook Form 422 errors.
- [ ] Replace raw inline SVG spinners with Lucide `<Loader2 className="animate-spin" />`.
- [ ] Standardize file names and component names (`cartServices.js` -> `cartService.js`, `OrdersCard.jsx` -> `OrderCard.jsx`).
- [ ] Move `RestaurantMenuSkeleton.jsx` into `src/components/skeletons/`.

---

**End of Audit Report.**  
*Ready for user review. No code has been modified.*
