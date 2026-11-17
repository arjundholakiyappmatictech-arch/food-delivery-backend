# Global Laravel Engineering Guidelines

> **The canonical reference document for backend developers and AI coding agents. Read this file before creating, modifying, refactoring, or reviewing code in any Laravel application. Auto-loaded via root [`AGENTS.md`](../../AGENTS.md).**

---

## 1. Core Engineering Pillars

1. **Thin Controllers, Rich Domain:** Controllers coordinate HTTP requests; they do not calculate prices, format distances, or execute queries directly.
2. **Decoupled Business Logic:** Domain services must be callable from HTTP, Console commands, Queue jobs, and AI MCP tools without depending on global HTTP or session state.
3. **Data Integrity Above All:** Database operations involving multiple mutations must be wrapped in atomic transactions with zero external HTTP latency inside transaction boundaries.

---

## 2. Mandatory Standards vs. Forbidden Anti-Patterns

| Category | Approved Standard | Forbidden Anti-Pattern |
| :--- | :--- | :--- |
| **HTTP Routing Methods** | Strict 2-verb model: `GET` for fetching (`index`, `show`); `POST` for mutations. **CRUD operations MUST use standard suffixes (`/store`, `/{id}/update`, `/{id}/destroy`). Custom operations use descriptive custom names (e.g. `/{id}/cancel`, `/{id}/verify`).** | Using `PUT`, `PATCH`, or `DELETE` methods; performing mutations inside `GET` routes; using inconsistent CRUD suffixes. |
| **API Versioning** | Mandatory `v1` URL prefix (`/api/v1/...`). Route `name()` attribute is not required. | Unversioned routes (`/api/orders`). |
| **Validation** | Array validation syntax (`['required', 'string', 'max:255']`) | Mixing pipe strings (`'required\|string'`) with arrays |
| **Responses** | Company standard JSON envelope (ADR-001): `"is_error": false`, `"message": "..."`, `"data": ...`. On failure: `"is_error": true`, `"message": "..."`, `"data": null`. On 422: include `"errors": { ... }`. | Inconsistent keys (`status` or `success` instead of `is_error`); returning `"data": []` on error (schema type mutation); omitting `"message"` on validation errors. |
| **Exception Handling** | Explicit controller-level single `try / catch (Throwable $e)` delegating to Base Controller `handleException($e)`. Domain exceptions extend PHP's native `Exception` directly with predefined HTTP status codes via `parent::__construct(message: ..., code: ...)`. Zero logic in `bootstrap/app.php`. | Multiple catch blocks in controllers; passing unvalidated `$e->getCode()` directly to response (HTTP 0 crashes); leaking raw SQL queries from `QueryException`. |
| **Service Context**| Always pass acting User entity explicitly as `User $user` parameter into service methods | Relying on `Auth::user()` inside domain services |
| **Transactions** | Execute external HTTP calls (e.g. Razorpay, Stripe) **before** opening DB transactions | Calling external APIs inside `DB::transaction()` blocks |
| **Queue Dispatch**| Dispatch transactional jobs using `->afterCommit()` or outside transaction block | Dispatching queue jobs inside transactions without commit hooks |
| **Model Casting** | Use method-based `protected function casts(): array` for dates, decimals, booleans, hashes | Leaving booleans, decimals, and dates uncast |
| **Foreign Keys** | Use `restrictOnDelete()` or soft deletes for financial and historical data | `cascadeOnDelete()` on orders, payments, or ledger records |

---

## 3. Approved Implementation Signatures

### A. Controller Pattern (Ultra-Thin <15 lines with Single Catch Block)
Every controller action coordinates input, delegates to a Service, and catches all errors into `BaseController::handleException($e)`. `bootstrap/app.php` remains completely untouched.
```php
public function store(StoreAddressRequest $request): JsonResponse
{
    try {
        $address = $this->addressService->store($request->user(), $request->validated());

        return $this->successResponse('Address created successfully', new AddressResource($address), 201);
    } catch (Throwable $e) {
        return $this->handleException($e);
    }
}
```

### B. Routing Pattern (Strict 2-Verb Model with Explicit Suffixes)
Only `GET` (fetch) and `POST` (mutations) are allowed. `PUT`, `PATCH`, and `DELETE` are strictly forbidden.
```php
Route::prefix('v1')->group(function () {
    Route::get('orders', [OrderController::class, 'index']);
    Route::get('orders/{order}', [OrderController::class, 'show']);
    Route::post('orders/store', [OrderController::class, 'store']);
    Route::post('orders/{order}/update', [OrderController::class, 'update']);
    Route::post('orders/{order}/destroy', [OrderController::class, 'destroy']);
    Route::post('orders/{order}/cancel', [OrderController::class, 'cancel']);
});
```

