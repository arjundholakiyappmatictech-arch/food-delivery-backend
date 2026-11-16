# Modern PHP Syntax & Enumeration Standards

---

## 1. Backed Enums for Statuses and Categories

Magic strings and integer flags (e.g. `'pending'`, `1`, `2`) are strictly prohibited for domain statuses. Use **string-backed Enums** with TitleCase keys:

```php
namespace App\Enums;

enum OrderStatus: string
{
    case Pending = 'pending';
    case Confirmed = 'confirmed';
    case Preparing = 'preparing';
    case OutForDelivery = 'out_for_delivery';
    case Delivered = 'delivered';
    case Cancelled = 'cancelled';

    /**
     * Determine if the order can transition to a cancelled state.
     */
    public function canBeCancelled(): bool
    {
        return match ($this) {
            self::Pending, self::Confirmed => true,
            default => false,
        };
    }
}
```

### Model Casting Integration:
Cast enums directly in Eloquent models using method-based `casts(): array`:
```php
protected function casts(): array
{
    return [
        'status' => OrderStatus::class,
    ];
}
```

---

## 2. Exhaustive Match Expressions

`switch` statements use loose comparison (`==`) and risk silent fall-through bugs. Always use exhaustive `match()` expressions:

```php
$deliveryFee = match ($order->status) {
    OrderStatus::Pending => 10.0,
    OrderStatus::Delivered => 0.0,
    default => 5.0,
};
```

---

## 3. Strict Identity & Null Safety

1. **Strict Equality:** Always use `===` and `!==`. Never use loose comparisons (`==` or `!=`).
2. **Nullsafe (`?->`) & Coalescing (`??`):** Safely traverse optional relations and supply defaults without throwing notices:
   ```php
   $userEmail = $order->customer?->email;
   $perPage = (int) ($request->validated()['per_page'] ?? 15);
   ```
