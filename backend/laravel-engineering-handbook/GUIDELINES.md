# Global Laravel Engineering Guidelines

> **The canonical reference document for backend developers and AI coding agents. Read this file before creating, modifying, refactoring, or reviewing code in any Laravel application. Auto-loaded via root [`AGENTS.md`](../../AGENTS.md).**

---

## 1. Core Engineering Pillars

1. **Explicit Over Implicit:** Write strictly typed code. Declare return types, parameter types, and model casts explicitly.
2. **Thin Controllers, Rich Domain:** Controllers coordinate HTTP requests; they do not calculate prices, format distances, or execute queries directly.
3. **Decoupled Business Logic:** Domain services and action classes must be callable from HTTP, Console commands, Queue jobs, and AI MCP tools without depending on global HTTP or session state.
4. **Data Integrity Above All:** Database operations involving multiple mutations must be wrapped in atomic transactions with zero external HTTP latency inside transaction boundaries.
5. **No Speculation:** Never invent methods, attributes, database columns, or relations. Always inspect the codebase first.

---

## 2. Mandatory Standards vs. Forbidden Anti-Patterns

| Category | Approved Standard | Forbidden Anti-Pattern |
| :--- | :--- | :--- |
| **HTTP Routing Methods** | Strict 2-verb model: `GET` for fetching (`index`, `show`); `POST` for mutations. **CRUD operations MUST use standard suffixes (`/store`, `/{id}/update`, `/{id}/destroy`). Custom operations use descriptive custom names (e.g. `/{id}/cancel`, `/{id}/verify`).** | Using `PUT`, `PATCH`, or `DELETE` methods; performing mutations inside `GET` routes; using inconsistent CRUD suffixes. |
| **API Versioning** | Mandatory `v1` URL prefix (`/api/v1/...`). Route `name()` attribute is not required. | Unversioned routes (`/api/orders`). |
| **Validation** | Array validation syntax (`['required', 'string', 'max:255']`) | Mixing pipe strings (`'required\|string'`) with arrays |
| **Form Requests** | Enforce authorization via policies or documented gates | Leaving `authorize(): bool { return true; }` as unhandled dead code |
| **Responses** | Company standard JSON envelope (ADR-001): `"is_error": false`, `"message": "..."`, `"data": ...`. On failure: `"is_error": true`, `"message": "..."`, `"data": null`. On 422: include `"errors": { ... }`. | Inconsistent keys (`status` or `success` instead of `is_error`); returning `"data": []` on error (schema type mutation); omitting `"message"` on validation errors. |
| **Exception Handling** | Explicit controller-level `try / catch (Throwable $e)` delegating to Base Controller `handleException($e)`. Domain exceptions extend base `AppException`. Zero logic in `bootstrap/app.php`. | Passing unvalidated `$e->getCode()` directly to response (HTTP 0 crashes); leaking raw SQL queries from `QueryException`; duplicating identical catch blocks across controllers. |
| **Service Context**| Always pass acting User entity explicitly as `User $user` parameter into service methods | Relying on `Auth::user()` inside domain services |
| **Transactions** | Execute external HTTP calls (e.g. Razorpay, Stripe) **before** opening DB transactions | Calling external APIs inside `DB::transaction()` blocks |
| **Queue Dispatch**| Dispatch transactional jobs using `->afterCommit()` or outside transaction block | Dispatching queue jobs inside transactions without commit hooks |
| **Eloquent Typing**| Strict return types on all relations (`BelongsTo`, `HasMany`, `HasOne`) | Untyped relation methods (`public function user()`) |
| **Model Casting** | Use method-based `protected function casts(): array` for dates, decimals, booleans, hashes | Leaving booleans, decimals, and dates uncast |
| **Migrations** | Complete, reversible `down()` methods in every migration | Empty `down()` methods (`//`) or irreversible alterations |
| **Foreign Keys** | Use `restrictOnDelete()` or soft deletes for financial and historical data | `cascadeOnDelete()` on orders, payments, or ledger records |
| **Listeners** | Synchronous listener dispatching a Job OR queued listener handling logic directly | Queuing a listener solely to dispatch another queue job |

---

## 3. Detailed Standards by Layer

### A. Routing & Controllers
* **Controller Responsibilities:**
  1. Authorize the action (via Policy or Form Request).
  2. Extract validated data from the Form Request.
  3. Invoke a dedicated Service, Action, or Query.
  4. Transform the result into an API Resource.
  5. Return a standardized JSON response.
