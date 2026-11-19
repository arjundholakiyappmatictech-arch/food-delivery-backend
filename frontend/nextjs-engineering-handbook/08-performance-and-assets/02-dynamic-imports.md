# Dynamic Code Splitting & Bundle Optimization

---

## 1. Lazy-Loading Heavy Client Packages (`next/dynamic`)

Large third-party libraries (e.g. PDF generation engines like `jspdf`, spreadsheet parsers like `xlsx`, charting suites, rich-text markdown editors) significantly bloat initial JavaScript bundles.

Never import heavy client utilities statically at the top of a page or container:

```javascript
// ❌ Forbidden (Bloats initial page bundle for all users):
import { HeavyAnalyticsChart } from '@/components/analytics/HeavyAnalyticsChart';

// ✅ Approved (Lazy loaded on demand with skeleton fallback):
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const HeavyAnalyticsChart = dynamic(
   () => import('@/components/analytics/HeavyAnalyticsChart'),
   {
      ssr: false, // Disables server rendering for client-only canvas/DOM logic
      loading: () => <Skeleton className="h-[350px] w-full rounded-xl" />,
   }
);
```

### Benefits:
1. **Faster First Contentful Paint (FCP):** The browser downloads only the critical code required to render the initial layout.
2. **Smooth Skeleton Transition:** The `loading` callback renders a layout-matching skeleton while the dynamic JavaScript chunk loads over the network.

---

## 2. Component-Level Splitting: Heavy Modals & Drawers

Complex multi-step dialogs, heavy filter drawers, and detail popups often contain substantial code (sliders, multi-select pickers, preview tabs) that the majority of page visitors may never open.

### The On-Demand Modal Pattern
Instead of statically bundling the modal into the parent page, dynamically import the modal component:

```javascript
'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Modal JavaScript chunk is ONLY requested when isOpen becomes true:
const FilterDrawer = dynamic(
   () => import('@/components/feature/HeavyFilterDrawer'),
   { ssr: false }
);

export function FilterTrigger() {
   const [isOpen, setIsOpen] = useState(false);

   return (
      <>
         <Button onClick={() => setIsOpen(true)} variant="outline">
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Filters
         </Button>

         {isOpen && (
            <FilterDrawer isOpen={isOpen} onClose={() => setIsOpen(false)} />
         )}
      </>
   );
}
```

* **Outcome:** Removes 50KB–150KB of modal JavaScript from the initial bundle without any visual degradation.

---

## 3. On-Demand Dynamic Utility Imports

For one-off user actions (e.g. clicking an "Export PDF" or "Download Spreadsheet" button), import the library dynamically inside the event handler:

```javascript
'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ExportButton({ data }) {
   const [isExporting, setIsExporting] = useState(false);

   const handleExport = async () => {
      setIsExporting(true);
      try {
         // Dynamically load library only when user clicks:
         const { jsPDF } = await import('jspdf');
         const doc = new jsPDF();
         doc.text('Export Summary', 14, 20);
         doc.save('export-summary.pdf');
      } catch (error) {
         console.error('Export failed:', error);
      } finally {
         setIsExporting(false);
      }
   };

   return (
      <Button onClick={handleExport} disabled={isExporting} variant="outline" size="sm">
         <Download className="mr-2 h-4 w-4" />
         {isExporting ? 'Generating...' : 'Export PDF'}
      </Button>
   );
}
```

* **Outcome:** Users who never trigger the export feature never download the multi-megabyte PDF engine.

---

## 4. Preserving Tree-Shaking: Avoid Barrel Files

Centralized barrel files (`components/index.js` re-exporting hundreds of components) are strictly forbidden:

```javascript
// ❌ Forbidden (Barrel file forces bundler to evaluate all exported components):
import { Button, Input, Modal, Table, Dropdown } from '@/components';

// ✅ Approved (Direct module import enables optimal tree-shaking):
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
```

### Why Barrel Files are Forbidden:
1. **Broken Tree-Shaking:** Bundlers often struggle to eliminate dead code from multi-tier re-export chains.
2. **Circular Dependencies:** Re-export cycles between components frequently trigger subtle runtime `undefined` crashes.
3. **Slow Build Times:** Increases Turbopack / Webpack compilation time and developer server memory overhead.

---

## 5. React 19 Compiler Optimization Awareness

Next.js 16 integrates the React 19 Compiler (`reactCompiler: true` in `next.config.mjs`).

* **Automated Memoization:** The compiler automatically memoizes component return trees and calculations without requiring boilerplate `useMemo`, `useCallback`, or `React.memo`.
* **The Rule of Component Purity:** Keep components pure and idempotent. Do not write side-effects during render (such as modifying variables outside the component scope). Pure components allow the React Compiler to skip redundant re-renders seamlessly.
