# Research: Real-World Codebase Discovery Report

---

## 1. Context & Objectives

To establish a pragmatic, battle-tested engineering handbook rather than an abstract set of theoretical rules, we audited the existing food-delivery backend codebase.

The goal was to:
1. Identify actual working patterns and conventions.
2. Uncover friction points, technical debt, and architectural anti-patterns.
3. Separate **reusable company engineering standards** from **application-specific domain logic**.
4. Formalize the architectural decisions now codified in [GUIDELINES.md](../GUIDELINES.md).

---

## 2. Codebase Findings & Codified Standards

### Finding 1: Route Method Model & Explicit Suffixes
* **Audit Observation:** Existing routes in `routes/api.php` used mixed methods and suffixes (e.g. `Route::post('addresses/store')`, `Route::put('addresses/{address}/update')`, `Route::delete('addresses/{address}/destroy')`).
* **Codified Standard:** We adopted the **Strict 2-Verb Model** ([03-api-engineering/01-routing-conventions.md](../03-api-engineering/01-routing-conventions.md)). Only `GET` (reads) and `POST` (mutations) are allowed. `PUT`, `PATCH`, and `DELETE` are strictly forbidden. Standard CRUD mutations must use explicit suffixes (`/store`, `/{id}/update`, `/{id}/destroy`).

---

### Finding 2: Inconsistent JSON Response Envelopes
* **Audit Observation:** Response envelopes varied across layers: global exceptions returned `"status": false`, controllers returned `"success": true/false`, and error payloads oscillated between `"data"` and `"errors"`.
* **Codified Standard:** Formalized as **[ADR-001](adr/ADR-001-unified-api-response-envelope.md)**:
  ```json
  { "is_error": false, "message": "...", "data": { ... } }
  ```
  On failure: `"is_error": true`, `"data": null` (strictly banning `"data": []`), with root `"message"`.

---

### Finding 3: Controller Exception Handling & Code Sanitization
* **Audit Observation:** Controllers caught generic `Exception` and passed `$e->getCode()` directly to `response()->json()`. For PDO and runtime errors, `$e->getCode()` evaluates to `0` or SQLSTATE strings, causing fatal framework crashes.
* **Codified Standard:** Codified in [04-business-logic/02-exception-architecture.md](../04-business-logic/02-exception-architecture.md). Controllers catch a single `catch (Throwable $e)` delegating to `BaseController::handleException($e)`, which sanitizes status codes to `100–599` (fallback `500`). Zero logic in `bootstrap/app.php`.

---

### Finding 4: Database Query Error Masking
* **Audit Observation:** `bootstrap/app.php` previously intercepted all `QueryException` instances with a hardcoded `"Connection Failed"` message, hiding deadlocks, constraints, and syntax errors.
* **Codified Standard:** `BaseController::handleException($e)` privately logs the complete SQL query and bindings, while masking database details from clients with a generic safe 500 error (`"A database error occurred."`).

---

### Finding 5: Validation Rule Inconsistencies (Pipe vs. Array)
* **Audit Observation:** Form Requests inconsistently used pipe-delimited strings (`'required|string'`) and arrays (`['required', 'exists:...']`).
* **Codified Standard:** Codified in [03-api-engineering/02-form-requests-and-validation.md](../03-api-engineering/02-form-requests-and-validation.md). Array syntax is mandatory across all Form Requests; pipe strings are strictly prohibited.

---

### Finding 6: Relationship Loading Guards via `whenLoaded`
* **Audit Observation:** Resources like `OrderResource` wrapped related models in `$this->whenLoaded('user')`, preventing N+1 queries.
* **Codified Standard:** Retained as a mandatory company invariant in [03-api-engineering/03-api-resources.md](../03-api-engineering/03-api-resources.md). All relational transformations must be wrapped in `$this->whenLoaded()`.

---

### Finding 7: Coupling Services to Global Auth State (`Auth::user()`)
* **Audit Observation:** Domain services called `Auth::user()` internally, causing failures when invoked from queue workers, CLI commands, or AI tools.
* **Codified Standard:** Codified in [04-business-logic/01-service-layer-design.md](../04-business-logic/01-service-layer-design.md). Services must never call `Auth::user()`; the acting entity must always be passed explicitly as `User $user`.

