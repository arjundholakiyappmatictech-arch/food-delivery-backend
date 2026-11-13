# Module 03: API Engineering Standards

> **A comprehensive guide to routing architectures, validation boundaries, and serialization contracts across our Laravel services.**

---

## 1. Module Overview

The API layer is responsible for receiving HTTP requests, validating incoming payloads, authorizing actor capabilities, invoking domain operations, and transforming database models into deterministic JSON responses.

This module details our approved conventions:

1. **[01 - Routing & URI Conventions](01-routing-conventions.md):**
   * The 2-verb (`GET`/`POST`) HTTP routing model.
   * Standard CRUD URI suffixes (`/store`, `/{id}/update`, `/{id}/destroy`) vs. descriptive domain actions.
   * Version prefixing (`/api/v1/`) and model route binding.

2. **[02 - Form Requests & Validation Architecture](02-form-requests-and-validation.md):**
   * Mandatory array validation syntax and fluent `Rule::` objects.
   * Policy-driven `authorize()` methods.
   * Contextual database foreign key validation scoped to user identity.
   * Input sanitization via `$request->validated()`.

3. **[03 - API Resources & Transformation Layer](03-api-resources.md):**
   * Strict separation between database schemas and external JSON contracts.
   * Preventing N+1 queries using `$this->whenLoaded()`.
   * Explicit attribute typing (ISO 8601 timestamps, numeric casts).
   * Integration with paginated query collections and the **ADR-001** response envelope.

---

## 2. Core Architectural Principles

```
Incoming Request
      │
      ▼
┌───────────────────────────┐
│   Routing Layer (v1)      │  ── 2-Verb Model (GET / POST with action suffixes)
└─────────────┬─────────────┘
              │
              ▼
┌───────────────────────────┐
│   Form Request            │  ── authorize(): bool + array rules + Rule::exists()
└─────────────┬─────────────┘
              │ $request->validated()
              ▼
┌───────────────────────────┐
│   Controller (Thin)       │  ── try / catch (Throwable $e) -> handleException($e)
└─────────────┬─────────────┘
              │ Invokes domain service with User $user
              ▼
┌───────────────────────────┐
│   Domain Service Layer    │  ── Pure business logic & database transactions
└─────────────┬─────────────┘
              │ Returns Eloquent Model / Collection
              ▼
┌───────────────────────────┐
│   API Resource Layer      │  ── Guarded relations (whenLoaded), ISO dates, casting
└─────────────┬─────────────┘
              │
              ▼
┌───────────────────────────┐
│   ADR-001 JSON Envelope   │  ── is_error, message, data, errors, pagination
└───────────────────────────┘
```
