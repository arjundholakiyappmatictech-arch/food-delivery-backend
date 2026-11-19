# Image Optimization & Company Invariants

> **Asset optimization mandates: `<Image />` enforcement, external host authorization, and CLS elimination patterns.**

---

## 1. The `<Image />` Mandate & HTML `<img>` Ban

All static assets and remote media URLs must be rendered using Next.js **`<Image />`** from `next/image`. Standard HTML `<img />` tags are strictly forbidden:

```javascript
// ❌ Forbidden (Causes Cumulative Layout Shift and bypasses compression):
<img src="/banner.jpg" alt="Banner" className="w-full" />

// ✅ Approved (Responsive, WebP/AVIF format negotiation, zero CLS):
import Image from 'next/image';

<Image src="/banner.jpg" alt="Banner" width={1200} height={600} priority />
```

---

## 2. Remote Image Authorization (`next.config.mjs`)

When displaying images from external backend services (e.g. Laravel `/storage`, AWS S3, Cloudflare R2), register their hostnames under `remotePatterns` in `next.config.mjs`:

```javascript
// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
   images: {
      remotePatterns: [
         {
            protocol: 'https',
            hostname: 'api.example.com',
            pathname: '/storage/**',
         },
         {
            protocol: 'https',
            hostname: 'images.unsplash.com',
            pathname: '/**',
         },
      ],
   },
};

export default nextConfig;
```

> [!WARNING]
> **Never set `images: { unoptimized: true }` globally.** This disables image optimization across the entire application to bypass configuration. Always configure explicit `remotePatterns`.

---

## 3. Layout Patterns & CLS Elimination

### Pattern A: Predetermined Fixed Dimensions (Avatars, Icons)
Use explicit integer `width` and `height` props when dimensions are known and static:

```javascript
<Image
   src={avatarUrl}
   alt={userName}
   width={48}
   height={48}
   className="rounded-full object-cover"
/>
```

### Pattern B: Fluid Responsive Cards (`fill` + `sizes`)
When images dynamically fill a responsive grid container:
1. The parent container must have `relative` positioning and an aspect ratio (e.g. `aspect-video`).
2. The `sizes` prop **must be defined** so the browser downloads the optimal image resolution:

```javascript
// src/components/feature/FeatureCardImage.jsx
import Image from 'next/image';

export function FeatureCardImage({ src, alt }) {
   return (
      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
         <Image
            src={src}
            alt={alt}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 hover:scale-105"
         />
      </div>
   );
}
```

---

## 4. Prioritization: LCP vs. Lazy Loading

* **Above-the-Fold Hero Media:** Set `priority={true}` on primary hero banners and top-of-page headers to preload them and optimize Largest Contentful Paint (LCP).
* **Below-the-Fold Feeds & Lists:** Omit `priority`. Next.js defaults to `loading="lazy"` automatically.
