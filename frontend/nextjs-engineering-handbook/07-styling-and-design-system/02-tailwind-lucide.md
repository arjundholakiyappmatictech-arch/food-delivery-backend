# Tailwind CSS v4 & Lucide Iconography

---

## 1. Tailwind CSS v4 Semantic Tokens & Theming

Modern styling is governed by semantic design tokens declared via CSS variables. Never use hardcoded arbitrary hex color codes in UI components:

```javascript
// ❌ Forbidden (Hardcoded hex values break theming & dark mode):
<div className="bg-[#ffffff] text-[#111827] border-[#e5e7eb] dark:bg-[#09090b]">
   <span className="text-[#ef4444]">Error occurred</span>
</div>

// ✅ Approved (Semantic design tokens adapt automatically):
<div className="bg-background text-foreground border-border">
   <span className="text-destructive">Error occurred</span>
</div>
```

### Core Semantic Token Reference

| Semantic Token Class | Typical Use Case |
| :--- | :--- |
| `bg-background` / `text-foreground` | Base page background and high-contrast body text. |
| `bg-card` / `text-card-foreground` | Surface container panels, dialog cards, and elevated widgets. |
| `bg-primary` / `text-primary-foreground` | High-emphasis primary actions, active tabs, and badges. |
| `bg-secondary` / `text-secondary-foreground` | Subdued secondary buttons, chips, and metadata tags. |
| `text-muted-foreground` | Subtitles, helper text, timestamps, and input placeholders. |
| `text-destructive` / `bg-destructive` | Destructive actions, validation errors, and alert badges. |
| `border-border` / `border-input` | Outer card boundaries, table cell dividers, and input borders. |
| `ring-ring` | High-visibility keyboard focus rings. |

---

## 2. Exclusive `lucide-react` Icon Mandate

All iconography and interactive glyphs must be imported exclusively from **`lucide-react`**.

### Strict Invariants:
* **No Mixed Libraries:** Importing from `react-icons`, `@heroicons`, `feather-icons`, or FontAwesome is strictly forbidden.
* **No Inline SVGs:** Pasting raw `<svg>` code into JSX components is forbidden.
* **Standard Sizing & Shrinking:** Always specify width and height (`h-4 w-4` for compact, `h-5 w-5` for standard) and include `shrink-0` to prevent flex-box icon collapse.

```javascript
// src/components/feature/FeatureItemHeader.jsx
import { CheckCircle2, AlertTriangle, ChevronRight } from 'lucide-react';

export function FeatureItemHeader({ status, title }) {
   return (
      <div className="flex items-center justify-between gap-3 p-4">
         <div className="flex items-center gap-2">
            {status === 'active' ? (
               <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
            ) : (
               <AlertTriangle className="h-5 w-5 shrink-0 text-destructive" />
            )}
            <h3 className="font-semibold text-foreground">{title}</h3>
         </div>
         <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
      </div>
   );
}
```

---

## 3. Accessibility & Focus State Invariants

Every custom UI component and interactive button must meet modern WCAG AA accessibility standards:

### 1. Icon-Only Buttons
Whenever a button renders only an icon without accompanying text, you **must provide an accessible label**:

```javascript
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Option A: aria-label attribute
<Button variant="ghost" size="icon" aria-label="Close dialog">
   <X className="h-4 w-4" />
</Button>

// Option B: Screen-reader text element
<Button variant="ghost" size="icon">
   <X className="h-4 w-4" />
   <span className="sr-only">Close dialog</span>
</Button>
```

### 2. Keyboard Focus Indicators
All interactive elements must feature distinct, accessible focus rings:

```javascript
// Focus indicator utility class combo:
className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
```

### 3. Disabled States
Disabled buttons and form inputs must convey their state visibly and prevent pointer interactions:

```javascript
className="disabled:pointer-events-none disabled:opacity-50"
```
