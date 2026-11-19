# Image Optimization & `next/image`

---

## 1. The `<Image />` Component Mandate

All images—static assets or dynamic remote URLs—must be rendered using Next.js **`<Image />`** from `next/image`.

Using standard HTML `<img />` tags is strictly forbidden:

```javascript
// ❌ Forbidden (Unoptimized, causes Cumulative Layout Shift):
<img src="/banner.jpg" alt="Banner" className="w-full" />

// ✅ Approved (Automatically converted to WebP/AVIF, responsive, zero CLS):
import Image from 'next/image';

<Image src="/banner.jpg" alt="Banner" width={1200} height={600} priority />
```

### Automatic Next.js Optimizations:
1. **Format Negotiation:** Automatically serves cutting-edge AVIF or WebP formats based on browser support.
2. **On-Demand Resizing:** Generates appropriately sized image variants instead of transmitting full-resolution files to mobile devices.
3. **Cumulative Layout Shift (CLS) Elimination:** Reserves exact layout dimensions before the image binary downloads.

---

## 2. Remote Image Authorization (`next.config.mjs`)

When displaying images hosted on an external backend (e.g. Laravel `/storage`, AWS S3, Cloudflare R2), you must register their domains in `next.config.mjs` under `remotePatterns`:

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

* **Anti-Pattern Warning:** Never set `images: { unoptimized: true }` globally. This disables image optimization across the entire application to bypass configuration. Always configure explicit `remotePatterns`.

---

## 3. Responsive Layout Patterns & CLS Elimination

### Pattern A: Fixed Dimensions (Avatars, Compact Badges)
When the display size is predetermined and static:

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
When images must dynamically adapt to parent containers (e.g. grid cards, product feeds):

* **Requirement 1:** The parent container must have `relative` positioning and an aspect ratio (e.g. `aspect-video`, `aspect-square`).
* **Requirement 2:** The `sizes` attribute **must be defined** so the browser requests the optimal image resolution for the current viewport width:

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

To optimize Core Web Vitals (Largest Contentful Paint):

* **Above-the-Fold Hero Media:** Set `priority={true}` on primary banners and top-of-page detail images so Next.js preloads them before initial page paint.
* **Below-the-Fold Feeds & Cards:** Omit `priority`. Next.js defaults to `loading="lazy"`, loading images only when they scroll into the viewport.

```javascript
// Above the fold - Hero Banner:
<Image
   src={heroImage}
   alt="Featured Promotion"
   fill
   priority={true}
   sizes="100vw"
   className="object-cover"
/>

// Below the fold - Grid Item:
<Image
   src={itemImage}
   alt={itemTitle}
   fill
   sizes="(max-width: 768px) 100vw, 33vw"
   className="object-cover"
/>
```
