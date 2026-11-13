# Chapter 03.3: API Resources & Transformation Layer

> **Module:** `03-api-engineering`  
> **Classification:** Approved Engineering Standard (Our Organization)  
> **Status:** Active  

---

## 1. Architectural Philosophy

API Resources (`Illuminate\Http\Resources\Json\JsonResource`) represent the **transformation and presentation boundary** of our backend applications. 

Their responsibility is to convert internal Eloquent models and domain structures into immutable, deterministic API payloads.

### Core Principles:
1. **Never Return Raw Eloquent Models:** Controllers must never return Eloquent models directly to the HTTP response. Doing so leaks internal database schemas, exposes uncast attributes, and risks sensitive column disclosure.
2. **Database Schema Decoupling:** Database column renames or internal table refactors should never break external API contracts; the Resource maps database attributes to public schema fields.
3. **Strict N+1 Query Guardrails:** Resources must strictly use relationship guards (`$this->whenLoaded()`) to prevent the transformation layer from triggering lazy queries during serialization.

---

## 2. Mandatory Resource Standards

### A. Eager-Loading Protection via `whenLoaded`
Accessing Eloquent relationship properties directly inside a resource (e.g. `$this->user->name` or `$this->items`) triggers lazy-loading on every iteration, causing catastrophic N+1 query loops.

All relationship transformations must be wrapped in `$this->whenLoaded()`:

```php
// ❌ FORBIDDEN: Triggers lazy-loading for every serialized record
'customer' => [
    'id' => $this->user->id,
    'name' => $this->user->name,
],
'items' => OrderItemResource::collection($this->items),

// ✅ APPROVED: Only transforms when relations were eagerly loaded by the query
'customer' => new UserResource($this->whenLoaded('user')),
'items' => OrderItemResource::collection($this->whenLoaded('items')),
```

---

### B. Explicit Attribute Casting
Do not rely on implicit PHP type coercion. Ensure all values in the returned array are explicitly typed:

* **Timestamps:** Suffix with ISO 8601 string formatting: `$this->created_at?->toIso8601String()`.
* **Monetary / Decimal Values:** Cast explicitly to float or keep as integer cents: `(float) $this->total_amount`.
* **Booleans:** Explicit boolean casting: `(bool) $this->is_active`.
* **Null Safety:** Use PHP nullsafe operators (`?->`) for optional nested attributes.

---

### C. Conditional Attributes
Use `$this->when()` and `$this->mergeWhen()` to conditionally include attributes based on backend business context or authorization policies:

```php
'internal_notes' => $this->when(
    $request->user()?->can('viewInternalNotes', $this->resource),
    $this->internal_notes
),
$this->mergeWhen($this->is_delivered, [
    'delivered_at' => $this->delivered_at?->toIso8601String(),
    'delivery_duration_minutes' => $this->delivery_duration_minutes,
]),
```

---

## 3. Standard Resource Implementation

```php
<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\Order
 */
class OrderResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_number' => $this->order_number,
            'status' => $this->status,
            'payment_status' => $this->payment_status,
            'subtotal' => (float) $this->subtotal,
            'tax_amount' => (float) $this->tax_amount,
            'delivery_fee' => (float) $this->delivery_fee,
            'total_amount' => (float) $this->total_amount,
            'special_instructions' => $this->special_instructions,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),

            // Eager-loaded Relationships (Guarded)
            'customer' => new UserResource($this->whenLoaded('user')),
            'restaurant' => new RestaurantResource($this->whenLoaded('restaurant')),
            'delivery_address' => new AddressResource($this->whenLoaded('deliveryAddress')),
            'items' => OrderItemResource::collection($this->whenLoaded('items')),

            // Conditional Attributes
            'cancellation_reason' => $this->when($this->status === 'cancelled', $this->cancellation_reason),
            'cancelled_at' => $this->when($this->status === 'cancelled', fn () => $this->cancelled_at?->toIso8601String()),
        ];
    }
}
```

---

## 4. Resource Collections & Pagination

When transforming paginated Eloquent queries, pass the paginator directly to the static `collection()` method:

```php
public function index(Request $request): JsonResponse
{
    try {
        $orders = $this->orderService->listForUser(
            user: $request->user(),
            perPage: (int) $request->input('per_page', 15)
        );

        return $this->successResponse(
            message: 'Orders retrieved successfully.',
            data: OrderResource::collection($orders),
            status: 200,
            pagination: $this->pagination($orders)
        );
    } catch (Throwable $e) {
        return $this->handleException($e);
    }
}
```

### Architectural Benefit:
* `OrderResource::collection($orders)` serializes the items cleanly without polluting the collection with Laravel's default unformatted pagination envelope.
* The Base Controller `pagination()` helper standardizes pagination metadata under the dedicated `"pagination"` key conforming to **ADR-001**.
