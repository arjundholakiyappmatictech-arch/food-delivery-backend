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
                  │          Thin HTTP Controller          │  ── Coordinates action, manages DB transactions (beginTransaction/commit/rollBack)
                  └───────────────────┬────────────────────┘
                                      │ Calls Service method with explicit parameters
                                      ▼
                  ┌────────────────────────────────────────┐
                  │          Domain Service Layer          │  ── Pure business logic, lockForUpdate(), Gateways
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
   * Third-party SDK singleton registration in service providers.
   * Stateless framework Facades vs. strictly forbidden HTTP transport facades in services.
   * Direct concrete injection (DIP is Optional).

3. **[03 - Project Directory Structure & Organization](03-directory-structure-and-organization.md):**
   * Real-world project directory map matching our existing application structure.
   * Specialized placement rules for flat Services, domain-grouped Exceptions, and Mcp tools.
   * Banning artificial bloat (no repositories, no DTOs, no actions, no procedural helpers).

---

## 3. The 4 Invariant Architectural Rules

1. **Controllers Coordinate & Manage Transactions:** Controller actions remain ultra-thin (typically <15 lines for mutations; up to ~20 lines for paginated queries purely for coordination; zero business logic permitted). For mutations, controllers manage transaction boundaries (`DB::beginTransaction()`, `DB::commit()`, `DB::rollBack()`). They coordinate validated input, call domain services, transform results via API Resources, and delegate exceptions.
2. **Services Are Pure & Transaction-Free:** Services must never touch `request()`, `session()`, or `Auth::user()`, nor manage database transactions. All business calculations, race-condition prevention (`lockForUpdate()`), and entity mutations belong here.
3. **Data Access & Constraints Must Be Guarded:** External database serialization must always pass through API Resources with `$this->whenLoaded()`. Database constraints (`restrictOnDelete()` on financial tables, unique indexes) protect foundational data integrity.
4. **Versioning Stays at Transport Layer:** Breaking API version changes (`v2`) are strictly confined to the HTTP transport layer (`Controllers/V2/`, `Requests/V2/`, `Resources/V2/`). Domain services (`app/Services/`) are strictly singular, flat, and version-agnostic (`Services/V2/` is strictly forbidden).

