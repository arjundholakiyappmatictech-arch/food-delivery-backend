# Component Colocation & Design System

---

## 1. Feature Colocation vs. shadcn/ui Primitives

To keep any project clean and maintainable, components are divided into two distinct directories:

1. **shadcn/ui Component Primitives (`src/components/ui/*.jsx`):**
   * Accessible, reusable UI building blocks (e.g. `button.jsx`, `input.jsx`, `dialog.jsx`, `badge.jsx`).
   * Written in **pure JavaScript (JSX)**, styled with **Tailwind CSS v4**, and class-merged with `cn()`.
   * Standardized on **`lucide-react`** for all icon controls.
   * Completely domain-agnostic (a shadcn `Button` knows nothing about business domain logic).
2. **Feature Components (`src/components/<feature>/*.jsx`):**
   * Domain-specific components (e.g. `src/components/<feature>/<Feature>Item.jsx`, `<Feature>Form.jsx`).
   * Colocated inside their dedicated feature folder.
   * **Rule:** Feature components compose shadcn/ui primitives (`<Button>`, `<Input>`) rather than inventing custom raw HTML tags.

---

## 2. Container vs. Presentational (Smart vs. Dumb) Pattern

Separating logic from presentation guarantees that components can be tested and reused easily in any application:

```javascript
// ❌ Forbidden (Tightly coupled: UI fetches its own data & manages store):
export function FeatureItem({ itemId }) {
   const { data } = useItemQuery(itemId); // Coupling data fetching to card
   const deleteItem = useStore((s) => s.deleteItem); // Coupled to store
   return <div onClick={() => deleteItem(itemId)}>{data?.title}</div>;
}

// ✅ Approved:
// 1. Dumb Presentational Leaf (src/components/<feature>/<Feature>Item.jsx):
export function FeatureItem({ item, onDelete }) {
   return (
      <div className="flex items-center justify-between p-3 border rounded-xl">
         <span>{item.title}</span>
         <Button variant="ghost" size="icon" onClick={() => onDelete(item.id)}>
            <Trash2 className="size-4 text-red-500" />
         </Button>
      </div>
   );
}

// 2. Smart Container (src/components/<feature>/<Feature>Container.jsx):
export function FeatureContainer() {
   const { data: items } = useItemsQuery();
   const { mutate: deleteItem } = useDeleteItemMutation();

   return (
      <div className="space-y-2">
         {items?.map((item) => (
            <FeatureItem key={item.id} item={item} onDelete={deleteItem} />
         ))}
      </div>
   );
}
```

---

## 3. The Flatness Invariant (Zero Frontend Versioning)

* **Rule:** Never introduce versioned folders (`components/v2/`, `hooks/v2/`, `services/v2/`).
* **Why:** API versioning is an infrastructure detail of the backend. It belongs strictly in `.env.local` (`NEXT_PUBLIC_API_URL=.../api/v1`) or isolated in Tier 5 URL strings.
* **Component Placement:** All feature components remain flat and version-agnostic.
