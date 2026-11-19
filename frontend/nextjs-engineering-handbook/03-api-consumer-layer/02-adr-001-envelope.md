# ADR-001 Envelope & 2-Verb Model

---

## 1. The Strict 2-Verb HTTP Model

All communication with the Laravel backend strictly adheres to a **2-verb HTTP model**:

| Operation Type | Allowed Verb | Endpoint Pattern | Forbidden Verbs |
| :--- | :--- | :--- | :--- |
| **Fetch Collection / Details** | `GET` | `/<feature>` or `/<feature>/{id}` | - |
| **Create Resource** | `POST` | `/<feature>/store` | `PUT` |
| **Update Resource** | `POST` | `/<feature>/{id}/update` | `PUT`, `PATCH` |
| **Delete Resource** | `POST` | `/<feature>/{id}/destroy` | `DELETE` |
| **Custom Mutation Action** | `POST` | `/<feature>/{id}/<action>` | `PATCH` |

### Why Strict 2-Verb?
1. **Firewall & Proxy Reliability:** Corporate firewalls, edge CDNs, and older HTTP proxies often strip or block `PUT`, `PATCH`, and `DELETE` requests or their request bodies. `POST` always reaches the server cleanly.
2. **Eliminates Pre-Flight Quirks:** Standard `POST` requests with JSON bodies avoid inconsistent browser pre-flight cache bugs.
3. **1:1 Backend Alignment:** Matches the backend Laravel rulebook (`backend/laravel-engineering-handbook/GUIDELINES.md`), eliminating verb mismatch errors between teams.

---

## 2. Consuming the ADR-001 Response Envelope

The Laravel backend wraps every single response in the standard **ADR-001 envelope**:

```json
{
  "is_error": false,
  "message": "Resource retrieved successfully.",
  "data": { ... },
  "errors": {}
}
```

On validation failure (`422 Unprocessable Content`) or business rule rejection (`400/500`):
```json
{
  "is_error": true,
  "message": "The given data was invalid.",
  "data": null,
  "errors": {
    "name": ["The name field is required."],
    "code": ["The code has already been taken."]
  }
}
```

### Unwrapping Rule for Services (Tier 5)
Every service function **must unwrap and return `response.data?.data`**. Never leak the outer Axios or ADR-001 envelope to hooks or components.

```javascript
// ❌ Forbidden (Leaks envelope metadata into UI state):
export async function getFeatureItem(id, signal) {
   const response = await api.get(`/items/${id}`, { signal });
   return response.data; // Returns { is_error, message, data: { ... } }
}

// ✅ Approved (Clean domain payload unwrapping):
export async function getFeatureItem(id, signal) {
   const response = await api.get(`/items/${id}`, { signal });
   return response.data?.data ?? null;
}

export async function createFeatureItem(payload) {
   const response = await api.post('/items/store', payload);
   return response.data?.data ?? null;
}
```

* **Data Invariant:** On error, `data` is strictly `null` (never `[]` or `{}`). Always use nullish coalescing (`?? null` or `?? []`) depending on whether the expected entity is an object or array.

---

## 3. Automated Form Error Mapping (`mapLaravelErrorsToForm`)

Laravel returns validation errors in a keyed error bag: `{ [fieldName]: string[] }`.

Rather than writing repetitive try-catch blocks or showing vague generic toast alerts for form field errors, Tier 5 utility `mapLaravelErrorsToForm` automatically connects backend error keys to React Hook Form field state:

```javascript
// src/utils/formErrors.js
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

### Usage Pattern in TanStack Mutations

```javascript
// In a custom mutation hook (Tier 4) or feature container (Tier 2):
const mutation = useMutation({
   mutationFn: createFeatureItem,
   onSuccess: () => {
      toast.success('Saved successfully.');
      queryClient.invalidateQueries({ queryKey: featureKeys.all });
   },
   onError: (error) => {
      const parsed = parseApiError(error);

      if (parsed.status === 422 && Object.keys(parsed.errors).length > 0) {
         // Automatically sets field errors in React Hook Form
         mapLaravelErrorsToForm(parsed.errors, form.setError);
         return;
      }

      // General / network / business logic failure
      toast.error(parsed.message);
   },
});
```

* **Outcome:** The user sees exact inline validation feedback under the exact invalid inputs, identical to client-side Zod validation errors, without redundant boilerplate.
