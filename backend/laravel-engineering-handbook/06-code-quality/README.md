# Module 06: Code Quality & Static Analysis

> Standards for automated code formatting, static type verification, and the invariant code review checklist.

---

## 1. Automated Quality Tooling

General naming conventions and syntax idioms are governed by **Laravel Boost** (`.agents/skills/laravel-best-practices/rules/style.md`). Our backend enforces automated quality gates:

* **Laravel Pint (Style Enforcement):** All PHP code must be formatted using Laravel Pint before committing:
  ```bash
  vendor/bin/pint
  ```
* **Larastan (Static Analysis Level 8):** Code must pass Larastan analysis without errors:
  ```bash
  vendor/bin/phpstan analyse
  ```
  All service methods, relationships, and controllers must declare explicit parameter and return types to satisfy Level 8 analysis.

---

## 2. Invariant Code Review Rubric (5 Points)

Every pull request and AI-generated feature must satisfy these 5 invariant checks before approval:

| Check | Approved Standard | Immediate Rejection Criteria |
| :--- | :--- | :--- |
| **1. Controller Size** | Ultra-thin (typically <15 lines for mutations, up to ~20 lines for paginated coordination); coordinates only. | Direct database writes (`Model::create`, `DB::table`) or business logic in controllers. |
| **2. Actor Context** | Explicit `User $user` parameter passed to services. | Calling `Auth::user()`, `auth()`, or `request()` inside domain services. |
| **3. Transactions & Concurrency** | Controllers manage transactions (`DB::beginTransaction/commit/rollBack`); external calls outside transactions; `lockForUpdate()` on race-sensitive rows. | Managing transactions inside domain services; calling external APIs inside transactions; unlocked concurrent balance/stock reads. |
| **4. Guarded Resources** | Relational attributes wrapped in `$this->whenLoaded()`. | Unguarded relationship access triggering N+1 queries during serialization. |
| **5. Error Handling & Rollback** | Single `catch (Throwable $e)` rolling back via `DB::rollBack()` and delegating to `BaseController::handleException($e)`. | Multiple catch blocks; missing `DB::rollBack()`; logic in `bootstrap/app.php`; leaking SQL queries. |
