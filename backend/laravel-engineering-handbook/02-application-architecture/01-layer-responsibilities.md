# Layer Responsibilities & Boundaries

---

## 1. Architectural Separation of Concerns

Every PHP class in the application belongs to a **single designated architectural layer**. Code from one layer must never perform duties reserved for another.

---

## 2. The 6 Architectural Layers

### Layer 1: Routing & Middleware (`routes/api.php`, `app/Http/Middleware/`)
* **Mandatory:** Strict 2-verb model (`GET` for fetching, `POST` for mutations), mandatory `v1` URL prefix, Sanctum authentication guards, and route rate limiting.
* **Strictly Forbidden:** Executing business logic, writing queries, mutating database records, using `PUT`/`PATCH`/`DELETE`.

### Layer 2: Form Requests (`app/Http/Requests/`)
* **Mandatory:** Input sanitization, array validation syntax (`['required', 'string']`), contextual ownership validation (`Rule::exists()->where(...)`), and policy authorization in `authorize(): bool`.
* **Strictly Forbidden:** Calculating totals, mutating models, calling third-party APIs.

### Layer 3: Thin HTTP Controllers (`app/Http/Controllers/`)
* **Mandatory:** Ultra-thin (<15 lines). Extract `$request->validated()`, pass `User $user` explicitly to domain services, wrap execution in a single `try / catch (Throwable $e)` delegating to `handleException($e)`, and return API Resources (see [GUIDELINES.md Section 3A](../GUIDELINES.md#a-controller-pattern-ultra-thin-15-lines-with-single-catch-block)).
* **Strictly Forbidden:** Direct SQL or Eloquent mutations (`Order::create()`), transaction blocks, `Auth::user()` calls, multiple catch blocks.

### Layer 4: Domain Services (`app/Services/`)
* **Mandatory:** Located strictly in a flat directory (`app/Services/`). Business logic, status workflows, and atomic mutations wrapped in `DB::transaction()`. External HTTP calls (e.g. payment SDKs) must be executed **before** opening transactions. Always pass acting `User $user` explicitly.
* **Strictly Forbidden:** Calling `request()`, `session()`, or `Auth::user()`; creating nested service directories; formatting JSON responses; introducing artificial `app/Actions/` folders.

### Layer 5: Data & Eloquent Models (`app/Models/`)
* **Mandatory:** Explicit return types on relationships (`BelongsTo`, `HasMany`, `HasOne`), method-based attribute casting via `protected function casts(): array`, and `restrictOnDelete()` for financial or historical records.
* **Strictly Forbidden:** Calling third-party APIs, handling HTTP request logic, complex multi-model business workflows.

### Layer 6: Presentation / API Resources (`app/Http/Resources/`)
* **Mandatory:** Guard all relationships with `$this->whenLoaded()`, format timestamps to ISO 8601 strings (`toIso8601String()`), cast numeric/boolean attributes, and conform to the ADR-001 unified response envelope.
* **Strictly Forbidden:** Triggering unguarded database queries (lazy loading / N+1 queries), mutating model state, business calculations.

---

## 3. Code Review Checklist (5 Invariant Questions)

Before committing or approving any pull request, verify:

1. [ ] **Controller:** Is the controller method under 15 lines and free of direct database writes (`Model::create`, `DB::table`)?
2. [ ] **Service:** Does the service accept `User $user` explicitly without calling `Auth::user()`, `request()`, or `session()`?
3. [ ] **Transaction:** Are all external HTTP API calls executed outside `DB::transaction()` boundaries?
4. [ ] **Resource:** Are all relationships in API Resources guarded with `$this->whenLoaded()`?
5. [ ] **Exception:** Is the controller catching `Throwable $e` and delegating to `handleException($e)`?
