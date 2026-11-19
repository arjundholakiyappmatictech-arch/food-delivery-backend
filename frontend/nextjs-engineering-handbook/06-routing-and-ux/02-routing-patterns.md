# Next.js Official Routing Patterns

> **Practical routing conventions in Next.js 16 App Router: Mandatory daily standards, high-priority layout organization, conditional SEO metadata, and niche catch-all segments.**

---

## 1. Mandatory Core: `layout.js` & `page.js`

In the Next.js App Router, folder hierarchies define routes, while two primary convention files define UI layout and content:

| File | Importance | Role | State Behavior |
| :--- | :--- | :--- | :--- |
| **`layout.js`** | 🟢 **Mandatory** | Shared UI across a segment and its children (header, sidebar, footer). | **Preserved** across child route navigations. |
| **`page.js`** | 🟢 **Mandatory** | Unique UI for a specific route path; makes the route publicly accessible. | Unmounted when navigating away. |

```
src/app/
├── layout.js                 # Global Root Layout (Html, Body, Providers)
├── page.js                   # Home Page (/)
├── (auth)/                   # Route group for auth
│   ├── layout.js             # Auth-specific layout (minimal centered card)
│   └── login/page.js         # /login
└── items/
    ├── layout.js             # Shared items layout (sidebar / filters)
    ├── page.js               # /items
    └── [id]/
        └── page.js           # /items/:id
```

---

## 2. Mandatory Dynamic Routing: Single Segment (`[id]`)

Any application with detail records (e.g. orders, users, items) relies on single dynamic segments.

### The Next.js 16 `await params` Invariant
In Next.js 16, route parameters and search parameters are asynchronous Promises:

```javascript
// src/app/items/[id]/page.js
import { FeatureDetailContainer } from '@/components/feature/FeatureDetailContainer';

export default async function ItemDetailPage({ params, searchParams }) {
   // ✅ Mandatory: Always await dynamic params in Next.js 16:
   const { id } = await params;
   const query = await searchParams;

   return <FeatureDetailContainer id={id} query={query} />;
}
```

* **Matches:** `/items/101`, `/items/abc`
* **Does NOT match:** `/items` (requires its own `page.js`), or nested `/items/101/subitem`.

---

## 3. High-Priority: Route Groups `(folder)`

Route groups allow you to organize routes and apply distinct layouts without altering the browser's public URL pathname:

### Key Use Case: Multi-Layout Application Shells
Most applications require at least two distinct layouts:
1. **Public / Auth Layout (`(auth)/layout.js`):** Centered card, minimal styling, zero navigation bars.
2. **Dashboard / App Layout (`(main)/layout.js`):** Full persistent sidebar, header, and search controls.

```
src/app/
├── (auth)/
│   ├── layout.js             # Minimal Auth Layout
│   ├── login/page.js         # Resolves to /login (clean URL)
│   └── register/page.js      # Resolves to /register (clean URL)
└── (main)/
    ├── layout.js             # Main App Layout with Sidebar & Header
    └── items/page.js         # Resolves to /items (clean URL)
```

---

## 4. Conditional: Dynamic Metadata (`generateMetadata`)

Used when a page depends on dynamic route parameters to set SEO tags and social sharing cards:

* **When it is needed:** Public e-commerce products, public blog posts, or marketing pages where Google SEO and social media previews (WhatsApp, Twitter/X, LinkedIn) are required.
* **When to skip:** Internal dashboards, admin panels, CRM systems, or pages behind authentication (search engines cannot crawl authenticated routes anyway; use static `export const metadata = { title: 'Dashboard' }`).

```javascript
// src/app/items/[id]/page.js
export async function generateMetadata({ params }) {
   const { id } = await params;

   return {
      title: `Item #${id} | Application`,
      description: `View details for item #${id}.`,
      openGraph: {
         title: `Item #${id}`,
         description: `Specs and details for item #${id}.`,
      },
   };
}

export default async function ItemDetailPage({ params }) {
   const { id } = await params;
   return <FeatureDetailContainer id={id} />;
}
```

---

## 5. Niche: Catch-All Segments (`[...slug]`)

Catch-all routes match deep or variable URL paths. 

* **When it is needed:** Documentation directories (`/docs/guides/installation`), CMS page builders, or deeply nested category filters (`/store/apparel/mens/shirts`).
* **When to skip:** Standard CRUD and REST business applications. Fixed routes (`/items`, `/items/[id]`) cover 99% of business requirements.

```javascript
// src/app/docs/[...slug]/page.js
export default async function DocPage({ params }) {
   const { slug } = await params; // Array of strings: ['guides', 'installation']
   const docPath = slug.join('/');

   return <DocViewer path={docPath} />;
}
```

* **Note:** For optional base matching (e.g. matching `/store` as well as `/store/category/item`), wrap in double brackets: `[[...slug]]`.
