# Research: Real-World Codebase Discovery Report
## Source Project: Food Delivery Application (`backend/`)

> **Document ID:** RES-001  
> **Source Codebase:** `backend/`  
> **Target Framework:** Laravel 13.16.1 on PHP 8.4.23  
> **Audit Date:** 2026-11-07  
> **Status:** Completed & Preserved

---

## 1. Context & Objectives

To establish a pragmatic, battle-tested engineering handbook rather than an abstract set of theoretical rules, we audited the existing food-delivery backend codebase. 

The goal was to:
1. Identify actual working patterns and conventions.
2. Uncover friction points, technical debt, and architectural anti-patterns.
3. Separate **global reusable standards** from **food-delivery domain logic**.
4. Define concrete recommendations for modern Laravel (v11–v13) and PHP 8.4.

---

## 2. Complete Finding Inventory

### Finding 1: RPC Verb Suffixes in RESTful Route URIs
* **Location:** `backend/routes/api.php`
* **Existing Approach:**
  ```php
  Route::post('addresses/store', 'store');
  Route::put('addresses/{address}/update', 'update');
  Route::delete('addresses/{address}/destroy', 'destroy');
  Route::post('orders/store', 'store');
  Route::patch('orders/{order}/cancel', 'cancel');
  ```
* **Assessment:** The HTTP verb already expresses the action. Suffixing URIs with verbs (`/store`, `/update`, `/destroy`) violates RESTful principles, produces awkward endpoints, and prevents leveraging resource controllers cleanly.
* **Recommended Approach:** Use standard REST resource URIs:
  * `POST /addresses`
  * `PUT /addresses/{address}` or `PATCH /addresses/{address}`
  * `DELETE /addresses/{address}`
  * `POST /orders/{order}/cancellation` (for state transition events)
* **Scope:** **Global Engineering Standard**.

---

### Finding 2: Inconsistent JSON Response Envelopes
* **Location:**
  * Exception Handler: `backend/bootstrap/app.php`
  * Base Controller: `backend/app/Http/Controllers/Controller.php`
* **Existing Approach:**
  * Global exceptions return: `{"status": false, "message": "...", "data": null}`
  * Controller errors return: `{"success": false, "message": "...", "errors": null}`
  * Controller successes return: `{"success": true, "message": "...", "data": ...}`
* **Assessment:** The boolean status indicator changes key name (`status` vs `success`), and error details switch between `data` and `errors`. Clients must implement brittle conditional parsing.
* **Recommended Approach:** Enforce a single immutable response contract:
  ```json
  { "success": true|false, "message": "...", "data": ..., "errors": ..., "meta": ... }
  ```
* **Scope:** **Global Engineering Standard**.

---

### Finding 3: Catching Generic `\Exception` in Controllers with `$e->getCode()`
* **Location:** 
  * `backend/app/Http/Controllers/AddressController.php`
  * `backend/app/Http/Controllers/OrderController.php`
* **Existing Approach:**
  ```php
  try {
      $address = $this->addressService->store($request->validated());
      return $this->successResponse('...', new AddressResource($address), 201);
  } catch (Exception $exception) {
      return $this->errorResponse($exception->getMessage(), null, $exception->getCode());
  }
  ```
* **Assessment:**
  1. If an unexpected PHP error occurs (e.g. `PDOException`, `TypeError`), `$exception->getCode()` evaluates to `0` or an alphanumeric string SQLSTATE (e.g. `"23505"`). Passing this to `response()->json(..., $status)` causes a fatal crash.
  2. Every controller method is cluttered with identical boilerplate.
  3. Raw internal exception messages may leak database schemas or system details.
* **Recommended Approach:** Let domain exceptions implement custom `render()` methods or map them centrally in `bootstrap/app.php`. Keep controllers clean and declarative without boilerplate `try/catch`.
* **Scope:** **Global Engineering Standard**.

---

### Finding 4: Blanket `QueryException` Masking in Exception Handler
* **Location:** `backend/bootstrap/app.php`
* **Existing Approach:**
  ```php
  $exceptions->render(function (QueryException $e, $request) {
      return response()->json([
          'status' => false,
          'message' => 'Connection Failed',
          'data' => null,
      ], 500);
  });
  ```
* **Assessment:** Any query failure (foreign key constraint, duplicate key, deadlock, null violation) is reported to the client as `"Connection Failed"`. This actively hinders debugging and misleads monitoring.
* **Recommended Approach:** Log SQL exceptions with stack traces. In development, show details; in production, return `"A database error occurred"` with a correlation ID, rather than misreporting it as a network disconnection.
* **Scope:** **Global Engineering Standard**.

