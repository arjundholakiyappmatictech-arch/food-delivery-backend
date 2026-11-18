# Module 05: Database Engineering & Persistence Standards

> Architectural invariants for database mutations, transactional boundaries, model attribute casting, and data integrity.

---

## 1. Company Database Invariants

General database design, indexing, and migration rollbacks are governed by **Laravel Boost** (`.agents/skills/laravel-best-practices/rules/`). Our company enforces the following non-negotiable architectural overrides:

### Invariant 1: Database Constraints & Foreign Key Safety (`restrictOnDelete`)
* **Strict Ban on `cascadeOnDelete()`:** Never use `cascadeOnDelete()` on orders, bookings, payments, invoices, or ledger tables. Accidental deletion of a parent record must never cascade into financial or transactional tables.
* **Approved Standard:** Use `restrictOnDelete()` or soft deletes (`softDeletes()`) on all financial, order, and historical records.
* **Maintain Database Constraints:** Database constraints (foreign keys, unique indexes, not-null constraints, check constraints) act as the foundational barrier for data integrity; application validation is never a substitute for database constraints.

### Invariant 2: Mandatory Method-Based `casts(): array`
* **Strict Ban on Legacy Property:** The legacy `protected $casts = [...]` property is strictly forbidden.
* **Approved Standard:** All attribute casting must use method-based `protected function casts(): array` with backed Enums, `decimal:2`, `boolean`, and `datetime`.

### Invariant 3: Zero-HTTP-Latency & Controller-Level Transactions (Core Pillar 3)
* **Transaction Ownership:** Database transactions are managed at the Controller level via `DB::beginTransaction()`, `DB::commit()`, and `DB::rollBack()`. Services remain transaction-free.
* **Pre-Transaction External Calls:** Never invoke external HTTP APIs (e.g. Stripe, Razorpay) inside database transactions. External calls must execute prior to `DB::beginTransaction()`.
* **Queue Dispatching:** Always append `->afterCommit()` when dispatching queue jobs or events (or dispatch after `DB::commit()`).

### Invariant 4: Concurrency Protection via `lockForUpdate()`
* **Pessimistic Locking:** In domain services, when querying rows that are immediately updated and vulnerable to race conditions (e.g. inventory quantities, wallet balances, booking slots), apply `lockForUpdate()` to prevent concurrent modification or overselling.

---

## 2. Invariant Summary Matrix

| Category | Approved Company Standard | Strictly Forbidden Anti-Pattern |
| :--- | :--- | :--- |
| **Foreign Keys & Constraints** | `restrictOnDelete()` or soft deletes on financial tables; maintain unique & not-null DB constraints. | `cascadeOnDelete()` on orders/payments; relying solely on application checks without DB constraints. |
| **Attribute Casting** | Method-based `protected function casts(): array`. | Legacy `protected $casts = [...]` property; uncast decimals/booleans. |
| **Transaction Management** | Managed at Controller level (`DB::beginTransaction()`, `commit()`, `rollBack()`); external APIs outside transactions. | Managing transactions inside domain services; calling external APIs inside transactions. |
| **Concurrency Control** | Query race-sensitive rows with `lockForUpdate()`. | Unlocked reads for inventory/balances leading to race condition collisions. |
| **Queue Dispatch** | Always dispatch with `->afterCommit()` (or after `DB::commit()`). | Dispatching queue jobs inside transactions without commit hooks. |
