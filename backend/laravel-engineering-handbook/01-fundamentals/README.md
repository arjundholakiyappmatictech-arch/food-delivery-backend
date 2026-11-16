# Module 01: Core Fundamentals & Language Standards

> Foundational specifications for type safety, modern PHP syntax, and object-oriented design across all backend services.

---

## 1. Directory Contents

1. **[01 - Modern PHP Syntax & Enumeration Standards](01-php-typing-and-modern-syntax.md):**
   * String-backed Enums integrated with Eloquent `casts(): array`.
   * Exhaustive `match()` expressions over `switch`.
   * Nullsafe operator (`?->`) and strict equality (`===`).

2. **[02 - SOLID Principles in Laravel](02-solid-in-laravel.md):**
   * Single Responsibility Principle (SRP) across Form Requests, Controllers, and Services.
   * Direct concrete constructor injection (DIP is Optional).
   * Standardized native `Exception` LSP contract for error handling.

---

## 2. Invariant Summary

| Convention | Standard Rule | Prohibited Pattern |
| :--- | :--- | :--- |
| **Type Coercion** | Strict identity checks (`===`, `!==`). | Loose comparison (`==`, `!=`). |
| **Conditionals** | Exhaustive `match()` expressions for state transitions. | Multi-branch `switch` or nested `if/else` ladders. |
| **Enumerations** | String-backed Enums for statuses (`OrderStatus::Pending`). | Magic strings (`'pending'`) or raw integer constants. |
