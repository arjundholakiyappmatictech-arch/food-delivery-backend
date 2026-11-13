# Module 02: Application Architecture & Layer Boundaries

> **A comprehensive architectural specification defining directory organization, layer boundaries, dependency injection mechanics, and the end-to-end backend request lifecycle.**

---

## 1. Architectural Philosophy

Modern Laravel applications fail to scale not because of framework limitations, but because of **blurred layer boundaries**. When controllers execute database queries, domain services read global HTTP session state, and Eloquent models format currency strings, the codebase becomes brittle, untestable, and impossible to refactor safely.

Our architecture enforces a **Strict Unidirectional Request Lifecycle**. Information flows downward through explicit parameters, and results flow upward through typed entities:

```
                  ┌────────────────────────────────────────┐
                  │             HTTP Request               │
                  └───────────────────┬────────────────────┘
                                      │
                                      ▼
                  ┌────────────────────────────────────────┐
                  │          Routing & Middleware          │  ── Versioning (v1), Sanctum Auth, Rate Limiting
                  └───────────────────┬────────────────────┘
                                      │
                                      ▼
                  ┌────────────────────────────────────────┐
                  │              Form Request              │  ── Policy Authorization & Array Validation Rules
                  └───────────────────┬────────────────────┘
                                      │ $request->validated(), User $user
                                      ▼
                  ┌────────────────────────────────────────┐
                  │          Thin HTTP Controller          │  ── Coordinates action, delegates to handleException()
                  └───────────────────┬────────────────────┘
                                      │ Calls Service method with explicit parameters
                                      ▼
                  ┌────────────────────────────────────────┐
                  │          Domain Service Layer          │  ── Pure business logic, DB::transaction(), Gateways
                  └─────────────┬──────────────────────────┘
                                │
                  ┌─────────────┴─────────────┐
                  ▼                           ▼
        ┌───────────────────┐       ┌───────────────────┐
        │  Eloquent Models  │       │ Third-Party SDKs  │
        │  & Database Layer │       │ (e.g. Razorpay)   │
        └─────────┬─────────┘       └───────────────────┘
                  │ Returns Model / Collection
                  ▼
        ┌───────────────────┐
        │   API Resource    │  ── Guarded relations (whenLoaded), ISO dates, casting
        └─────────┬─────────┘
                  │ Formatted Data Payload
                  ▼
        ┌───────────────────┐
        │  ADR-001 Envelope │  ── is_error: false, message, data, pagination
        └───────────────────┘
```

---

## 2. Directory Contents

1. **[01 - Layer Responsibilities](01-layer-responsibilities.md):**
   * Detailed breakdown of the 6 core backend layers.
   * What code is mandatory, permitted, and strictly forbidden in each layer.
   * Cross-layer communication contracts.
   * Responsibility checklist for code reviews.

2. **[02 - Dependency Injection & Container Mechanics](02-dependency-injection-and-container.md):**
   * Constructor injection and auto-wiring principles.
   * Container binding lifecycles (`bind`, `singleton`).
   * Facades vs. Injected Services: When Facades are appropriate vs. when they introduce hidden global state.
   * Pragmatic Direct Concrete Injection for single-provider services.

3. **[03 - Project Directory Structure & Organization](03-directory-structure-and-organization.md):**
   * Real-world project directory map matching our existing application structure.
   * Strict placement rules for Services, domain-grouped Exceptions, and Mcp tools.
   * Banning artificial bloat (no repositories, no DTOs, no procedural helpers).

---

## 3. The 3 Invariant Architectural Rules

1. **Controllers Must Be Thin:** A controller method should rarely exceed 15 lines of code. It only validates, calls a service, transforms the result, and delegates exceptions.
2. **Services Must Be Pure:** Services must never touch `request()`, `session()`, or `Auth::user()`. All context (the acting user, input parameters) must enter through explicit method arguments.
3. **Data Access Must Be Guarded:** External database serialization must always pass through API Resources with `$this->whenLoaded()` to prevent N+1 queries.

