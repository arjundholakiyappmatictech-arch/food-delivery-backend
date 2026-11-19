# Module 08: Performance & Asset Optimization

> **Next.js image optimization, Cumulative Layout Shift (CLS) elimination, dynamic code splitting with `next/dynamic`, and bundle optimization.**

---

## 1. Directory Contents

1. **[01 - Image Optimization & `next/image`](01-image-optimization.md):**
   * Mandatory use of Next.js `<Image />` component over raw HTML `<img>`.
   * Remote image domain authorization via `remotePatterns` in `next.config.mjs`.
   * Responsive layout sizing with `fill`, aspect ratios, and the `sizes` attribute.
   * Eliminating Cumulative Layout Shift (CLS).
   * Above-the-fold `priority={true}` vs. lazy-loaded list thumbnails.

2. **[02 - Dynamic Code Splitting & Bundle Optimization](02-dynamic-imports.md):**
   * Lazy-loading heavy client-only packages (`jspdf`, chart engines, rich text editors) with `next/dynamic` and `{ ssr: false }`.
   * Component-level splitting for heavy modals, dialogs, and slide-over drawers.
   * Seamless skeleton loading states during chunk fetching.
   * Tree-shaking and avoiding monolithic barrel files.
   * React 19 compiler optimization awareness.

---

## 2. Invariant Summary Table

| Category | Approved Standard | Forbidden Anti-Pattern |
| :--- | :--- | :--- |
| **Image Component** | Modern Next.js `<Image />` from `next/image`. | Standard HTML `<img src="..." />` tags (unoptimized, causes layout shifts). |
| **Layout Shift (CLS)** | Fixed dimensions (`width`, `height`) or `fill` with parent aspect ratio. | Rendered images with unknown dimensions causing content jumps. |
| **Responsive Sizes** | Explicit `sizes="..."` string when using `fill`. | Omitting `sizes` with `fill`, causing browser to download full 4K images. |
| **Remote Images** | Explicit `remotePatterns` declared in `next.config.mjs`. | Disabling image optimization (`unoptimized: true`) globally to bypass errors. |
| **LCP Hero Images** | `priority={true}` on above-the-fold primary banners. | Lazy loading hero banners, degrading Largest Contentful Paint (LCP). |
| **Heavy Libraries** | Lazy loaded via `next/dynamic` with `{ ssr: false }`. | Statically importing multi-megabyte client utilities into the initial bundle. |
| **Import Paths** | Direct imports from specific feature modules. | Giant barrel files (`index.js`) re-exporting hundreds of unused modules. |
