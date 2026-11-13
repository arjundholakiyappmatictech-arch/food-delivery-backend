# Chapter 01.1: PHP Typing & Modern Syntax Standards

> **Module:** `01-fundamentals`  
> **Classification:** Widely Accepted PHP Engineering Standard & Organizational Mandatory Rule  
> **Target Runtime:** PHP 8.3+ / 8.4+  
> **Status:** Active  

---

## 1. Strict Typing Directive (`declare(strict_types=1);`)

PHP's default mode coerces types automatically (e.g. silently turning integer `1` into boolean `true`, or string `"100"` into integer `100`). In our backend applications, automatic coercion is **strictly prohibited**.

### Standard:
Every PHP file containing classes, traits, enums, or interfaces must declare strict typing immediately following the opening tag:

```php
<?php

declare(strict_types=1);

namespace App\Services;
```

### Architectural Benefit:
* Guarantees that functions and services receive exact data types, preventing unexpected rounding or null pointer errors.
* Enables PHPStan / Larastan at Level 8+ to analyze code without false negatives.

---

## 2. Explicit Parameter and Return Type Declarations

Every function and class method must explicitly declare:
1. All parameter types.
2. An explicit return type (including `: void`, `: never`, or nullable `: ?Model`).

```php
// ❌ FORBIDDEN: Missing parameter and return types
public function calculateTotal($order, $discount)
{
    return $order->subtotal - $discount;
}

// ✅ APPROVED: Strict type signature
public function calculateTotal(Order $order, float $discountAmount): float
{
    return max(0.0, (float) $order->subtotal - $discountAmount);
}
```

### Void vs. Never:
* Use `: void` when a method executes side effects (such as logging or dispatching an event) without returning a value.
* Use `: never` for functions that terminate execution or always throw an exception.

---

## 3. Constructor Property Promotion

To eliminate redundant boilerplate property definitions and assignments, all service classes, DTOs, value objects, and events must use **Constructor Property Promotion**:

```php
// ❌ FORBIDDEN: Verbose redundant property declarations
class OrderService
{
    protected PaymentGatewayInterface $paymentGateway;
    protected TaxCalculator $taxCalculator;

    public function __construct(PaymentGatewayInterface $paymentGateway, TaxCalculator $taxCalculator)
    {
        $this->paymentGateway = $paymentGateway;
        $this->taxCalculator = $taxCalculator;
    }
}

// ✅ APPROVED: Clean constructor promotion
class OrderService
{
    public function __construct(
        protected readonly PaymentGatewayInterface $paymentGateway,
        protected readonly TaxCalculator $taxCalculator,
    ) {}
}
```

> [!TIP]
> Mark injected dependencies as `readonly` when they should not be reassigned during the lifecycle of the instance.

---

## 4. Backed Enums for Statuses and Categories

Magic strings and integer flags (e.g., `'pending'`, `'completed'`, `1`, `2`) are prohibited for domain statuses, role types, and categories. Use **string-backed Enums**:

```php
<?php

declare(strict_types=1);

namespace App\Enums;

enum OrderStatus: string
{
    case PENDING = 'pending';
    case CONFIRMED = 'confirmed';
    case PREPARING = 'preparing';
    case OUT_FOR_DELIVERY = 'out_for_delivery';
    case DELIVERED = 'delivered';
    case CANCELLED = 'cancelled';

    /**
     * Determine if the order can transition to a cancelled state.
     */
    public function canBeCancelled(): bool
    {
        return match ($this) {
            self::PENDING, self::CONFIRMED => true,
            self::PREPARING, self::OUT_FOR_DELIVERY, self::DELIVERED, self::CANCELLED => false,
        };
    }
}
```

### Integrating with Eloquent:
Declare model casts using the enum class:
```php
protected function casts(): array
{
    return [
        'status' => OrderStatus::class,
    ];
}
```

---

## 5. Match Expressions vs. Switch Statements

`switch` statements in PHP use loose comparison (`==`) and require verbose `break;` statements that risk silent fall-through bugs.

**Rule:** Always prefer `match()` expressions over `switch`.

```php
// ❌ FORBIDDEN: Switch statement with loose comparison
switch ($status) {
    case 'pending':
        $fee = 10.0;
        break;
    case 'delivered':
        $fee = 0.0;
        break;
    default:
        $fee = 5.0;
}

// ✅ APPROVED: Exhaustive, strictly typed match expression
$fee = match ($status) {
    OrderStatus::PENDING => 10.0,
    OrderStatus::DELIVERED => 0.0,
    default => 5.0,
};
```

---

## 6. Null Safety & Strict Comparisons

1. **Strict Equality:** Always use `===` and `!==`. Never use `==` or `!=`.
2. **Nullsafe Operator (`?->`):** Use when traversing optional object properties or relationships that may evaluate to `null`:
   ```php
   $userEmail = $order->customer?->email;
   ```
3. **Null Coalescing (`??`):** Provide safe fallbacks without issuing `Undefined index` notices:
   ```php
   $perPage = (int) ($request->validated()['per_page'] ?? 15);
   ```

