# Zustand Atomic Selectors

---

## 1. Strict State Boundary: Server vs. Client State

State management in Next.js 16 follows a strict dual-engine boundary:

```
┌─────────────────────────────────┐       ┌─────────────────────────────────┐
│     Server State (Asynchronous) │       │   Client State (Synchronous UI) │
│          TanStack Query v5      │       │             Zustand v5          │
├─────────────────────────────────┤       ├─────────────────────────────────┤
│ • API Collections & Records     │       │ • Sidebar / Drawer Open State   │
│ • Server Validation Errors      │       │ • Active Modal Dialog Identifier│
│ • Pagination & Server Filters   │       │ • Theme & Client Preferences    │
│ • Background Revalidation       │       │ • Multi-Step Wizard Step Pointer│
└─────────────────────────────────┘       └─────────────────────────────────┘
```

### ❌ The Mirroring Anti-Pattern
Never copy or duplicate data returned from TanStack Query into a Zustand store:

```javascript
// ❌ Forbidden (Duplicating server state in Zustand):
const { data: items } = useQuery(...);
useEffect(() => {
   useStore.getState().setItems(items); // ⚠️ Anti-pattern: Causes sync bugs & memory waste
}, [items]);
```

* **Why:** TanStack Query already manages memory caching, garbage collection, and background revalidation. Mirroring it creates split-brain states where the UI displays stale data from Zustand while TanStack has already fetched new data.

---

## 2. Store Creation Pattern (Zustand v5)

Define focused, flat stores with actions colocated alongside state slices:

```javascript
// src/lib/stores/useUIStore.js
import { create } from 'zustand';

export const useUIStore = create((set) => ({
   isSidebarOpen: false,
   activeModal: null,

   // Actions:
   toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
   openModal: (modalId) => set({ activeModal: modalId }),
   closeModal: () => set({ activeModal: null }),
}));
```

---

## 3. Mandatory Atomic Selectors

When consuming Zustand stores in React components, **always use atomic selectors**:

```javascript
// ❌ Forbidden (Destructuring full store - re-renders on ANY store change):
function SidebarToggle() {
   const { isSidebarOpen, toggleSidebar } = useUIStore();
   return <button onClick={toggleSidebar}>{isSidebarOpen ? 'Close' : 'Open'}</button>;
}

// ✅ Approved (Atomic selectors - re-renders ONLY when selected slice changes):
function SidebarToggle() {
   const isSidebarOpen = useUIStore((state) => state.isSidebarOpen);
   const toggleSidebar = useUIStore((state) => state.toggleSidebar);

   return <button onClick={toggleSidebar}>{isSidebarOpen ? 'Close' : 'Open'}</button>;
}
```

### Why Atomic Selectors Matter
* When calling `useUIStore()`, your component subscribes to the entire store state. If an unrelated property (e.g. `activeModal`) changes, every component calling `useUIStore()` will unnecessarily re-render.
* Passing an inline selector function `(state) => state.property` ensures React 19 re-renders the component **only** if that specific primitive or reference changes.

---

## 4. UI Preference Persistence

For client preferences that must persist across page reloads (e.g., collapsed menu, theme), use Zustand's `persist` middleware:

```javascript
// src/lib/stores/usePreferencesStore.js
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const usePreferencesStore = create(
   persist(
      (set) => ({
         isCollapsed: false,
         setCollapsed: (isCollapsed) => set({ isCollapsed }),
         toggleCollapsed: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
      }),
      {
         name: 'app_ui_preferences',
         storage: createJSONStorage(() => localStorage),
      }
   )
);
```

* **SSR Invariant:** For Next.js client hydration safety, persist only non-critical layout preferences. Never persist sensitive authentication tokens directly in open client state stores (use the centralized Axios interceptor with secure token storage).
