# RSC Boundaries & Next.js 16 Navigation

---

## 1. Root `page.js` as React Server Component (RSC)

In Next.js 16 App Router, every `page.js` is an RSC by default. 

Keep root `page.js` files ultra-thin and server-rendered:
* **Responsibility:** Extract route parameters, set metadata, and hand off execution to the interactive feature container.
* **Invariant:** Never place `'use client'` directly on root `page.js`. Push `'use client'` down to the feature container (`components/<feature>/<Feature>Container.jsx`).

```javascript
// src/app/items/[id]/page.js (RSC - Server-side entry point)
import { FeatureDetailContainer } from '@/components/feature/FeatureDetailContainer';

export const metadata = {
   title: 'Item Details',
};

export default async function FeatureDetailPage({ params, searchParams }) {
   const { id } = await params;
   const resolvedSearchParams = await searchParams;

   return (
      <main className="container mx-auto px-4 py-8">
         <FeatureDetailContainer id={id} initialFilters={resolvedSearchParams} />
      </main>
   );
}
```

---

## 2. Next.js 16 Async Dynamic APIs (`await params`)

In Next.js 15 and 16, dynamic routing properties are asynchronous Promises:

```javascript
// ❌ Forbidden (Synchronous access - throws runtime warning / error in Next.js 16):
export default function ItemPage({ params }) {
   const id = params.id; // ⚠️ Error: Route params are now Promises!
   return <ItemContainer id={id} />;
}

// ✅ Approved (Asynchronously resolved params):
export default async function ItemPage({ params, searchParams }) {
   const { id } = await params;
   const query = await searchParams;

   return <ItemContainer id={id} query={query} />;
}
```

* **Why:** Asynchronous params allow Next.js to optimize static pre-rendering, parallel route streaming, and partial prerendering (PPR) at the HTTP request boundary.

---

## 3. Strict Navigation Package Mandate

All client-side navigation must use modern Next.js App Router packages:

| Requirement | Approved Standard | Strictly Forbidden |
| :--- | :--- | :--- |
| **Declarative Links** | `<Link href="/items">` from `next/link` | `<a href="/items">` (causes full browser refresh & wipes cache) |
| **Programmatic Push** | `useRouter` from `next/navigation` | `useRouter` from `next/router` (crashes: `NextRouter not mounted`) |
| **Path Inspection** | `usePathname` from `next/navigation` | `router.pathname` from `next/router` |
| **Query Parameters** | `useSearchParams` from `next/navigation` | `router.query` from `next/router` |

### Client-Side Navigation Example:
```javascript
'use client';

import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';

export function NavigationControl() {
   const router = useRouter();
   const pathname = usePathname();
   const searchParams = useSearchParams();

   const handleRedirect = () => {
      // Programmatic transition without hard refresh
      router.push('/items?page=1');
   };

   return (
      <div className="flex items-center gap-4">
         {/* Declarative client-side transition */}
         <Link
            href="/items"
            className={pathname === '/items' ? 'font-bold text-primary' : 'text-muted-foreground'}
         >
            Items Directory
         </Link>

         <Button variant="outline" onClick={handleRedirect}>
            Reset Filters
         </Button>
      </div>
   );
}
```
