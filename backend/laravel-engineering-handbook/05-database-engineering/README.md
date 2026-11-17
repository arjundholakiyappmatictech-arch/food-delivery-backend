# Module 05: Database Engineering & Persistence Standards

> Architectural invariants for database mutations, transactional boundaries, and model attribute casting.

---

## 1. Company Database Invariants

General database design, indexing, and migration rollbacks are governed by **Laravel Boost** (`.agents/skills/laravel-best-practices/rules/`). Our company enforces the following non-negotiable architectural overrides:

### Invariant 1: Foreign Key Safety (`restrictOnDelete`)
* **Strict Ban on `cascadeOnDelete()`:** Never use `cascadeOnDelete()` on orders, bookings, payments, invoices, or ledger tables. Accidental deletion of a parent record (e.g. user or vehicle) must never delete financial or transactional records.
* **Approved Standard:** Use `restrictOnDelete()` or soft deletes (`softDeletes()`) on all financial, order, and historical records.

### Invariant 2: Mandatory Method-Based `casts(): array`
* **Strict Ban on Legacy Property:** The legacy `protected $casts = [...]` property is strictly forbidden.
* **Approved Standard:** All attribute casting must use method-based `protected function casts(): array` with backed Enums, `decimal:2`, `boolean`, and `datetime`.

### Invariant 3: Zero-HTTP-Latency Transaction Boundary (Core Pillar 3)
* **Pre-Transaction External Calls:** Never invoke external HTTP APIs (e.g. Stripe, Razorpay) inside `DB::transaction()`. Holding open database transactions during network latency exhausts connection pools and locks rows.
* **Queue Dispatching:** Always append `->afterCommit()` when dispatching queue jobs or events inside transactions.

---

## 2. Invariant Summary Matrix

| Category | Approved Company Standard | Strictly Forbidden Anti-Pattern |
| :--- | :--- | :--- |
| **Foreign Keys** | `restrictOnDelete()` or soft deletes on financial/ledger tables. | `cascadeOnDelete()` on orders, payments, or ledger records. |
| **Attribute Casting** | Method-based `protected function casts(): array`. | Legacy `protected $casts = [...]` property; uncast decimals/booleans. |
| **Transaction Latency** | External HTTP calls executed **before** `DB::transaction()`. | External API calls executed inside `DB::transaction()` blocks. |
| **Queue Dispatch** | Always dispatch with `->afterCommit()` inside transactions. | Dispatching queue jobs inside transactions without commit hooks. |
