# Layer Responsibilities & Boundaries

---

## 1. Architectural Separation of Concerns

Every PHP class in the application belongs to a **single designated architectural layer**. Code from one layer must never perform duties reserved for another.

---

## 2. The 6 Architectural Layers

### Layer 1: Routing & Middleware (`routes/api.php`, `app/Http/Middleware/`)
* **Mandatory:** Strict 2-verb model (`GET` for fetching, `POST` for mutations), URL version prefixing (`/api/v1/`, `/api/v2/`), Sanctum authentication guards, and route rate limiting.
* **Strictly Forbidden:** Executing business logic, writing queries, mutating database records, using `PUT`/`PATCH`/`DELETE`.

### Layer 2: Form Requests (`app/Http/Requests/`)
* **Mandatory:** Input sanitization, versioned request schemas (`V1/`, `V2/`), array validation syntax (`['required', 'string']`), contextual ownership validation (`Rule::exists()->where(...)`), and policy authorization in `authorize(): bool`.
* **Strictly Forbidden:** Calculating totals, mutating models, calling third-party APIs.

### Layer 3: Thin HTTP Controllers (`app/Http/Controllers/`)
* **Mandatory:** Ultra-thin (typically <15 lines for mutations, up to ~20 lines for paginated query coordination; zero business logic), organized under versioned namespaces (`V1\`, `V2\`). For state mutations, manage database transactions via `DB::beginTransaction()`, `DB::commit()`, and `DB::rollBack()` in the single catch block. Extract `$request->validated()`, pass `User $user` explicitly to domain services, delegate caught errors to `handleException($e)`, and return API Resources (see [GUIDELINES.md Section 3A](../GUIDELINES.md#a-controller-pattern-ultra-thin-typically-15-lines-with-single-catch-block)).
* **Strictly Forbidden:** Direct SQL or Eloquent mutations (`Order::create()`), business logic calculations, `Auth::user()` calls, multiple catch blocks.

### Layer 4: Domain Services (`app/Services/`)
* **Mandatory:** Located strictly in a flat, version-agnostic directory (`app/Services/`). Pure business logic, entity workflows, calculations, and concurrency protection using `lockForUpdate()`. External HTTP calls (e.g. payment SDKs) must be executed **before** transactions. Always pass acting `User $user` explicitly. Both `V1` and `V2` controllers inject the same underlying services.
* **Strictly Forbidden:** Managing transactions inside services (`DB::beginTransaction()`, `DB::transaction()`); calling `request()`, `session()`, or `Auth::user()`; creating versioned service subdirectories (`Services/V2/`); formatting JSON responses; introducing artificial `app/Actions/` folders.

### Layer 5: Data & Eloquent Models (`app/Models/`)
* **Mandatory:** Method-based attribute casting via `protected function casts(): array`, and database-level constraints (`restrictOnDelete()` for financial or historical records, unique indexes, not-null constraints) to protect data integrity.
* **Strictly Forbidden:** Calling third-party APIs, handling HTTP request logic, complex multi-model business workflows.

### Layer 6: Presentation / API Resources (`app/Http/Resources/`)
* **Mandatory:** Guard all relationships with `$this->whenLoaded()`, format timestamps to ISO 8601 strings (`toIso8601String()`), cast numeric/boolean attributes, and conform to the ADR-001 unified response envelope.
* **Strictly Forbidden:** Triggering unguarded database queries (lazy loading / N+1 queries), mutating model state, business calculations.

---

## 3. Code Review Checklist (5 Invariant Questions)

Before committing or approving any pull request, verify:

1. [ ] **Controller:** Is the controller method ultra-thin (typically <15 lines for mutations) and managing transactions (`DB::beginTransaction()`, `commit()`, `rollBack()`) without direct database writes (`Model::create`, `DB::table`)?
2. [ ] **Service:** Does the service accept `User $user` explicitly without calling `Auth::user()`, `request()`, `session()`, or managing transactions?
3. [ ] **Transaction & Concurrency:** Are external HTTP calls executed outside database transactions, and are race-sensitive records locked using `lockForUpdate()`?
4. [ ] **Resource:** Are all relationships in API Resources guarded with `$this->whenLoaded()`?
5. [ ] **Exception:** Is the controller catching `Throwable $e`, rolling back transactions via `DB::rollBack()`, and delegating to `handleException($e)`?