* **Controller Exception Handling Standard (Explicit Controller-Level try/catch):**
  * Every controller method wraps execution in a `try / catch (Throwable $e)` block that delegates to Base Controller `return $this->handleException($e);`.
  * `bootstrap/app.php` remains completely untouched (zero custom exception logic).
  * **Custom Domain Exceptions:** Extend a base `AppException` with predefined HTTP status codes (e.g. 422, 400).
  * **Predefined / Framework Exceptions:** Safely mapped in Base Controller `handleException()` (`ModelNotFoundException` → 404, `AuthorizationException` → 403, `AuthenticationException` → 401, `QueryException` → 500 with SQL logging, Generic errors → 500 without leaking sensitive trace).
  * **Controller Implementation Pattern:**
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
* **Approved Routing & Action Conventions (2-Verb POST/GET Model):**
  * **HTTP Methods:** Use only `GET` and `POST`. Never use `PUT`, `PATCH`, or `DELETE`.
  * **Route Naming:** Route `name()` attributes are **not required**.
  * **API Versioning:** All routes must be enclosed within a `v1` prefix group.
  * **Method & URI Mapping Standards:**
    * **CRUD Operations (Mandatory Suffixes):**
      * **`index`** (`GET /resource`): Fetch paginated list or collection of resources.
      * **`show`** (`GET /resource/{id}`): Fetch single resource by ID.
      * **`store`** (`POST /resource/store`): Create and persist a new resource.
      * **`update`** (`POST /resource/{id}/update`): Update an existing resource.
      * **`destroy`** (`POST /resource/{id}/destroy`): Delete or remove a resource.
    * **Custom Operations (Descriptive Custom Names):**
      * Use dedicated, descriptive action names directly instead of forcing CRUD suffixes.
      * Custom mutations: `POST /resource/{id}/{custom-action}` (e.g. `POST orders/{order}/cancel`, `POST orders/{order}/payment/verify`, `POST deliveries/{delivery}/pickup`).
      * Custom queries: `GET /resource/{id}/{custom-action}` or `GET /resource/{custom-action}` (e.g. `GET orders/{order}/invoice`, `GET restaurants/nearby`).
  ```php
  // APPROVED STANDARD (Versioned 2-Verb Model without name attributes)
  Route::prefix('v1')->group(function () {
      // 1. Fetching data (GET)
      Route::get('orders', [OrderController::class, 'index']);                           // CRUD: index
      Route::get('orders/{order}', [OrderController::class, 'show']);                     // CRUD: show
      Route::get('orders/{order}/invoice', [OrderController::class, 'generateInvoice']);   // Custom Query: descriptive name

      // 2. Mutations (POST)
      Route::post('orders/store', [OrderController::class, 'store']);                     // CRUD: store suffix
      Route::post('orders/{order}/update', [OrderController::class, 'update']);           // CRUD: update suffix
      Route::post('orders/{order}/destroy', [OrderController::class, 'destroy']);         // CRUD: destroy suffix
      Route::post('orders/{order}/cancel', [OrderController::class, 'cancel']);           // Custom Mutation: descriptive name
  });

  // FORBIDDEN ANTI-PATTERNS
  // ❌ Using PUT, PATCH, or DELETE methods
  Route::put('orders/{order}/update', [OrderController::class, 'update']);
  Route::delete('orders/{order}/destroy', [OrderController::class, 'destroy']);

  // ❌ Unversioned routes
  Route::post('orders/store', [OrderController::class, 'store']);
  ```

### B. Form Requests & Validation
* Always use array syntax for validation rules to ensure static analysis compatibility and prevent delimiter collision:
  ```php
  public function rules(): array
  {
      return [
          'address_id' => ['required', 'integer', Rule::exists('addresses', 'id')->where('user_id', $this->user()?->id)],
          'delivery_instructions' => ['nullable', 'string', 'max:500'],
      ];
  }
  ```
* Validate ownership constraints (e.g., verifying `address_id` belongs to the requesting user) in the validation rule using `Rule::exists()` rather than querying manually inside a service class.

### C. Standardized API Response Envelopes (ADR-001)
All API responses—successes, validation failures, client errors, and uncaught exceptions—must conform to our company's single predictable schema using `"is_error"`, `"message"`, `"data"`, and optional `"errors"` / `"pagination"`:

#### 1. Success Response (HTTP 200 / 201)
* `data` contains the resource object or array of resources.
* `errors` is omitted or `null`.
```json
{
  "is_error": false,
  "message": "Resource created successfully.",
  "data": {
    "id": 82,
    "user_id": 32,
    "created_at": "2026-07-01T12:00:00.000000Z",
    "updated_at": "2026-10-29T07:12:38.000000Z"
  }
}
```

#### 2. General / Client / Server Error (HTTP 400, 401, 403, 404, 500)
* `data` is strictly `null` (never `[]`).
* `message` explains what went wrong.
```json
{
  "is_error": true,
  "message": "Failed to update user profile: Disk named `s3` cannot be accessed",
  "data": null
}
```

#### 3. Validation Error (HTTP 422 Unprocessable Entity)
* `data` is strictly `null` (never `[]`).
* `message` is a mandatory top-level summary string (e.g. `"The given data was invalid."`).
* `errors` is an associative map where keys are field names and values are arrays of string error messages.
```json
{
  "is_error": true,
  "message": "The given data was invalid.",
  "data": null,
  "errors": {
    "email": [
      "The email has already been taken."
    ],
    "display_name": [
      "Display name already been taken."
    ]
  }
}
```

