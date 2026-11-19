# ADR-001 Response Envelope & Error Mapping

> **Practical integration with Laravel ADR-001 responses: Domain payload unwrapping and automated 422 error bag mapping.**

---

## 1. Backend Endpoint Integration

Tier 5 services call the endpoints exposed by the Laravel backend as defined in `ARCHITECTURE.md` and `backend/routes/api.php`:

| Operation | Method | Endpoint Pattern | Service Example |
| :--- | :--- | :--- | :--- |
| **Fetch Collection / Details** | `GET` | `/<feature>` or `/<feature>/{id}` | `api.get('/items', { params, signal })` |
| **Create Resource** | `POST` | `/<feature>/store` | `api.post('/items/store', payload, { signal })` |
| **Update Resource** | `POST` | `/<feature>/{id}/update` | `api.post('/items/${id}/update', payload, { signal })` |
| **Destroy Resource** | `POST` | `/<feature>/{id}/destroy` | `api.post('/items/${id}/destroy', {}, { signal })` |
| **Custom Mutation Action** | `POST` | `/<feature>/{id}/<action>` | `api.post('/items/${id}/cancel', {}, { signal })` |

---

## 2. Consuming the ADR-001 Response Envelope

The Laravel backend wraps all API responses in the standard **ADR-001 envelope**:

```json
// Success:
{
  "is_error": false,
  "message": "Resource retrieved successfully.",
  "data": { "id": 1, "title": "Sample Item" },
  "errors": {}
}

// Validation Failure (HTTP 422):
{
  "is_error": true,
  "message": "The given data was invalid.",
  "data": null,
  "errors": {
    "name": ["The name field is required."]
  }
}
```

### Unwrapping Rule for Services (Tier 5)
Every service function **must unwrap and return `response.data?.data`**. Never leak the outer Axios or ADR-001 envelope to React hooks or UI components:

```javascript
// ❌ Forbidden (Leaks envelope metadata into UI state, crashes React .map() loops):
export async function getFeatureItem(id, signal) {
   const response = await api.get(`/items/${id}`, { signal });
   return response.data; // 💥 Returns { is_error, message, data: [...] }
}

// ✅ Approved (Clean domain payload unwrapping):
export async function getFeatureItem(id, signal) {
   const response = await api.get(`/items/${id}`, { signal });
   return response.data?.data ?? null;
}

export async function createFeatureItem(payload, signal) {
   const response = await api.post('/items/store', payload, { signal });
   return response.data?.data ?? null;
}
```

* **Data Invariant:** On error, `data` is strictly `null` (never `[]` or `{}`). Always use nullish coalescing (`?? null` or `?? []`) depending on whether the expected entity is an object or array.

---

## 3. Automated Form Error Mapping (`mapLaravelErrorsToForm`)

Laravel returns validation errors in a keyed error bag: `{ [fieldName]: string[] }`.

Rather than writing manual try-catch blocks or showing vague generic alerts, Tier 5 utility `mapLaravelErrorsToForm` automatically connects backend error keys to React Hook Form field state:

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
