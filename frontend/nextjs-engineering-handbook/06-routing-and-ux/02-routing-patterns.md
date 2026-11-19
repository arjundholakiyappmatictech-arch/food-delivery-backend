# Next.js Official Routing Patterns

---

## 1. App Router Filesystem Conventions

In Next.js 16 App Router, folder hierarchies define routes, while special convention files define UI behaviors:

| File Name | Purpose | State Persistence | Re-renders on Route Change |
| :--- | :--- | :--- | :--- |
| **`page.js`** | Unique UI for a specific route path; makes the path publicly accessible. | Unmounted on route exit | Yes |
| **`layout.js`** | Shared UI across a segment and its children (e.g., header, sidebar, footer). | **Preserved** across child navigations | No |
| **`template.js`** | Specialized layout that mounts a fresh component instance on each navigation. | **Reset** on every navigation | Yes |
| **`default.js`** | Fallback render view for unmatched parallel route slots. | Slot-dependent | Dependent |

```
src/app/
├── layout.js                 # Root layout (Html, Body, Global Providers)
├── page.js                   # Home page (/)
├── (auth)/                   # Route group (omitted from URL)
│   ├── layout.js             # Auth-specific layout (minimal centered card)
│   ├── login/page.js         # /login
│   └── register/page.js      # /register
├── items/
│   ├── layout.js             # Shared items layout (sidebar/filters)
│   ├── page.js               # /items
│   ├── [id]/                 # Single dynamic segment (/items/:id)
│   │   └── page.js
│   └── search/
│       └── [...filters]/     # Catch-all segment (/items/search/*)
│           └── page.js
```

---

## 2. Dynamic Route Segment Patterns

Next.js provides three distinct patterns for matching dynamic URLs:

### Pattern A: Single Dynamic Segment (`[slug]` / `[id]`)
Matches exactly one URL segment:

* **File Location:** `src/app/items/[id]/page.js`
* **Matches:** `/items/101`, `/items/abc`
* **Does NOT match:** `/items`, `/items/101/details`

```javascript
// src/app/items/[id]/page.js
export default async function ItemDetailPage({ params }) {
   // Next.js 16: params is a Promise
   const { id } = await params;

   return <FeatureDetailContainer id={id} />;
}
```

### Pattern B: Catch-All Segment (`[...slug]`)
Matches one or more nested URL segments:

* **File Location:** `src/app/docs/[...slug]/page.js`
* **Matches:** `/docs/installation` (`['installation']`), `/docs/components/button` (`['components', 'button']`)
* **Does NOT match:** `/docs` (returns 404 unless a separate `src/app/docs/page.js` exists)

```javascript
// src/app/docs/[...slug]/page.js
export default async function DocPage({ params }) {
   const { slug } = await params; // Array of strings: e.g. ['components', 'button']
   const docPath = slug.join('/');

   return <DocViewer path={docPath} />;
}
```

### Pattern C: Optional Catch-All Segment (`[[...slug]]`)
Matches zero, one, or more nested segments:

* **File Location:** `src/app/store/[[...categories]]/page.js`
* **Matches:** 
  * `/store` (`categories` is `undefined`)
  * `/store/electronics` (`categories` is `['electronics']`)
  * `/store/electronics/phones` (`categories` is `['electronics', 'phones']`)

```javascript
// src/app/store/[[...categories]]/page.js
export default async function StorePage({ params }) {
   const { categories } = await params;
   const activeCategory = categories?.[0] ?? 'all';

   return <StoreCatalog category={activeCategory} pathSegments={categories ?? []} />;
}
```

---

## 3. Route Groups (`(folder)`)

Route groups allow grouping routes logically without modifying the public URL pathname:

### Key Use Cases:
1. **Multiple Root Layouts:** Create completely different layouts for marketing (`(marketing)/layout.js`), authentication (`(auth)/layout.js`), and dashboard (`(dashboard)/layout.js`) without adding `/marketing` or `/auth` prefixes to the URL.
2. **Team Separation:** Organize code by business domain or ownership.

```
src/app/
├── (auth)/
│   ├── layout.js             # Auth layout (no header/footer)
│   └── login/page.js         # Resolves to /login (NOT /auth/login)
└── (main)/
    ├── layout.js             # Main layout (with global navbar)
    └── items/page.js         # Resolves to /items (NOT /main/items)
```

---

## 4. Advanced Parallel & Intercepting Routes

For sophisticated modal and split-screen workflows, Next.js provides slots and route interception:

### Parallel Routes (`@slot`)
Parallel routes allow rendering one or more pages simultaneously within the same layout:

```javascript
// src/app/layout.js
export default function RootLayout({ children, modal }) {
   return (
      <html lang="en">
         <body>
            <Navbar />
            {children}
            {modal} {/* Renders the @modal slot */}
         </body>
      </html>
   );
}
```

### Intercepting Routes (`(.)`, `(..)`)
Intercepting routes allow loading a route from another part of the application inside the current layout (e.g. displaying a modal preview) while updating the browser URL.

| Prefix | Match Scope |
| :--- | :--- |
| **`(.)`** | Matches segments on the **same level**. |
| **`(..)`** | Matches segments **one level above**. |
| **`(..)(..)`** | Matches segments **two levels above**. |
| **`(...)`** | Matches segments from the root **`app/`** directory. |

* **Modal Feed Pattern:** Clicking an item in `/items` opens `src/app/items/@modal/(.)[id]/page.js` inside an overlay modal and updates URL to `/items/42`. If the user refreshes or shares the URL `/items/42`, Next.js renders the full-page view `src/app/items/[id]/page.js`.

---

## 5. Dynamic Metadata Generation (`generateMetadata`)

In Next.js 16, dynamic metadata is generated asynchronously by awaiting `params`:

```javascript
// src/app/items/[id]/page.js
export async function generateMetadata({ params }) {
   const { id } = await params;

   return {
      title: `Item #${id} | Application`,
      description: `View details for item identifier ${id}.`,
      openGraph: {
         title: `Item #${id}`,
      },
   };
}

export default async function ItemPage({ params }) {
   const { id } = await params;
   return <FeatureDetailContainer id={id} />;
}
```
