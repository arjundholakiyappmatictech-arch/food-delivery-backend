# ADR-001: Unified API Response Envelope Specification

* **Status:** Accepted  
* **Date:** 2026-11-12  
* **Author:** Backend Engineering Team  
* **Deciders:** Engineering Lead, Backend Engineering Team  

---

## 1. Context and Problem Statement

Across historical and existing backend endpoints, API response serialization has suffered from three architectural inconsistencies:
1. **Inconsistent Error Status Keys:** Some endpoints serialized `"status": false`, others serialized `"success": false`, whereas organizational backend standards mandate `"is_error": true`.
2. **Type Mutation on Error Payloads (`"data": []`):** When endpoints configured to return a single entity (such as a User or Order model) encounter a domain exception or failure, error handlers frequently returned `"data": []` (empty list) instead of `"data": null`. This mutates the declared schema structure from an associative object to a sequential array, violating contract predictability.
3. **Missing Top-Level Message in Validation Exceptions:** On HTTP 422 Unprocessable Entity responses, default validation serialization returned `"errors": { ... }` while omitting the root `"message"` attribute, creating asymmetry with all other HTTP 4xx/5xx exception payloads.

We require a single, deterministic backend JSON response envelope standard across all controllers, Form Requests, and exception handlers.

---

## 2. Considered Options

* **Option 1: Ad-hoc Framework Serialization:** Allow controllers and default framework exception renderers to serialize responses independently without an enforced envelope.
* **Option 2: JSend Specification (`status: "success"|"fail"|"error"`):** Standard 3-state envelope. Rejected in favor of our organization's boolean-flag standard (`is_error`).
* **Option 3: Strict Backend Response Envelope with Fixed Type Invariants:**
  * Root boolean `is_error` (`false` for success, `true` for failures).
  * Mandatory root string `message` across **every** response without exception.
  * Root `data` payload containing the serialized resource/collection on success, and strictly `null` on errors (prohibiting empty arrays `[]` on error).
  * Root `errors` map present on 422 validation errors, and `null` or omitted on non-validation responses.
  * Optional `pagination` object for paginated collections.

---

## 3. Decision Outcome

**Chosen Option:** **Option 3 (Strict Backend Response Envelope).**

### Backend Response Schema Specification
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "required": ["is_error", "message", "data"],
  "properties": {
    "is_error": { "type": "boolean" },
    "message": { "type": "string" },
    "data": { "type": ["object", "array", "null"] },
    "errors": {
      "type": ["object", "null"],
      "additionalProperties": {
        "type": "array",
        "items": { "type": "string" }
      }
    },
    "pagination": { "type": ["object", "null"] }
  }
}
```

### Response Shapes

#### A. Success Response (HTTP 200 / 201)
```json
{
    "is_error": false,
    "message": "User profile fetched successfully.",
    "data": {
        "id": 32,
        "firstname": "testyy1",
        "lastname": "userhhgg",
        "email": "ttuser@gmail.com",
        "display_name": "test user"
    }
}
```

#### B. General Error Response (HTTP 400, 401, 403, 404, 500)
```json
{
    "is_error": true,
    "message": "Failed to update user profile: Disk named `s3` cannot be accessed",
    "data": null
}
```

#### C. Validation Error Response (HTTP 422)
```json
{
    "is_error": true,
    "message": "The given data was invalid.",
    "data": null,
    "errors": {
        "email": [
            "The email has already been taken."
        ],
        "display_name": [
            "Display name already been taken."
        ]
    }
}
```

---

## 4. Backend Invariant Rules (Strictly Enforced)

1. **`data` MUST be `null` on error:** Whenever `is_error` evaluates to `true`, the `data` attribute must be serialized as `null`. It is strictly forbidden for controllers or exception handlers to serialize `[]` (empty array), `""` (empty string), or `false` on failure pipelines.
2. **`message` is NEVER optional:** Every controller response and exception handler without exception must provide a non-empty string in `message`.
3. **`errors` structure:** On 422 validation failures, `errors` must be formatted as an associative map where keys are field names and values are arrays of string error messages (`array<string, array<string>>`).

---

## 5. Architectural Benefits
* **Deterministic Controller Contracts:** Base Controller helper methods (`successResponse`, `errorResponse`, `validationErrorResponse`) enforce consistent return signatures across all feature domains.
* **Uniform Exception Serialization:** Global and domain exceptions map into identical envelope structures, eliminating edge cases where uncaught errors alter output schemas.
* **Schema Integrity:** Prevents type collisions (associative object vs. sequential list) in serialization pipelines.

## 6. Implementation & Migration Plan
1. Update `GUIDELINES.md` to document the exact response shapes and forbidden anti-patterns.
2. Document the Base Controller and exception handling patterns in markdown specifications.
3. Align Form Request validation failure rendering and global exception handling to conform to the 422 and 4xx/5xx envelopes.
