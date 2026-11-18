# Exception Architecture & Error Handling

---

## 1. Architectural Philosophy

Errors in backend services are strictly partitioned into two categories:
1. **Domain Rule Violations:** Predictable business failures (e.g. empty cart, item unavailable). Represented by **Typed Domain Exceptions** extending native `Exception` with 4xx status codes.
2. **Infrastructure Failures:** Technical failures (e.g. database disconnect, PDO failure). Sanitized to generic 500 errors to prevent schema leakage.

---

## 2. Domain Exception Organization

Domain exceptions reside in **`app/Exceptions/`** grouped into domain subdirectories:

```text
app/Exceptions/
├── Address/             # (AddressLimitExceededException.php)
├── Carts/               # (EmptyCartException.php, MenuItemUnavailableException.php)
├── Deliveries/          # (DeliveryAgentAlreadyAssignedException.php)
├── Mcp/                 # (OrderNotFoundException.php)
├── Order/               # (OrderAlreadyCancelledException.php)
├── Payment/             # (PaymentAlreadyExistsException.php)
├── Restaurant/          # (DuplicateRestaurantException.php)
└── Reviews/             # (ReviewOnlyDeliveredOrderException.php)
```

### Domain Exception Structure
Every domain exception directly extends PHP's native `Exception`, defining a meaningful default message and predefined HTTP status code via `parent::__construct()`:

```php
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

### Standard HTTP Status Mapping for Domain Exceptions

| Status Code | Meaning | When to Use | Example Exception |
| :--- | :--- | :--- | :--- |
| **`400 Bad Request`** | Malformed domain state | Action cannot proceed due to invalid business state | `EmptyCartException` |
| **`403 Forbidden`** | Unauthorized domain access | Entity does not belong to acting user | `AddressDoesNotBelongToUserException` |
| **`404 Not Found`** | Missing domain entity | Resource not found in domain context | `RestaurantNotFoundException` |
| **`409 Conflict`** | Duplicate or conflicting state | State collision | `DuplicateAddressException`, `PaymentAlreadyExistsException` |
| **`422 Unprocessable`** | State transition failure | Request valid, but entity lifecycle rejects mutation | `OrderCannotBeCancelledException` |

---

## 3. The Controller Exception Contract (Explicit Single Catch)

Our backend enforces an **explicit controller-level `try / catch (Throwable $e)` pattern with a strict single catch block**:

* **Transaction Rollback on Error:** When coordinating state mutations, the controller manages the transaction lifecycle via `DB::beginTransaction()`, `DB::commit()`, and explicitly executes `DB::rollBack()` inside the single catch block:
  ```php
  DB::beginTransaction();
  try {
      $result = $this->orderService->store($request->user(), $request->validated());
      DB::commit();

      return $this->successResponse('Order placed successfully.', new OrderResource($result), 201);
  } catch (Throwable $e) {
      DB::rollBack();

      return $this->handleException($e);
  }
  ```
* **Strict Single Catch Block:** Every controller method contains **exactly one catch block**: `catch (Throwable $e)`. Writing multiple catch blocks (e.g. catching specific domain exceptions) is strictly forbidden—it bloats controllers beyond the thin coordination limit and scatters response formatting.
* **Zero Bootstrap Logic (Direct Override of Laravel Boost):** `bootstrap/app.php` remains completely untouched (zero framework exception rendering closures). Custom `render()` methods on exceptions are also forbidden.
* **Reference Implementation:** See [GUIDELINES.md Section 3A](../GUIDELINES.md#a-controller-pattern-ultra-thin-typically-15-lines-with-single-catch-block) for the canonical controller signature.

---

## 4. Base Controller Delegation (`handleException`)

The Base Controller (`app/Http/Controllers/Controller.php`) owns the normalization of all caught exceptions into the **ADR-001 Unified Response Envelope**:

### Critical Safety Guardrails:
1. **Preventing HTTP `0` Crashes:** PHP PDO and core exceptions often return code `0` or string codes (`'23000'`). Passing `$e->getCode()` directly to `response()->json()` causes fatal framework crashes. Status codes must be sanitized to the valid range (`100`–`599`), falling back to `500`.
2. **Database `QueryException` Sanitization:** Raw database queries, bindings, and table names must **never** be returned to the client. They must be logged privately and replaced with a generic client-safe error message.

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

        // 2. Handle Database Exceptions Safely (Mask SQL & schema details)
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
