# Tomato: Project Requirements & Business Specifications

> **Canonical product specifications, business rules, domain entities, and user stories for the Tomato Food Delivery application.**

---

## 1. Product Overview & User Personas

Tomato is an enterprise food delivery platform connecting customers with nearby restaurants and delivery personnel. The platform enforces strict role-based access control (RBAC):

| Role | Scope & Permissions | Key User Flows |
| :--- | :--- | :--- |
| **Customer** | End-consumer placing food orders. | Browse nearby restaurants, search dishes, manage delivery addresses, cart, checkout (COD/Online), track order status, leave reviews. |
| **Restaurant Owner** | Vendor managing store operations. | Manage restaurant profile, operational hours, menu categories, menu items (pricing, availability), view and accept incoming orders. |
| **Delivery Agent** | Logistics driver fulfilling deliveries. | View assigned orders, update delivery status (picked up, in transit, delivered), view drop-off GPS coordinates. |
| **Admin** | System manager. | Platform overview, vendor verification, global order audit logs, user management. |

---

## 2. Core Feature Specifications & Business Rules

### Feature 1: Authentication & Customer Address Management
* **Authentication:** Token-based authentication using Laravel Sanctum (`access_token`).
* **Address Rules:**
  * Customers can save multiple delivery addresses (e.g. "Home", "Work").
  * Every address must store geographic coordinates (`latitude`, `longitude`) alongside street address, city, and postal code.
  * Exactly one address can be flagged as `is_default: true` at a time.

### Feature 2: Restaurant Discovery & Menu Catalog
* **Geographic Discovery:**
  * Restaurants must be discoverable based on user location using the Haversine formula (distance calculated in kilometers).
  * Filterable by category/cuisine (e.g., Italian, Burgers, Asian), average customer rating, and open/closed operational status.
* **Menu Rules:**
  * Menu items belong to a specific restaurant and category.
  * Inactive or out-of-stock items (`is_available: false`) cannot be added to a cart.

### Feature 3: Cart Management & Order Checkout
* **Single-Restaurant Cart Constraint:**
  * A customer's cart can only contain items from **one restaurant at a time**.
  * If a customer attempts to add an item from Restaurant B while their cart contains items from Restaurant A, the system must prompt to clear the cart before proceeding.
* **Pricing & Calculations:**
  * Subtotal = $\sum (\text{item\_price} \times \text{quantity})$.
  * Delivery Fee is calculated based on distance between restaurant and customer address coordinates.
  * Total = Subtotal + Delivery Fee + Tax.
* **Payment Methods:**
  * Cash on Delivery (`cod`).
  * Online card simulation (`card`).

### Feature 4: Order Lifecycle & State Machine
Orders must transition through a strict linear lifecycle:

```
[ Placed / Pending ] ──► [ Confirmed ] ──► [ Preparing ] ──► [ Ready for Pickup ] ──► [ Out for Delivery ] ──► [ Delivered ]
         │
         └──► [ Cancelled ] (Only permitted before status reaches 'Preparing')
```

* **Concurrency Safety:** Placing an order and updating order status must apply pessimistic database locking (`lockForUpdate()`) on order records.
* **Invoice Generation:** A customer can download a generated PDF invoice once an order is confirmed.

### Feature 5: Customer Ratings & Reviews
* **Review Gate:** A customer can only review a restaurant if they have at least one completed (`delivered`) order from that restaurant.
* **Rating Limits:** Numerical rating strictly between 1 and 5 stars, with an optional text comment.
* **Single Review Constraint:** Exactly one review per order.

---

## 3. Full-Stack Technical Invariants for Features

All code written for Tomato must conform to the two canonical handbooks:

### Backend Invariants (`backend/laravel-engineering-handbook/GUIDELINES.md`)
1. **2-Verb Routing:** `GET` for reading, `POST` for mutations (`/store`, `/{id}/update`, `/{id}/destroy`).
2. **Response Envelope:** Every API response must match ADR-001: `{ is_error, message, data, errors }`.
3. **Database Integrity:** Foreign keys must use `restrictOnDelete()`. Method-based `casts(): array` on models.
4. **Thin Controllers:** Controllers maintain transactions (`DB::beginTransaction()`, `DB::commit()`, `DB::rollBack()`); domain services in `app/Services/` own business logic.

### Frontend Invariants (`frontend/nextjs-engineering-handbook/GUIDELINES.md`)
1. **Strictly JavaScript:** Pure `.js` and `.jsx` only (zero TypeScript).
2. **5-Tier Flow:** Page (RSC) $\rightarrow$ Container (Client) $\rightarrow$ shadcn UI $\rightarrow$ TanStack Hook $\rightarrow$ Axios Service.
3. **Fresh by Default:** `staleTime: 0` on all queries. Cart, Orders, Checkout, and Addresses must **never** be cached.
4. **State Separation:** Server data in TanStack Query (`featureKeys`); UI state in Zustand with atomic selectors (`state => state.prop`); Forms in React Hook Form + Zod v4.
5. **UI & Icons:** shadcn/ui primitives with `lucide-react` exclusively.
6. **Workflow:** 100% focus on feature building first; testing is strictly on-demand.
