# Module 01: Core Fundamentals & Language Standards

> **A foundational specification defining language baselines, type safety invariants, and object-oriented architectural principles across all backend Laravel services.**

---

## 1. Role of This Module in Our Project

Modern Laravel sits atop modern PHP (8.3+ and 8.4+). In the past, PHP was notorious for loose typing, dynamic coercions, and inconsistent method signatures. In an enterprise backend with multiple developers and AI assistants, loose typing leads to:
* **Silent Runtime Failures:** Passing `"12.50"` where a float or integer is expected, causing mathematical anomalies.
* **Degraded Static Analysis:** Inability for tools like Larastan / PHPStan to verify code correctness before production deployment.
* **Ambiguous Contracts:** Developers having to inspect internal method implementations just to deduce what types a function expects or returns.

The **`01-fundamentals`** module acts as the **constitutional bedrock** for all code written in the project. It defines the low-level language rules that every subsequent layer (Controllers, Services, Models, Repositories, Event Listeners) must strictly adhere to.

---

## 2. Directory Contents

1. **[01 - PHP Typing & Modern Syntax](01-php-typing-and-modern-syntax.md):**
   * Mandatory `declare(strict_types=1);` directive.
   * Parameter typing, explicit return types, and nullable safety (`?T`).
   * Constructor property promotion.
   * Pure and Backed Enums (`string`, `int`) for state and taxonomy.
   * Match expressions over switch statements.
   * Nullsafe operator (`?->`) and strict equality (`===`).

2. **[02 - SOLID Principles in Laravel](02-solid-in-laravel.md):**
   * Pragmatic Single Responsibility Principle (SRP) across the 5 core layers.
   * Open/Closed Principle (OCP) using Strategy Patterns for third-party integrations (e.g. payment drivers).
   * Liskov Substitution Principle (LSP) for domain exceptions and base classes.
   * Interface Segregation Principle (ISP) against fat contracts.
   * Dependency Inversion Principle (DIP) leveraging the Laravel IoC Service Container.

---

## 3. Core Invariant Summary

| Convention | Standard Rule | Prohibited Pattern |
| :--- | :--- | :--- |
| **Strict Types** | Mandatory `declare(strict_types=1);` on line 3 of every PHP file. | Omission of strict types directive. |
| **Return Types** | Explicit return type on every method (e.g. `: Order`, `: void`). | Untyped methods (`public function cancel()`). |
| **Type Coercion** | Strict identity checks (`===`, `!==`). | Loose comparison (`==`, `!=`). |
| **Conditionals** | Exhaustive `match()` expressions for state transitions. | Multi-branch `switch` or deeply nested `if/else` ladders. |
| **Enumerations** | String-backed Enums for statuses (`OrderStatus::PENDING`). | Magic strings (`'pending'`) or raw integer constants. |

