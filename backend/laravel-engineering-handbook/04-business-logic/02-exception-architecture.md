# Exception Architecture & Error Handling

> **The definitive standard for organizing domain exceptions in `app/Exceptions/`, mapping HTTP status codes safely, and enforcing the Base Controller exception delegation contract.**

---

## 1. Architectural Philosophy

In enterprise Laravel backends, errors fall into two distinct categories:
1. **Domain Rule Violations:** Predictable business failures (e.g., cart is empty, item unavailable, order already cancelled). These are represented by **Typed Domain Exceptions** and map directly to 4xx HTTP client errors.
2. **Infrastructure Failures:** Unpredicted technical failures (e.g., database connection loss, syntax error, payment gateway timeout). These represent 5xx server errors and must be sanitized to protect internal database schemas.

---

## 2. Domain Exception Organization

Domain exceptions reside in **`app/Exceptions/`** grouped into domain subdirectories:

```text
app/Exceptions/
├── Address/
│   ├── AddressLimitExceededException.php
│   ├── DuplicateAddressException.php
│   └── LastAddressCannotBeDeletedException.php
├── Carts/
│   ├── CartMenuItemMissingException.php
│   ├── MenuItemUnavailableException.php
│   └── RestaurantClosedException.php
├── Order/
│   ├── EmptyCartException.php
│   ├── OrderAlreadyCancelledException.php
│   └── OrderCannotBeCancelledException.php
└── Payment/
    ├── OrderAlreadyDeliveredExceptions.php
    └── PaymentAlreadyExistsExceptions.php
```

### Domain Exception Structure
Every domain exception must define a meaningful default message and an appropriate HTTP status code:

```php
<?php

declare(strict_types=1);

namespace App\Exceptions\Order;

use Exception;

class EmptyCartException extends Exception
{
    public function __construct(string $message = 'Cart is empty. Please add items before placing an order.')
    {
        parent::__construct(message: $message, code: 400);
    }
}
```

```php
<?php

declare(strict_types=1);

namespace App\Exceptions\Order;

use Exception;

class OrderCannotBeCancelledException extends Exception
{
    public function __construct(string $message = 'This order cannot be cancelled in its current state.')
    {
        parent::__construct(message: $message, code: 422);
    }
}
```

### Standard HTTP Status Mapping for Domain Exceptions

| Status Code | Meaning | When to Use | Example Exception |
| :--- | :--- | :--- | :--- |
| **`400 Bad Request`** | Malformed state | Action cannot proceed due to invalid business state | `EmptyCartException` |
| **`403 Forbidden`** | Unauthorized domain access | Entity does not belong to acting user | `AddressDoesNotBelongToUserException` |
| **`404 Not Found`** | Missing domain entity | Resource not found in domain context | `RestaurantNotFoundException` |
| **`409 Conflict`** | Duplicate or conflicting state | State collision | `DuplicateAddressException`, `PaymentAlreadyExistsException` |
| **`422 Unprocessable`** | State transition failure | Request valid, but entity lifecycle rejects mutation | `OrderCannotBeCancelledException` |

---

## 3. The Controller Exception Contract (Explicit try/catch)

Our backend enforces an **explicit controller-level `try / catch (Throwable $e)` pattern with a strict single catch block**.

* **Why Explicit Controller Catching:** It guarantees localized control over method responses, makes the control flow immediately obvious during code review, and delegates all error normalization to the Base Controller.
* **Strict Single Catch Block Standard:** Every controller method must contain **exactly one catch block**: `catch (Throwable $e)`. Writing multiple catch blocks (e.g., `catch (EmptyCartException)`, `catch (MenuItemUnavailableException)`) is strictly forbidden as it bloats controllers beyond the 15-line limit and duplicates error formatting.
* **Zero Bootstrap Logic:** `bootstrap/app.php` remains completely untouched (zero framework exception handling closures).

### Standard Controller Implementation:

```php
namespace App\Http\Controllers;

use App\Http\Requests\PlaceOrderRequest;
use App\Http\Resources\OrderResource;
use App\Services\OrderService;
use Illuminate\Http\JsonResponse;
use Throwable;

class OrderController extends Controller
{
    public function __construct(
        protected OrderService $orderService,
    ) {}

    public function store(PlaceOrderRequest $request): JsonResponse
    {
        try {
            $order = $this->orderService->store($request->user(), $request->validated());

            return $this->successResponse('Order placed successfully.', new OrderResource($order), 201);
        } catch (Throwable $e) {
            return $this->handleException($e);
        }
    }
}
```

---

## 4. Base Controller Delegation (`handleException`)

The Base Controller (`app/Http/Controllers/Controller.php`) owns the normalization of all caught exceptions into the **ADR-001 Unified Response Envelope**:

### Critical Safety Guardrail: Preventing HTTP `0` Crashes
In PHP, many core exceptions (e.g., PDO/Database exceptions, custom `RuntimeException`) return integer code `0` or string codes (e.g. `'23000'`).
* Passing `$e->getCode()` directly into `response()->json(..., $e->getCode())` causes Laravel to crash with `InvalidArgumentException: The HTTP status code "0" is not valid.`
* The Base Controller must sanitize status codes to ensure they fall within the valid HTTP range (`100` to `599`).

### Security Guardrail: Database `QueryException` Sanitization
* Never leak raw database queries or table schema names in production API responses.
* `QueryException` messages must be logged privately and replaced with a generic client-safe error message.

```php
namespace App\Http\Controllers;

use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Throwable;

abstract class Controller
{
    protected function handleException(Throwable $e): JsonResponse
    {
        // 1. Sanitize HTTP Status Code (prevent HTTP 0 crash)
        $code = (int) $e->getCode();
        $status = ($code >= 100 && $code < 600) ? $code : 500;

        // 2. Handle Database Exceptions Safely
        if ($e instanceof QueryException) {
            Log::error('Database Error: ' . $e->getMessage(), [
                'sql' => $e->getSql(),
                'bindings' => $e->getBindings(),
            ]);

            return $this->errorResponse(
                message: 'A database error occurred. Please try again later.',
                status: 500,
            );
        }

        // 3. Log Server Errors (5xx)
        if ($status >= 500) {
            Log::error('Server Error: ' . $e->getMessage(), [
                'exception' => get_class($e),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);
        }

        // 4. Return Normalized ADR-001 Error Envelope
        return $this->errorResponse(
            message: $e->getMessage() ?: 'An unexpected error occurred.',
            status: $status,
        );
    }
}
```

---

## 5. Review Rubric for Exceptions

| Check | Passing Criteria | Immediate Rejection Criteria |
| :--- | :--- | :--- |
| **Exception Categorization** | Grouped in `app/Exceptions/<Domain>/` | Dumping all exceptions loose into `app/Exceptions/` root |
| **HTTP Code Validation** | Status code sanitized to valid HTTP range (`100-599`) | Passing unvalidated `$e->getCode()` directly to response |
| **SQL Leakage** | Database `QueryException` sanitized to generic message | Returning `$e->getMessage()` directly on database failures |
| **Controller Contract** | Caught via a single `try / catch (Throwable $e)` delegating to `handleException` | Writing multiple catch blocks in controller or duplicating custom error formatting blocks |
| **Framework Boot Coupling** | Zero custom error logic in `bootstrap/app.php` | Adding domain exception rendering closures to `bootstrap/app.php` |
