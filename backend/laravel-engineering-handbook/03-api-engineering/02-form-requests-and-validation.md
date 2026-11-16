# Form Requests & Validation Architecture

---

## 1. Architectural Philosophy

Validation is the backend's first line of defense. The primary responsibility of validation is to guarantee that **no malformed, unauthorized, or structurally invalid payload ever reaches the domain service layer**.

### Core Invariants:
1. **Isolated in Dedicated Form Requests:** Controllers must never execute inline `$request->validate()`.
2. **Mandatory Array Syntax:** Pipe-delimited string rules (`'required|string'`) are strictly prohibited.
3. **Domain Boundary Protection:** Services only receive pre-sanitized payloads sourced strictly from `$request->validated()`.

---

## 2. Mandatory Validation Invariants

### A. Strict Array Syntax
All validation rules must be written as arrays containing string primitives or fluent `Rule` objects:

| Approved Array Syntax | Forbidden Anti-Pattern | Reason |
| :--- | :--- | :--- |
| `['required', 'string', 'max:255']` | `'required\|string\|max:255'` | Pipe strings break with regex/colons; arrays support static analysis. |
| `['required', Rule::exists('addresses', 'id')]` | `'required\|exists:addresses,id'` | Fluent rule objects allow query scoping and dynamic parameter injection. |

### B. Authorization Within Form Requests
Every Form Request defines an `authorize(): bool` method that enforces access before validation runs:

```php
public function authorize(): bool
{
    $order = $this->route('order');

    return $order !== null && $this->user()?->can('update', $order);
}
```

### C. Contextual & Scoped Ownership Validation
Foreign key ownership must be validated at the HTTP boundary using `Rule::exists()->where('user_id', $this->user()?->id)` rather than querying manually inside domain services (see implementation below in Section 3).

### D. Strict Extraction via `$request->validated()`
Controllers must **never** pass raw input (`$request->all()`, `$request->input()`) into domain services:

```php
// ❌ FORBIDDEN: Raw unvalidated input injection
$this->orderService->store($request->user(), $request->all());

// ✅ APPROVED: Only validated fields enter the domain layer
$this->orderService->store($request->user(), $request->validated());
```

---

## 3. Canonical Form Request Implementation

```php
namespace App\Http\Requests\Orders;

use App\Enums\PaymentMethod;
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
                new Enum(PaymentMethod::class),
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

> [!NOTE]
> When validation fails, the response automatically serializes into the standardized **ADR-001** 422 error envelope (`is_error: true`, `data: null`, `errors: { ... }`). See [GUIDELINES.md Section 3C](../GUIDELINES.md#c-adr-001-unified-response-envelope).