---

### Finding 5: Validation Rule Inconsistencies (Pipe vs Array)
* **Location:**
  * `backend/app/Http/Requests/RegisterRequest.php` (Pipe string)
  * `backend/app/Http/Requests/PlaceOrderRequest.php` (Array)
* **Existing Approach:** Some Form Requests use `'required|string|max:255'` while others use `['required', 'exists:addresses,id']`.
* **Assessment:** Pipe strings fail when validation rules require parameters containing colons or regex pipes. Arrays are safer, static-analysis friendly, and allow fluent `Rule::` objects.
* **Recommended Approach:** Standardize exclusively on array validation rules across all Form Requests.
* **Scope:** **Global Engineering Standard**.

---

### Finding 6: Exemplary Relationship Loading via `whenLoaded`
* **Location:**
  * `backend/app/Http/Resources/OrderResource.php`
  * `backend/app/Http/Resources/RestaurantResource.php`
* **Existing Approach:**
  ```php
  'customer' => new UserResource($this->whenLoaded('user')),
  'restaurant' => new RestaurantResource($this->whenLoaded('restaurant')),
  'order_items' => OrderItemResource::collection($this->whenLoaded('items')),
  ```
* **Assessment:** Excellent practice. Prevents the presentation layer from triggering accidental N+1 queries when relations are not eager loaded.
* **Recommended Approach:** Retain and adopt as a mandatory global standard for all API Resources.
* **Scope:** **Global Engineering Standard**.

---

### Finding 7: Coupling Services to Global Auth State (`Auth::user()`)
* **Location:**
  * `backend/app/Services/OrderService.php`
  * `backend/app/Services/RestaurantService.php`
* **Existing Approach:** Services call `Auth::user()` internally to fetch the authenticated user and perform role checks (`$user->type !== 'customer'`).
* **Assessment:** Tightly couples domain services to HTTP sessions. When a background queue job, scheduled console command, or AI tool calls `OrderService`, `Auth::user()` is `null`, throwing unhandled exceptions.
* **Recommended Approach:** Pass the acting `User` model explicitly into service methods (`public function store(User $customer, array $data): Order`). Move role and permission checks into Laravel Policies.
* **Scope:** **Global Engineering Standard**.

---

### Finding 8: External API Calls Inside vs. Outside DB Transactions
* **Location:**
  * Inside transaction: `backend/app/Services/PaymentService.php`
  * Outside transaction: `backend/app/Services/OrderService.php`
* **Existing Approach:**
  * In `PaymentService`: Razorpay `createOrder` API call is executed inside `DB::transaction(...)`.
  * In `OrderService`: Razorpay `refundPayment` API call is executed before `DB::transaction(...)`.
* **Assessment:** Calling external payment APIs inside database transactions holds open database locks during third-party HTTP round-trips. If the external provider experiences latency, DB connections become exhausted.
* **Recommended Approach:** Golden Rule: Never execute external HTTP calls inside a database transaction.
* **Scope:** **Global Engineering Standard**.

---

### Finding 9: Queue Jobs Dispatched Inside Transactions Without `afterCommit`
* **Location:** `backend/app/Services/PaymentService.php#L51`
* **Existing Approach:**
  ```php
  DB::transaction(function () use ($order) {
      $payment = Payment::create([...]);
      AssignDeliveryJob::dispatch($order->id)->delay(...);
      return $payment;
  });
  ```
* **Assessment:** If the transaction takes longer to commit than the queue worker takes to pick up the job, the worker queries an uncommitted record, causing a race condition or `ModelNotFoundException`.
* **Recommended Approach:** Use `AssignDeliveryJob::dispatch($order->id)->afterCommit();` or dispatch after the transaction block finishes.
* **Scope:** **Global Engineering Standard**.

---

### Finding 10: Untyped Model Relationships
* **Location:**
  * `backend/app/Models/User.php`
  * `backend/app/Models/Order.php`
  * `backend/app/Models/Address.php`
* **Existing Approach:**
  ```php
  public function user() { return $this->belongsTo(User::class); }
  public function addresses() { return $this->hasMany(Address::class); }
  ```
* **Assessment:** Untyped signatures degrade IDE autocompletion, break static analysis (Larastan/PHPStan), and contradict PHP 8.4 strict typing conventions.
* **Recommended Approach:** Add explicit relationship return types (`BelongsTo`, `HasMany`, `HasOne`, `BelongsToMany`) across all models.
* **Scope:** **Global Engineering Standard**.

