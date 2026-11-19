# Module 03: API Consumer Layer & Laravel Contracts

> **Axios transport architecture, 2-verb HTTP alignment, AbortSignal forwarding, and ADR-001 response envelope consumption.**

---

## 1. Directory Contents

1. **[01 - Axios Client Architecture](01-axios-client.md):**
   * Centralized Axios instance configuration (`src/lib/api/api.js`).
   * Request interceptors for Bearer token injection and offline pre-flight.
   * Mandatory request cancellation via `AbortSignal`.
   * Error normalization (`parseApiError`).

2. **[02 - ADR-001 Envelope & 2-Verb Model](02-adr-001-envelope.md):**
   * The strict 2-verb HTTP model (`GET` and `POST` only).
   * Consistent ADR-001 envelope unwrapping (`response.data?.data`).
   * Automated Laravel 422 error bag mapping to React Hook Form.

---

## 2. Invariant Summary Table

| Category | Approved Standard | Forbidden Anti-Pattern |
| :--- | :--- | :--- |
| **HTTP Client** | Centralized Axios instance (`src/lib/api/api.js`). | Ad-hoc `fetch()` calls or multiple unconfigured Axios instances. |
| **HTTP Verbs** | Strict 2-verb model: `GET` for fetching, `POST` for mutations (`/store`, `/{id}/update`, `/{id}/destroy`). | Using `PUT`, `PATCH`, or `DELETE` methods; mutations on `GET` routes. |
| **Response Unwrapping** | Services unwrap and return `response.data?.data`. | Returning raw Axios response or full envelope to UI components. |
| **Cancellation** | Accept `{ signal }` in services and forward to Axios. | Ignoring `signal`, causing race conditions on rapid navigation. |
| **Validation Errors** | Map Laravel 422 error bags directly to fields via `mapLaravelErrorsToForm()`. | Showing generic toast alerts for form field validation errors. |
| **Auth Tokens** | Handled automatically by Axios request interceptor. | Manually attaching `Authorization: Bearer` headers in every service method. |
