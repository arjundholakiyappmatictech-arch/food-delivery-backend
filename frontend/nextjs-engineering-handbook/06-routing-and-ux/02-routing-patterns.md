# Routing Patterns & Architecture

> **Company routing patterns in Next.js 16 App Router: Multi-layout route groups, Next.js 16 async params, and metadata policies.**

---

## 1. Multi-Layout Organization: Route Groups `(folder)`

Use Route Groups `(folder)` to apply distinct layouts without injecting artificial path segments into the public URL. This is our company standard for separating public/auth pages from authenticated dashboard applications:

* **Public / Auth Layout (`(auth)/layout.js`):** Minimal centered card shell with zero navigation bars.
* **Dashboard / Main Layout (`(main)/layout.js`):** Persistent application shell with sidebar, navigation header, and search controls.

```
src/app/
├── (auth)/
│   ├── layout.js             # Minimal Auth Layout
│   ├── login/page.js         # Resolves to /login
│   └── register/page.js      # Resolves to /register
└── (main)/
    ├── layout.js             # Main App Layout (Sidebar + Header)
    ├── dashboard/page.js     # Resolves to /dashboard
    └── items/
        ├── page.js           # Resolves to /items
        └── [id]/page.js      # Resolves to /items/:id
```

---

## 2. Dynamic Segment Detail Routes (`[id]`) & `await params`

Every entity detail page uses a single dynamic segment `[id]`. In Next.js 16, dynamic route parameters and search parameters **must be awaited asynchronously**:

```javascript
// src/app/(main)/items/[id]/page.js
import { FeatureDetailContainer } from '@/components/feature/FeatureDetailContainer';

export default async function ItemDetailPage({ params, searchParams }) {
   // ✅ Mandatory: Always await dynamic params in Next.js 16
   const { id } = await params;
   const query = await searchParams;

   return <FeatureDetailContainer id={id} query={query} />;
}
```

* **Invariant:** Never access `params.id` synchronously (triggers runtime exceptions in Next.js 16).
* **Leaf Boundary:** Keep this file purely as an RSC. Pass `id` and `query` to the client feature container.

---

## 3. SEO & Metadata Policy

* **Public & Marketing Routes:** Use `generateMetadata` when page titles, descriptions, and OpenGraph social cards depend dynamically on the route ID:
  ```javascript
  export async function generateMetadata({ params }) {
     const { id } = await params;
     return { title: `Item #${id} | Application` };
  }
  ```
* **Internal & Authenticated Dashboards:** Google and social bots cannot crawl authenticated routes. Skip `generateMetadata` and export static metadata instead:
  ```javascript
  export const metadata = { title: 'Dashboard' };
  ```

---

## 4. Catch-All Segments Policy (`[...slug]`)

* **Sanctioned Scope:** Documentation trees (`/docs/[...slug]`) and CMS page builders only.
* **Prohibited Scope:** Standard business domain entities and CRUD features. Always use explicit single segments (`/items`, `/items/[id]`) to maintain predictable REST mapping with Laravel.
