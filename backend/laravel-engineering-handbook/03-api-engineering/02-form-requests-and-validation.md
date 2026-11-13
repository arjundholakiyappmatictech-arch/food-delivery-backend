# Chapter 03.2: Form Requests & Validation Architecture

> **Module:** `03-api-engineering`  
> **Classification:** Approved Engineering Standard (Our Organization)  
> **Status:** Active  

---

## 1. Architectural Philosophy

Validation is the backend's first line of defense. The primary responsibility of validation is to guarantee that **no malformed, unauthorized, or structurally invalid payload ever reaches the domain service layer**.

In our architecture:
1. **Validation is isolated in dedicated Form Request classes:** Controllers must never call `$request->validate()` inline.
2. **Array rule definitions are mandatory:** Pipe-delimited string validation rules are prohibited.
3. **Domain boundary protection:** The service layer expects clean, pre-sanitized arrays sourced strictly from `$request->validated()`.

---

## 2. Mandatory Validation Standards

### A. Strict Array Syntax
All validation rules must be written as arrays containing string primitives or fluent `Illuminate\Validation\Rule` instances.

| Standard Rule Syntax | Forbidden Anti-Pattern | Reason |
| :--- | :--- | :--- |
| `['required', 'string', 'max:255']` | `'required\|string\|max:255'` | Pipe strings fail when parameters contain regex patterns or delimiter colons; arrays support static analysis. |
| `['required', Rule::exists('addresses', 'id')]` | `'required\|exists:addresses,id'` | Fluent rule objects allow compile-time analysis, query scoping, and dynamic parameter injection. |

---

### B. Authorization Within Form Requests
Every Form Request contains an `authorize(): bool` method. This method must either:
1. Enforce policy-based authorization using `$this->user()->can(...)`.
2. Return `true` **only if** the endpoint is public or authorization is completely delegated to an explicit controller policy call.
3. Never leave `authorize()` as unreviewed boilerplate.

```php
// ✅ APPROVED: Policy-governed Form Request authorization
public function authorize(): bool
{
    $order = $this->route('order');

    return $order !== null && $this->user()?->can('update', $order);
}
```

---

### C. Contextual & Scoped Existence Validation
Ownership verification for relational foreign keys should be performed at the validation layer rather than manually queried inside services:

```php
// ✅ APPROVED: Context-aware existence check scoped to the requesting user
public function rules(): array
{
    return [
        'address_id' => [
            'required',
            'integer',
            Rule::exists('addresses', 'id')->where(fn ($query) => 
                $query->where('user_id', $this->user()?->id)
                      ->whereNull('deleted_at')
            ),
        ],
        'items' => ['required', 'array', 'min:1'],
        'items.*.menu_item_id' => [
            'required',
            'integer',
            Rule::exists('menu_items', 'id')->where('is_available', true),
        ],
        'items.*.quantity' => ['required', 'integer', 'min:1', 'max:50'],
    ];
}
```

---

### D. Strict Extraction via `$request->validated()`
Controllers must **never** pass raw input (`$request->all()`, `$request->input()`) to domain services:

```php
// ❌ FORBIDDEN: Raw input injection
$this->orderService->store($request->user(), $request->all());

// ✅ APPROVED: Only validated fields enter the domain layer
$this->orderService->store($request->user(), $request->validated());
```

---

## 3. Standard Form Request Implementation

```php
<?php

declare(strict_types=1);

namespace App\Http\Requests\Orders;

use App\Enums\PaymentMethodEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

class StoreOrderRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'restaurant_id' => [
                'required',
                'integer',
                Rule::exists('restaurants', 'id')->where('is_active', true),
            ],
            'delivery_address_id' => [
                'required',
                'integer',
                Rule::exists('addresses', 'id')->where('user_id', $this->user()?->id),
            ],
            'payment_method' => [
                'required',
                'string',
                new Enum(PaymentMethodEnum::class),
            ],
            'items' => [
                'required',
                'array',
                'min:1',
            ],
            'items.*.menu_item_id' => [
                'required',
                'integer',
                Rule::exists('menu_items', 'id'),
            ],
            'items.*.quantity' => [
                'required',
                'integer',
                'min:1',
                'max:99',
            ],
            'special_instructions' => [
                'nullable',
                'string',
                'max:500',
            ],
        ];
    }

    /**
     * Custom attribute names for validation failure descriptions.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'delivery_address_id' => 'delivery address',
            'items.*.menu_item_id' => 'menu item',
            'items.*.quantity' => 'quantity',
        ];
    }
}
```

---

## 4. Alignment with ADR-001 (Response Envelope)

When a Form Request fails validation, Laravel automatically throws `Illuminate\Validation\ValidationException`. 

Under **ADR-001**, the backend serializes all 422 Unprocessable Entity responses into the unified error envelope:

```json
{
  "is_error": true,
  "message": "The given data was invalid.",
  "data": null,
  "errors": {
    "delivery_address_id": [
      "The selected delivery address is invalid."
    ],
    "items.0.quantity": [
      "The quantity must be at least 1."
    ]
  }
}
```

### Invariant Rules for Validation Responses:
1. **`is_error`**: Strictly `true`.
2. **`message`**: A non-empty summary string (default: `"The given data was invalid."`).
3. **`data`**: Strictly `null`. Never return `[]`.
4. **`errors`**: Sourced directly from `$validator->errors()->toArray()`, formatted as an associative map (`array<string, array<string>>`).