### C. ADR-001 Unified Response Envelope
Every API response strictly conforms to this schema. On error, `data` is strictly `null` (never `[]`).
```json
// 1. Success (HTTP 200/201):
{ "is_error": false, "message": "Resource created.", "data": { "id": 1 } }

// 2. Client/Server Error (HTTP 400, 401, 403, 404, 500):
{ "is_error": true, "message": "Order cannot be cancelled.", "data": null }

// 3. Validation Failure (HTTP 422):
{ "is_error": true, "message": "The given data was invalid.", "data": null, "errors": { "field": ["Error"] } }
```

### D. Service & Transaction Safety Boundaries
Always pass `User $user` explicitly into services (never call `Auth::user()`). External HTTP APIs must be called outside `DB::transaction()`. Queue jobs inside transactions must use `->afterCommit()`.
```php
public function processOrderPayment(User $user, Order $order): Payment
{
    // 1. Call external HTTP gateway BEFORE opening DB transaction
    $gatewayOrder = $this->paymentGateway->createOrder($order->total);

    // 2. Open DB transaction strictly for atomic persistence
    return DB::transaction(function () use ($user, $order, $gatewayOrder) {
        $payment = Payment::create([
            'user_id' => $user->id,
            'order_id' => $order->id,
            'gateway_id' => $gatewayOrder['id'],
            'status' => 'pending',
        ]);

        // 3. Dispatch queue jobs using ->afterCommit()
        SendReceiptJob::dispatch($payment)->afterCommit();

        return $payment;
    });
}
```

### E. Model Casting & Eloquent Relations
Use method-based `casts(): array` and wrap relationships in `$this->whenLoaded()` in API Resources to prevent lazy-loading N+1 queries.
```php
protected function casts(): array
{
    return [
        'total' => 'decimal:2',
        'is_active' => 'boolean',
        'delivered_at' => 'datetime',
    ];
}
```

---

## 4. Topic Modules Directory

For in-depth explanations, trade-offs, and complete code samples, consult the handbook topic modules:

### Active Modules

#### [01 - Fundamentals & Language Standards](01-fundamentals/README.md)
* **What it Does:** Enforces modern PHP 8.4 syntax, backed enums, type safety, and pragmatic SOLID boundaries across all backend domain code.
* **Child Specifications:** [01 - Modern PHP Syntax & Enums](01-fundamentals/01-php-typing-and-modern-syntax.md) | [02 - Pragmatic SOLID Principles](01-fundamentals/02-solid-in-laravel.md)
* **Actionable Directives for AI Agents:**
  * **Backed Enums:** Never use magic strings or integer flags for statuses. Always use string-backed Enums with TitleCase keys (`OrderStatus::Pending = 'pending'`) and register them in model `casts(): array`.
  * **Conditionals:** Always use exhaustive `match()` expressions for state transitions and mappings; never use `switch` statements or nested `if/else` ladders.
  * **Strict Identity:** Always use strict comparison (`===`, `!==`). Use nullsafe `?->` and null coalescing `??` for safe relation and array traversal.
  * **Single Responsibility (SRP):** Enforce strict 5-tier pipeline: `FormRequest` (validation/auth) $\rightarrow$ `Controller` (<15 lines delegation) $\rightarrow$ `Domain Service` (business logic/transactions) $\rightarrow$ `API Resource` (response) $\rightarrow$ `Queue Job` (async latency).
  * **Domain Exceptions (LSP):** Custom domain exceptions must extend PHP's native `Exception` directly and pass explicit HTTP status codes via `parent::__construct(message: ..., code: ...)`.
  * **Dependency Inversion (DIP — Optional):** Speculative single-implementation interfaces (`*Interface.php`) are strictly optional / deferred. Inject concrete classes directly (e.g. `RazorpayService`) to preserve 1-click `Ctrl+Click` IDE navigation. Only introduce interfaces when multiple production drivers run concurrently.

#### [02 - Application Architecture & Layer Boundaries](02-application-architecture/README.md)
* **What it Does:** Defines directory layout, layer boundary contracts, dependency injection conventions, and the strict unidirectional request lifecycle.
* **Child Specifications:** [01 - Layer Responsibilities](02-application-architecture/01-layer-responsibilities.md) | [02 - Dependency Injection & Container](02-application-architecture/02-dependency-injection-and-container.md) | [03 - Directory Structure & Organization](02-application-architecture/03-directory-structure-and-organization.md)
* **Actionable Directives for AI Agents:**
  * **Ultra-Thin Controllers:** Controllers must not exceed 15 lines. Extract `$request->validated()`, pass `User $user` to services, catch single `Throwable $e` to `handleException($e)`, and return API Resources.
  * **Directory Placement:** Business logic lives flat under `app/Services/`. Domain exceptions live in domain folders under `app/Exceptions/<Domain>/`. AI MCP tools live under `app/Mcp/`.
  * **Forbidden Directories:** Never introduce `app/Repositories/`, `app/DTOs/`, `app/Actions/`, or procedural `app/Helpers/`.
  * **Facade Discipline:** Never use `Auth::user()`, `Request::`, or `Session::` inside domain services. Only stateless utilities (`DB::transaction()`, `Log::`, `Config::`) are permitted.

