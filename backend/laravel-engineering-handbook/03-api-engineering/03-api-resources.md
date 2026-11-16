# API Resources & Transformation Layer

---

## 1. Architectural Philosophy

API Resources (`Illuminate\Http\Resources\Json\JsonResource`) represent the **transformation and presentation boundary** of our backend applications. They convert internal Eloquent models and domain structures into deterministic, immutable API payloads.

### Core Invariants:
1. **Never Return Raw Eloquent Models:** Controllers must never return Eloquent models directly to the HTTP response. Doing so leaks internal database column names, exposes uncast attributes, and risks sensitive data disclosure.
2. **Strict N+1 Query Guardrails:** All relational transformations must be guarded with `$this->whenLoaded()` to prevent serialization from triggering lazy-loading queries.
3. **Deterministic Type Contracts:** All attributes must be explicitly cast to ensure stable JSON output.

---

## 2. Mandatory Resource Invariants

### A. Eager-Loading Protection via `whenLoaded`
Accessing relationship properties directly (e.g. `$this->user->name` or `$this->items`) triggers lazy-loading on every serialized record, creating N+1 query loops. Wrap all relationship transformations in `$this->whenLoaded()`:

```php
// ❌ FORBIDDEN: Triggers lazy-loading queries during serialization
'customer' => ['id' => $this->user->id, 'name' => $this->user->name],
'items' => OrderItemResource::collection($this->items),

// ✅ APPROVED: Only transforms when relations were eagerly loaded by the query
'customer' => new UserResource($this->whenLoaded('user')),
'items' => OrderItemResource::collection($this->whenLoaded('items')),
```

### B. Explicit Attribute & Timestamp Casting
Do not rely on implicit PHP type coercion:
* **Timestamps:** Format explicitly to ISO 8601 strings: `$this->created_at?->toIso8601String()`.
* **Monetary / Decimal Values:** Cast explicitly to float: `(float) $this->total_amount`.
* **Booleans:** Cast explicitly: `(bool) $this->is_active`.
* **Null Safety:** Safely traverse optional nested relationships using `?->`.

### C. Conditional Attributes
Use `$this->when()` and `$this->mergeWhen()` with typed Enums for state-dependent fields:

```php
'cancellation_reason' => $this->when(
    $this->status === OrderStatus::Cancelled,
    $this->cancellation_reason
),
$this->mergeWhen($this->status === OrderStatus::Delivered, [
    'delivered_at' => $this->delivered_at?->toIso8601String(),
]),
```

---

## 3. Canonical Resource Implementation

```php
namespace App\Http\Resources;

use App\Enums\OrderStatus;
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

            // Eager-loaded Relationships (Guarded against N+1)
            'customer' => new UserResource($this->whenLoaded('user')),
            'restaurant' => new RestaurantResource($this->whenLoaded('restaurant')),
            'delivery_address' => new AddressResource($this->whenLoaded('deliveryAddress')),
            'items' => OrderItemResource::collection($this->whenLoaded('items')),

            // Conditional Attributes (Enum-Guarded)
            'cancellation_reason' => $this->when(
                $this->status === OrderStatus::Cancelled,
                $this->cancellation_reason
            ),
            'cancelled_at' => $this->when(
                $this->status === OrderStatus::Cancelled,
                fn () => $this->cancelled_at?->toIso8601String()
            ),
        ];
    }
}
```

---

## 4. Resource Collections & Pagination (ADR-001)

When transforming paginated Eloquent queries, pass the paginator directly to `Resource::collection()` and delegate metadata to the Base Controller `$this->pagination()` helper:

```php
return $this->successResponse(
    message: 'Orders retrieved successfully.',
    data: OrderResource::collection($orders),
    status: 200,
    pagination: $this->pagination($orders)
);
```

* `Resource::collection($orders)` serializes the data items cleanly without injecting Laravel's default unformatted pagination envelope.
* The Base Controller `$this->pagination()` helper isolates page metadata under the dedicated `"pagination"` key conforming to **ADR-001**.
