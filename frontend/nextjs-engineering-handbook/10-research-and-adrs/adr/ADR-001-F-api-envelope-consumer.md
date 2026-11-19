# ADR-001-F: Unified Response Consumer & 2-Verb Alignment

* **Status:** Accepted
* **Context:** Next.js 16 + React 19 Frontend consuming an external Laravel REST API.
* **Scope:** Architectural Standard for HTTP Transport, Envelope Unwrapping, and Error Handling.

---

## 1. Context & Problem Statement

Historically, frontend applications consuming REST APIs suffer from three recurring integration issues:
1. **Envelope Leakage:** Components and state hooks receive varying shapes of responses (e.g. raw Axios objects, HTTP headers, or nested envelope metadata), forcing JSX templates to guess whether to access `data.data.items` or `data.items`.
2. **HTTP Verb Mismatches:** Using `PUT`, `PATCH`, and `DELETE` frequently triggers CORS preflight failures, proxy stripping, or routing discrepancies against the backend.
3. **Fragile Form Error Handling:** Server validation failures (`422 Unprocessable Content`) are either ignored, caught generically via toast alerts, or manually mapped input-by-input with boilerplate code.

---

## 2. Decision

We establish three mandatory architectural contracts across the entire frontend application:

### 1. Strict 2-Verb HTTP Model
Outbound HTTP communication with the Laravel backend is strictly limited to **`GET`** and **`POST`**:
* **`GET`:** Read-only queries (collection listing, search, single-entity detail).
* **`POST`:** All state mutations:
  * Create: `POST /<feature>/store`
  * Update: `POST /<feature>/{id}/update`
  * Delete: `POST /<feature>/{id}/destroy`
  * Custom actions: `POST /<feature>/{id}/<action>`
* *Invariant:* `PUT`, `PATCH`, and `DELETE` HTTP methods are strictly forbidden.

### 2. Tier 5 Service Unwrapping Standard
All service functions in `src/services/<feature>Service.js` must unwrap and return **`response.data?.data`**:

```javascript
// ✅ Approved: Clean domain payload unwrapped at the transport boundary
export async function getFeatureItem(id, signal) {
   const response = await api.get(`/items/${id}`, { signal });
   return response.data?.data ?? null;
}
```

* **Data Invariant:** On error, the backend envelope sets `data: null`. Services coalesce nullish values (`?? null` for objects, `?? []` for collections). UI components and hooks never receive the outer `{ is_error, message, data, errors }` envelope.

### 3. Automated 422 Error Bag Mapping
Laravel validation error bags (`errors: { [fieldName]: string[] }`) returned with HTTP status `422` must be mapped directly into React Hook Form field state via `mapLaravelErrorsToForm`:

```javascript
export function mapLaravelErrorsToForm(errors, setError) {
   if (!errors || typeof errors !== 'object') return;
   Object.entries(errors).forEach(([field, messages]) => {
      setError(field, {
         type: 'server',
         message: Array.isArray(messages) ? messages[0] : messages,
      });
   });
}
```

---

## 3. Consequences

### Positive:
* **Payload Purity:** UI components and TanStack Query caches deal exclusively with clean domain entities.
* **Network Reliability:** Eliminates corporate proxy and edge CDN issues with `PUT`/`PATCH`/`DELETE`.
* **Zero UI Flash:** Validation errors appear inline under the exact form inputs with zero repetitive try/catch logic.

### Negative:
* Developers must remember to always pass `{ signal }` to service methods to preserve abort capabilities during rapid user navigation.