#### Invariant Envelope Rules:
1. **`data` MUST be `null` on error:** Whenever `is_error` is `true`, `data` must evaluate to `null`. It is strictly forbidden to serialize empty arrays `[]`, booleans `false`, or empty strings `""`, as this introduces schema type collisions (array vs. object).
2. **`message` is NEVER optional:** Every API response without exception must include a non-empty string in `message`.
3. **`errors` structure:** On 422 validation failures, `errors` is always an associative map (`array<string, array<string>>`). Do not serialize flat strings or unkeyed arrays for `errors`.

### D. Services & Business Logic
* **No Global State Coupling:**
  ```php
  // CORRECT: Explicit, testable, callable from CLI / Queue / MCP
  public function createOrder(User $user, array $data): Order
  {
      // ...
  }

  // INCORRECT: Tightly coupled to HTTP session
  public function createOrder(array $data): Order
  {
      $user = Auth::user(); // Fails when called from a background queue job or scheduler
  }
  ```
* **No Presentation Logic in Services:**
  Do not mutate Eloquent models with human-formatted presentation strings (e.g. converting numeric kilometers into `"500 m"` inside a service). Pass numeric values to API Resources and let the Resource format the output.

### E. Database Transactions & Concurrency
* **Zero External Network Latency in DB Transactions:**
  Never call external payment gateways (Razorpay, Stripe, PayPal), third-party notification APIs, or geocoding services inside a `DB::transaction()` closure.
  ```php
  // 1. Perform external API call outside transaction
  $razorpayOrder = $this->razorpayService->createOrder($amount, $orderId);

  // 2. Open DB transaction only for database persistence
  return DB::transaction(function () use ($orderId, $razorpayOrder) {
      return Payment::create([
          'order_id' => $orderId,
          'razorpay_order_id' => $razorpayOrder['id'],
          'payment_status' => 'pending',
      ]);
  });
  ```
* **Queue Jobs & Transactions:**
  Always use `->afterCommit()` when dispatching queue jobs inside database transactions to prevent race conditions where a worker processes the job before the commit finishes.

### F. Eloquent Models & Types
* Declare strict return types on all Eloquent relationships:
  ```php
  public function user(): BelongsTo
  {
      return $this->belongsTo(User::class);
  }

  public function items(): HasMany
  {
      return $this->hasMany(OrderItem::class);
  }
  ```
* Use method-based `casts()` instead of property `$casts`:
  ```php
  protected function casts(): array
  {
      return [
          'total' => 'decimal:2',
          'delivery_fee' => 'decimal:2',
          'is_default' => 'boolean',
          'delivered_at' => 'datetime',
          'cancelled_at' => 'datetime',
      ];
  }
  ```
* In API Resources, always wrap relationships in `$this->whenLoaded(...)` to prevent lazy-loading N+1 queries.

### G. Database Migrations
* Every migration must be bi-directional. The `down()` method must cleanly undo every change made in `up()`.
* Never apply `cascadeOnDelete()` to orders, invoices, payments, or audit logs. Use `restrictOnDelete()` or soft deletes (`SoftDeletes`) to preserve financial and historical data.

---

## 4. AI-Assisted Engineering Workflow

When working as an AI developer in any Laravel repository:

```
┌────────────────────────────────────────────────────────┐
│ Phase 1: Inspect                                       │
│ • Read composer.json (PHP, Laravel, ecosystem packages)│
│ • Inspect existing models, migrations, and routes     │
│ • Check for Laravel Boost and MCP servers              │
├────────────────────────────────────────────────────────┤
│ Phase 2: Plan                                          │
│ • Identify impacted layers (Route -> Request ->        │
│   Controller -> Service -> Model -> Resource)          │
│ • Check against this GUIDELINES.md rulebook            │
├────────────────────────────────────────────────────────┤
│ Phase 3: Implement                                     │
│ • Apply strict types and array validation rules        │
│ • Protect transaction boundaries                       │
│ • Use existing naming conventions                      │
├────────────────────────────────────────────────────────┤
│ Phase 4: Verify                                        │
│ • Run Laravel Pint on modified files                   │
│ • Run Pest / PHPUnit tests                             │
│ • Confirm zero introduced N+1 queries                  │
└────────────────────────────────────────────────────────┘
```

---

## 5. Topic Modules Directory

For in-depth explanations, trade-offs, and complete code samples, consult the handbook topic modules:

### Active Modules
* [01 - Fundamentals](01-fundamentals/README.md)
* [02 - Application Architecture](02-application-architecture/README.md)
* [03 - API Engineering](03-api-engineering/README.md)
* [12 - Research, Discovery Reports & ADRs](12-research/README.md)

### Upcoming Roadmap Modules
* `04 - Business Logic` (Services, Actions, Domain Exceptions)
* `05 - Database Engineering` (Transactions, Migrations, Eloquent Relations)
* `06 - Code Quality & Static Analysis` (Pint styling, Larastan Level 8)
* `07 - Security & Performance` (Sanctum auth, Policies, Webhooks)
* `08 - Testing & Quality Assurance` (Pest feature tests, Mocking)
* `09 - AI Engineering` (Laravel MCP Server, AI developer workflows)
* `10 - Reusable Templates` (Production-ready Markdown specs)

