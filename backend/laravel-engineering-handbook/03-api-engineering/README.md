# Module 03: API Engineering Standards

> Architectural specifications for HTTP routing, request validation boundaries, and serialization contracts across our backend services.

---

## 1. Directory Contents

1. **[01 - Routing & URI Conventions](01-routing-conventions.md):**
   * The strict 2-verb (`GET`/`POST`) HTTP routing model.
   * Standard CRUD URI suffixes (`/store`, `/{id}/update`, `/{id}/destroy`) vs. descriptive domain actions.
   * Mandatory version prefixing (`/api/v1/`) and model route binding.

2. **[02 - Form Requests & Validation Architecture](02-form-requests-and-validation.md):**
   * Mandatory array validation syntax and fluent `Rule::` objects.
   * Policy-driven `authorize(): bool` methods.
   * Contextual database foreign key validation scoped to user identity.
   * Strict extraction via `$request->validated()`.

3. **[03 - API Resources & Transformation Layer](03-api-resources.md):**
   * Strict separation between database schemas and external JSON contracts.
   * Preventing N+1 queries using `$this->whenLoaded()`.
   * Explicit attribute typing (ISO 8601 timestamps, numeric casts).
   * Integration with paginated query collections and the **ADR-001** response envelope.

---

## 2. Invariant Summary Matrix

| Category | Standard Rule | Prohibited Anti-Pattern |
| :--- | :--- | :--- |
| **HTTP Verbs** | Strict 2-verb model: `GET` for reads, `POST` for mutations. | Using `PUT`, `PATCH`, or `DELETE`; mutating state inside `GET` routes. |
| **CRUD URIs** | Explicit suffixes: `/store`, `/{id}/update`, `/{id}/destroy`. | Inconsistent naming (`/create`, `/edit`, `/delete`); missing `v1` prefix. |
| **Validation Syntax** | Mandatory array syntax: `['required', 'string']`. | Pipe strings (`'required\|string'`); inline `$request->validate()` in controllers. |
| **Input Extraction** | Pass `$request->validated()` to domain services. | Passing raw `$request->all()` or `$request->input()`. |
| **Relationship Guards** | Wrap all relationship transformations in `$this->whenLoaded()`. | Unguarded property access (`$this->items`), causing N+1 query loops. |
| **Response Contract** | Transform models through API Resources conforming to ADR-001. | Returning raw Eloquent models directly from controllers. |