#### [03 - API Engineering Standards](03-api-engineering/README.md)
* **What it Does:** Enforces HTTP routing conventions, request validation boundaries, and Eloquent model transformation into deterministic JSON contracts.
* **Child Specifications:** [01 - Routing Conventions](03-api-engineering/01-routing-conventions.md) | [02 - Form Requests & Validation](03-api-engineering/02-form-requests-and-validation.md) | [03 - API Resources](03-api-engineering/03-api-resources.md)
* **Actionable Directives for AI Agents:**
  * **2-Verb Routing Model:** Use only `GET` (reading) and `POST` (all mutations). `PUT`, `PATCH`, and `DELETE` are strictly forbidden. All routes must be grouped under `Route::prefix('v1')`.
  * **Deterministic Suffixes:** Standard CRUD mutations must end with `/store`, `/{id}/update`, or `/{id}/destroy`. Custom operations use descriptive action names (e.g. `/{id}/cancel`).
  * **Validation Syntax:** Always use array syntax `['required', 'string']`. Pipe strings (`'required|string'`) are strictly prohibited.
  * **Ownership Validation:** Validate relational foreign keys at the HTTP boundary via `Rule::exists('table', 'id')->where('user_id', $this->user()?->id)`.
  * **Data Extraction:** Controllers must only pass `$request->validated()` into domain services (never pass raw `$request->all()`).
  * **Guarded Resources:** Wrap every relationship in API Resources with `$this->whenLoaded()` to prevent N+1 query loops. Format timestamps to ISO 8601 (`toIso8601String()`).

#### [04 - Business Logic & Domain Architecture](04-business-logic/README.md)
* **What it Does:** Defines domain service design, transaction latency boundaries, queue commit hooks, and typed domain exception handling.
* **Child Specifications:** [01 - Service Layer Design](04-business-logic/01-service-layer-design.md) | [02 - Exception Architecture](04-business-logic/02-exception-architecture.md)
* **Actionable Directives for AI Agents:**
  * **Flat Placement & Zero Bloat:** Domain services reside flat in `app/Services/`. Never introduce `app/Repositories/`, `app/DTOs/`, or `app/Actions/`.
  * **Actor Context:** Never call `Auth::user()` or `request()` inside services. Always accept the acting user as an explicit `User $user` parameter.
  * **Zero Latency in Transactions:** Execute external HTTP calls (e.g. Razorpay, Stripe) **before** opening a `DB::transaction()` block.
  * **Queue Dispatching:** Always append `->afterCommit()` when dispatching queue jobs or events inside transactions.
  * **Typed Domain Returns:** Services must return Eloquent Models, Collections, or Paginators—never `JsonResponse` or HTTP responses.
  * **Single Catch & Error Delegation:** Controllers catch single `Throwable $e` and delegate to `handleException($e)`. Zero error logic in `bootstrap/app.php`.
  * **Domain Exceptions:** Throw typed exceptions from `app/Exceptions/<Domain>/` extending native `Exception` with explicit HTTP status codes via `parent::__construct(message: ..., code: ...)`.
  * **Status & SQL Sanitization:** `handleException()` must sanitize codes to valid HTTP range (`100–599`) to prevent HTTP 0 crashes, and mask `QueryException` schema leakage.

#### [12 - Research, Discovery Reports & ADRs](12-research/README.md)
* **What it Does:** Documents empirical audits and official Architecture Decision Records (ADRs) that substantiate company engineering invariants.
* **Child Specifications:** [01 - Codebase Discovery Report (RES-001)](12-research/01-food-delivery-discovery.md) | [ADR-001 - Response Envelope Specification](12-research/adr/ADR-001-unified-api-response-envelope.md)
* **Actionable Directives for AI Agents:**
  * **Envelope Invariant (ADR-001):** Strictly serialize all API responses using `"is_error": bool`, `"message": string`, `"data": mixed|null`, `"errors": object|null`, and `"pagination": object|null`. On error, `data` must strictly be `null` (never `[]`).
  * **Empirical Traceability:** Ensure domain implementations conform to the 14 codified standards established in RES-001.

### Upcoming Roadmap Modules
* `05 - Database Engineering` (Transactions, Migrations, Eloquent Relations)
* `06 - Code Quality & Static Analysis` (Pint styling, Larastan Level 8)
* `07 - Security & Performance` (Sanctum auth, Policies, Webhooks)
* `08 - Testing & Quality Assurance` (Pest feature tests, Mocking)
* `09 - AI Engineering` (Laravel MCP Server, AI developer workflows)
* `10 - Reusable Templates` (Production-ready Markdown specs)

