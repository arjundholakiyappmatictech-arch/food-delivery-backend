# Loading, Error States & Route Protection

---

## 1. Declarative Loading Boundaries (`loading.js`)

In the Next.js App Router, placing a `loading.js` file in a route segment automatically wraps that segment in a React `<Suspense>` boundary.

### Invariant: Layout-Matching Skeletons Over Spinners
Never display a blank screen or a single centered spinner. Always provide a skeleton screen that mirrors the geometry of the target layout using shadcn `Skeleton`:

```javascript
// src/app/items/loading.js
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
   return (
      <div className="container mx-auto space-y-6 px-4 py-8">
         <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-96" />
         </div>

         <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
               <div key={index} className="space-y-3 rounded-xl border p-4">
                  <Skeleton className="h-40 w-full rounded-lg" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
               </div>
            ))}
         </div>
      </div>
   );
}
```

* **Outcome:** Eliminates cumulative layout shift (CLS) and dramatically improves perceived performance.

---

## 2. Declarative Error Boundaries (`error.js`)

Route errors must be caught locally so the surrounding application shell (navigation bar, footer) remains fully operational:

* **Invariant:** `error.js` **must be a Client Component (`'use client'`)**.
* Next.js supplies two props: `error` (the thrown error object) and `reset` (a callback to re-render the segment).

```javascript
// src/app/items/error.js
'use client';

import { useEffect } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ErrorBoundary({ error, reset }) {
   useEffect(() => {
      // Log error to monitoring service if configured
      console.error('Route segment error:', error);
   }, [error]);

   return (
      <div className="container mx-auto flex min-h-[400px] flex-col items-center justify-center px-4 text-center">
         <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertCircle className="h-6 w-6" />
         </div>
         <h2 className="text-xl font-semibold tracking-tight">Something went wrong</h2>
         <p className="mt-2 max-w-md text-sm text-muted-foreground">
            {error?.message || 'Failed to load this section. Please try again.'}
         </p>
         <Button onClick={() => reset()} className="mt-6 flex items-center gap-2">
            <RotateCcw className="h-4 w-4" />
            Try Again
         </Button>
      </div>
   );
}
```

---

## 3. Not Found Handling (`not-found.js` & `notFound()`)

When an entity does not exist on the Laravel backend (e.g. 404 response):

```javascript
// src/app/items/[id]/page.js
import { notFound } from 'next/navigation';

export default async function ItemPage({ params }) {
   const { id } = await params;

   // If invalid ID format or missing
   if (!id) {
      notFound();
   }

   return <FeatureDetailContainer id={id} />;
}
```

Colocate a `not-found.js` file at the route or app root to render a polished 404 UI.

---

## 4. Client-Side Auth Route Guard Pattern

In a frontend-only Next.js application consuming an external Laravel REST API, private routes require client auth protection:

```javascript
// src/components/auth/AuthGuard.jsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

export function AuthGuard({ children }) {
   const router = useRouter();
   const [isAuthorized, setIsAuthorized] = useState(false);

   useEffect(() => {
      const token = localStorage.getItem('access_token');

      if (!token) {
         router.replace('/login');
      } else {
         setIsAuthorized(true);
      }
   }, [router]);

   // Prevent flash of protected UI while verifying auth credentials
   if (!isAuthorized) {
      return (
         <div className="container mx-auto space-y-4 px-4 py-8">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-64 w-full" />
         </div>
      );
   }

   return children;
}
```

### Invariant:
Wrap protected feature containers with `<AuthGuard>` to guarantee that unauthenticated users never see private account or transactional data before redirection.
