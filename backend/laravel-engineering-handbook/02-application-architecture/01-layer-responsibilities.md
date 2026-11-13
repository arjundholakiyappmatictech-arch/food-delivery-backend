# Chapter 02.1: Layer Responsibilities & Boundaries

> **Module:** `02-application-architecture`  
> **Classification:** Approved Engineering Standard (Our Organization)  
> **Status:** Active  

---

## 1. Overview & Separation of Concerns

To maintain code readability, testability, and maintainability across our backend services, every PHP class in the application belongs to a **single designated architectural layer**.

Code from one layer must not perform duties reserved for another layer. Below is the authoritative specification defining the responsibilities of each layer.

---

## 2. Layer Responsibility Matrix

| Layer | Primary Duty | Permitted Operations | Strictly Forbidden Operations |
| :--- | :--- | :--- | :--- |
| **1. Routing & Middleware** | Request ingress, authentication, protocol enforcement | Route grouping, rate limiting, Sanctum auth guards, `v1` version prefixing. | Executing business logic, writing queries, modifying database records. |
| **2. Form Requests** | Input sanitization, validation, gatekeeping | Array validation rules, `Rule::` objects, contextual user ownership checks, Policy authorization. | Calculating totals, mutating models, calling third-party APIs. |
| **3. Controllers** | HTTP coordination & response dispatching | Extracting `$request->validated()`, passing `User $user` to services, wrapping in `try/catch` with `handleException()`, returning API Resources. | Direct SQL queries (`Order::create()`), business math, `Auth::user()` calls, transaction blocks. |
| **4. Domain Services** | Core business logic & transactions | Atomic transactions (`DB::transaction()`), status workflows, fee calculations, payment gateway dispatching. | Calling `request()`, accessing `session()`, calling `Auth::user()`, formatting JSON strings. |
| **5. Eloquent Models** | Data representation & persistence | Relationship signatures, query scopes, method-based `casts(): array`, model factories. | Calling third-party APIs, handling HTTP request logic, complex multi-model business workflows. |
| **6. API Resources** | Presentation & JSON transformation | ISO 8601 date formatting, explicit type casting (`(float)`), relationship protection via `whenLoaded()`. | Triggering unguarded database queries (lazy loading), mutating model state, business logic. |

---

## 3. Deep-Dive by Architectural Layer

### Layer 1: Routing & Middleware
* **Location:** `routes/api.php`, `app/Http/Middleware/`
* **Rule:** Routes define the API contract entry point. They map HTTP verbs (`GET` / `POST`) to designated Controller methods.
* **Standards:**
  * Strict 2-verb model (`GET` for reading, `POST` for mutations).
  * Grouped under `Route::prefix('v1')`.
  * Authenticated routes protected by `auth:sanctum`.

---

### Layer 2: Form Requests & Validation
* **Location:** `app/Http/Requests/`
* **Rule:** The Form Request guarantees that data reaching the controller is strictly typed, complete, and authorized.
* **Standards:**
  * Mandatory array validation syntax `['required', 'string', 'max:255']`.
  * Contextual database foreign key validation via `Rule::exists()->where(...)`.
  * Policy checks in `authorize(): bool`.

---

### Layer 3: Thin HTTP Controllers
* **Location:** `app/Http/Controllers/`
* **Rule:** Controllers are purely HTTP dispatchers. They receive input, invoke domain services, and return standardized responses.
* **Standard Implementation Pattern:**
  ```php
  public function store(StoreOrderRequest $request): JsonResponse
  {
      try {
          $order = $this->orderService->store(
              user: $request->user(),
              data: $request->validated()
          );

          return $this->successResponse(
              message: 'Order created successfully.',
              data: new OrderResource($order),
              status: 201
          );
      } catch (Throwable $e) {
          return $this->handleException($e);
      }
  }
  ```
* **Enforced Limits:** Controller methods should be under 15 lines of code.

---

### Layer 4: Domain Service Layer
* **Location:** `app/Services/`, `app/Actions/`
* **Rule:** Services contain the business logic of your application. They must be completely decoupled from HTTP transport.
* **Standards:**
  * Callable from anywhere: Controllers, Queue Jobs, Scheduled Console Commands, and AI MCP tools.
  * Explicit Context: Always pass `User $user` as a method argument. Never call `Auth::user()`.
  * Database Integrity: Wrap multi-step mutations in `DB::transaction()`.
  * External APIs: Execute external HTTP calls (e.g. payment SDKs) **outside** transaction blocks.

---

### Layer 5: Data & Eloquent Persistence
* **Location:** `app/Models/`, `database/migrations/`
* **Rule:** Models represent database tables and their relationships.
* **Standards:**
  * Strict return types on all relationship methods (`BelongsTo`, `HasMany`, `HasOne`).
  * Method-based attribute casting: `protected function casts(): array`.
  * Reversible `down()` migrations on all schema alterations.
  * Use `restrictOnDelete()` or soft deletes for financial and historical records.

---

### Layer 6: Presentation (API Resources)
* **Location:** `app/Http/Resources/`
* **Rule:** Resources transform Eloquent models into the output contract defined by **ADR-001**.
* **Standards:**
  * Guard all relationships with `$this->whenLoaded()`.
  * Format all timestamps to ISO 8601 strings (`toIso8601String()`).
  * Explicitly cast numeric, decimal, and boolean attributes.
  * Integrate paginated queries with `$this->pagination($paginator)`.

---

## 4. Architectural Boundaries Checklist (Code Review Rubric)

When reviewing code or implementing a new feature, verify these 5 questions:

1. [ ] Is the controller method free of direct database writes (`Model::create`, `DB::table`)?
2. [ ] Does the service accept `User $user` as an explicit parameter rather than referencing `Auth::user()`?
3. [ ] Are all external API calls executed outside `DB::transaction()` boundaries?
4. [ ] Are all relationships in the API Resource guarded with `$this->whenLoaded()`?
5. [ ] Is the controller catching `Throwable $e` and delegating to `handleException($e)`?