---

### Finding 11: Migration Hygiene & Reversibility
* **Location:**
  * `backend/database/migrations/2026_08_13_060526_add_restaurant_id_to_orders_table.php`
* **Existing Approach:**
  * `down()` is empty (`//`).
  * `cascadeOnDelete()` was added to `orders.restaurant_id`.
  * An earlier migration created an `order_restaurant` pivot table that was later bypassed by adding `restaurant_id` directly to `orders`.
* **Assessment:** Empty `down()` methods make rollbacks destructive or broken. `cascadeOnDelete()` on orders means deleting a restaurant permanently wipes out financial transaction records!
* **Recommended Approach:**
  1. Every migration must have a tested, reversible `down()`.
  2. Financial and historical records must use `restrictOnDelete()` or soft deletes.
  3. Deprecated pivot tables should be cleanly dropped via migration.
* **Scope:** **Global Engineering Standard**.

---

### Finding 12: Double Queuing Anti-Pattern in Event Listeners
* **Location:** `backend/app/Listeners/SendWelcomeEmailListener.php`
* **Existing Approach:**
  ```php
  class SendWelcomeEmailListener implements ShouldQueue
  {
      public function handle(UserRegistered $event): void
      {
          SendWelcomeEmailJob::dispatch($event->user)->delay(now()->addSeconds(30));
      }
  }
  ```
* **Assessment:** The listener implements `ShouldQueue` (queuing the listener). When the worker executes the listener, it dispatches ANOTHER queued job (`SendWelcomeEmailJob`). This creates two round trips to the jobs table for a single email.
* **Recommended Approach:** Use either a queued listener that performs the work directly, or a synchronous listener that dispatches the queued job. Never queue a listener solely to queue another job.
* **Scope:** **Global Engineering Standard**.

---

### Finding 13: Native Laravel MCP Server Implementation
* **Location:**
  * `backend/routes/ai.php`
  * `backend/app/Mcp/Servers/TomatoServer.php`
  * `backend/app/Mcp/Tools/SearchRestaurantsTool.php`
* **Existing Approach:** The project integrates `laravel/mcp` (v1.0.0) exposing an authenticated MCP endpoint (`/mcp/tomato`) with custom AI tools (`GetOrderTool`, `SearchRestaurantsTool`).
* **Assessment:** Forward-thinking foundation for AI development. However, `SearchRestaurantsTool` hardcodes `where('name', 'ILIKE', ...)` which breaks when running SQLite in tests.
* **Recommended Approach:** Standardize AI agent tool building using `laravel/mcp` and `laravel/boost`. Make tools database-driver agnostic.
* **Scope:** **Global AI Engineering Standard**.

---

### Finding 14: Zero Domain Test Coverage
* **Location:**
  * `backend/tests/Pest.php`
  * `backend/tests/Feature/ExampleTest.php`
* **Existing Approach:** Pest 4.7 is configured, but `RefreshDatabase` is commented out. Only default boilerplate tests exist; zero tests cover Auth, Orders, Payments, or Deliveries.
* **Assessment:** Operating without automated tests prevents confident refactoring and exposes the app to regressions.
* **Recommended Approach:** Require Pest-based Feature tests for every endpoint following the "Arrange, Act, Assert" standard.
* **Scope:** **Global Engineering Standard**.

---

## 3. Strict Classification: Global vs. Project-Specific

| Domain Area | Reusable Global Standard | Application-Specific Rule (Food Delivery) |
| :--- | :--- | :--- |
| **Routing** | Clean REST URIs, `/api/v1/` prefixing, named routes | Specific paths (`/restaurants/nearby`, `/cart`) |
| **Response Design**| Single immutable JSON envelope, RFC 7807 error details | Exact JSON field names (`delivery_fee`, `order_delivery`) |
| **Service Layer** | Decoupled from HTTP state, pass `User` explicitly | Fixed fee calculation (`$deliveryFee = 40`), 5-min cancel limit |
| **Geospatial** | Database-driver agnostic querying | 8-meter duplicate restaurant radius check, Haversine formula |
| **Transactions** | No external APIs in DB transactions, `afterCommit()` hooks | Specific Razorpay order creation logic |
| **Database** | Reversible migrations, strict Eloquent relation return types | Schema tables (`menus`, `order_deliveries`, `restaurants`) |
| **AI Integration** | `laravel/boost` + MCP workflows, inspection guardrails | `TomatoServer` MCP tools |