---

### Finding 8: External API Calls Inside vs. Outside DB Transactions
* **Audit Observation:** `PaymentService` called the Razorpay `createOrder` API inside `DB::transaction()`, holding row locks and exhausting connection pools during network latency.
* **Codified Standard:** Core Pillar 3 in [GUIDELINES.md](../GUIDELINES.md). External HTTP calls must always be executed **before** opening a `DB::transaction()`.

---

### Finding 9: Queue Jobs Dispatched Inside Transactions Without `afterCommit`
* **Audit Observation:** `PaymentService` dispatched `AssignDeliveryJob` inside a transaction without commit hooks, risking race conditions where queue workers read uncommitted rows.
* **Codified Standard:** All queue jobs and domain events dispatched inside transactions must use `->afterCommit()`.

---

### Finding 10: Model Attribute Casting via `casts(): array`
* **Audit Observation:** Model attribute casts used legacy property syntax (`protected $casts = [...]`) with uncast numeric and boolean values.
* **Codified Standard:** Codified in [01-fundamentals/01-php-typing-and-modern-syntax.md](../01-fundamentals/01-php-typing-and-modern-syntax.md) and [05-database-engineering/README.md](../05-database-engineering/README.md). Models must use method-based `protected function casts(): array` with backed Enums, `decimal:2`, `boolean`, and `datetime`.

---

### Finding 11: Foreign Key Protection on Ledger Tables
* **Audit Observation:** `cascadeOnDelete()` was applied to `orders.restaurant_id`, risking accidental cascade deletion of financial and transactional records.
* **Codified Standard:** Codified in [05-database-engineering/README.md](../05-database-engineering/README.md). Financial, order, and ledger tables must use `restrictOnDelete()` or soft deletes; `cascadeOnDelete()` is strictly forbidden.

---

### Finding 12: Event Listener Queueing
* **Audit Observation:** A queued listener (`ShouldQueue`) dispatched a secondary queued job (`SendWelcomeEmailJob`), causing double queue round-trips for a single operation.
* **Codified Standard:** Perform queued work directly in the queued listener, or use a synchronous listener to dispatch a single queued job. Never queue a listener solely to queue another job.

---

### Finding 13: Native Laravel MCP Server Integration
* **Audit Observation:** The application integrated `laravel/mcp` (`TomatoServer.php`) for AI-assisted developer tooling.
* **Codified Standard:** AI MCP tools reside in `app/Mcp/` for safe AI model inspection.

---

### Finding 14: Automated Feature Test Standards
* **Audit Observation:** Pest test suite was configured, but zero feature tests covered domain workflows (Orders, Payments, Deliveries).
* **Codified Standard:** Feature tests following the Arrange-Act-Assert pattern with Pest are mandatory for every business endpoint.

---

## 3. Classification: Global Standard vs. Domain Logic

| Category | Reusable Global Standard ([GUIDELINES.md](../GUIDELINES.md)) | Application-Specific Domain Logic |
| :--- | :--- | :--- |
| **Routing** | Strict 2-verb model (`GET`/`POST`), `/api/v1/`, explicit suffixes | Specific endpoints (`/restaurants/nearby`, `/cart`) |
| **Responses** | ADR-001 JSON Envelope (`is_error`, `message`, `data: null` on error) | Specific payload keys (`delivery_fee`, `order_items`) |
| **Services** | Flat `app/Services/`, explicit `User $user` parameter, zero HTTP latency in transactions | Specific business calculations (delivery fees, 5-min cancel rule) |
| **Exceptions** | Single controller catch, `handleException($e)`, `app/Exceptions/<Domain>/` | Domain exceptions (`EmptyCartException`, `RestaurantClosedException`) |
| **Persistence** | Foreign key protection (`restrictOnDelete`), method `casts(): array` | Food-delivery schema tables (`menus`, `order_items`, `restaurants`) |
| **AI Tooling** | Custom MCP tools in `app/Mcp/` | Custom tools (`SearchRestaurantsTool`, `GetOrderTool`) |
