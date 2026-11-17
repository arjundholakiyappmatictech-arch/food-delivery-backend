# Module 04: Business Logic & Domain Architecture

> Architectural specifications for designing decoupled domain services, atomic transaction boundaries, and the domain exception hierarchy.

---

## 1. Directory Contents

1. **[01 - Service Layer Design & Domain Boundaries](01-service-layer-design.md):**
   * Flat service placement in `app/Services/` with direct Eloquent model interaction.
   * Explicit actor injection (`User $user`) and strict prohibition of `Auth::user()`.
   * Zero-HTTP-latency database transaction boundaries.
   * Queue job and domain event dispatching using `->afterCommit()`.
   * Strongly typed domain return contracts (Models, Collections, Paginators).

2. **[02 - Exception Architecture & Error Handling](02-exception-architecture.md):**
   * Domain-grouped exception categorization under `app/Exceptions/<Domain>/`.
   * Extending native `Exception` with predefined HTTP status codes via `parent::__construct()`.
   * Controller-level single `try / catch (Throwable $e)` delegating to `BaseController::handleException()`.
   * Zero custom logic in `bootstrap/app.php` and prohibition of custom `render()` methods.
   * Preventing HTTP `0` crashes and masking database `QueryException` schema leakage.

---

## 2. Request & Execution Lifecycle

```mermaid
sequenceDiagram
    autonumber
    participant Client as API Consumer
    participant Ctrl as OrderController
    participant Req as PlaceOrderRequest
    participant Svc as OrderService
    participant Ext as External Payment API (Razorpay)
    participant DB as Database (DB::transaction)
    participant Base as Base Controller (handleException)

    Client->>Ctrl: POST /api/v1/orders/store
    Ctrl->>Req: validated()
    Req-->>Ctrl: Validated Array Payload

    Ctrl->>Svc: store(User $user, array $data)
    
    rect rgb(240, 248, 255)
        Note over Svc,Ext: External HTTP Pre-flight (Zero DB Connection Lock)
        Svc->>Ext: Verify Payment / Create Order ID
        Ext-->>Svc: Payment Token Verified
    end

    rect rgb(245, 245, 245)
        Note over Svc,DB: Atomic Database Boundary
        Svc->>DB: DB::transaction()
        DB-->>Svc: Lock rows, deduct inventory, persist Order & OrderItems
        Svc->>DB: Dispatch OrderPlaced event ->afterCommit()
    end

    alt Success
        Svc-->>Ctrl: Order Model
        Ctrl-->>Client: 201 Created (ADR-001 Envelope)
    else Domain Exception (e.g. EmptyCartException)
        Svc-->>Ctrl: throw new EmptyCartException()
        Ctrl->>Base: handleException($e)
        Base-->>Client: 400 Bad Request ({ is_error: true, message, data: null })
    end
```

---

## 3. Invariant Summary Matrix

| Category | Standard Rule | Prohibited Anti-Pattern |
| :--- | :--- | :--- |
| **Service Placement** | Flat directory directly under `app/Services/`. | Introducing `Repositories/`, `DTOs/`, or `Actions/` folders. |
| **Actor Context** | Always pass acting user explicitly as `User $user` parameter. | Calling `Auth::user()`, `auth()->user()`, or `request()` inside services. |
| **Transaction Boundary** | Execute external HTTP calls (Razorpay, Stripe) **before** `DB::transaction()`. | Invoking external HTTP APIs inside database transaction blocks. |
| **Queue Dispatching** | Always append `->afterCommit()` when dispatching inside transactions. | Dispatching queue jobs inside transactions without commit hooks. |
| **Return Contracts** | Return Models, Collections, or Paginators. | Returning `JsonResponse` or HTTP responses directly from services. |
| **Controller Catch Contract** | Single `catch (Throwable $e)` delegating to `BaseController::handleException()`. | Multiple catch blocks in controllers; custom error rendering in `bootstrap/app.php`. |
| **Exception Sanitization** | Sanitize codes to HTTP range (`100–599`); mask database `QueryException`. | Passing unvalidated `$e->getCode()` (HTTP 0 crash); leaking SQL in API responses. |
