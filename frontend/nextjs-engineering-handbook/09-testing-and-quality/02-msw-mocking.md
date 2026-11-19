# MSW Contract Mocking & Laravel Alignment

---

## 1. Why MSW Over Axios Mocking

Mocking the Axios client directly (`vi.mock('axios')` or `vi.mock('@/lib/api/api')`) is strictly forbidden:

```javascript
// ❌ Forbidden (Brittle module mocking):
import api from '@/lib/api/api';
vi.mock('@/lib/api/api');
api.get.mockResolvedValue({ data: { data: [] } }); // ⚠️ Bypasses real interceptors and error handlers!
```

### Why Module Mocking Fails:
1. **Bypasses Real Infrastructure:** It skips request interceptors (Bearer token attachment), offline pre-flight logic, and error normalization (`parseApiError`).
2. **False Positives:** Tests pass even if your real Axios config or URL parsing is broken.
3. **Refactor Fragility:** Renaming service functions or changing internal HTTP options breaks mock setups across dozens of tests.

### ✅ The Approved Standard: Mock Service Worker (MSW v2)
MSW intercepts HTTP traffic at the network socket layer. Your real Axios client, real request interceptors, real TanStack Query hooks, and real components execute from end to end.

---

## 2. Server Setup & Handler Architecture

Colocate test network handlers under `src/test/mocks/`:

```javascript
// src/test/mocks/handlers.js
import { http, HttpResponse } from 'msw';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

export const handlers = [
   // Collection query (GET)
   http.get(`${API_BASE}/items`, () => {
      return HttpResponse.json({
         is_error: false,
         message: 'Items retrieved successfully.',
         data: [
            { id: 1, name: 'Sample Item 1', status: 'active' },
            { id: 2, name: 'Sample Item 2', status: 'inactive' },
         ],
         errors: {},
      });
   }),

   // Create mutation (POST matching backend)
   http.post(`${API_BASE}/items/store`, async ({ request }) => {
      const payload = await request.json();
      return HttpResponse.json({
         is_error: false,
         message: 'Item created successfully.',
         data: { id: 3, ...payload },
         errors: {},
      });
   }),
];
```

```javascript
// src/test/mocks/server.js
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

```javascript
// src/test/setup.js (Global Vitest setup)
import { beforeAll, afterEach, afterAll } from 'vitest';
import { server } from './mocks/server';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

---

## 3. Mock Handlers Matching Backend Endpoints

Mock route handlers must strictly mirror the Laravel backend API contract:

| Operation | Approved Mock Verb | Forbidden Mock Verbs |
| :--- | :--- | :--- |
| **Fetch Collection / Detail** | `http.get('/items')` | - |
| **Create Resource** | `http.post('/items/store')` | `http.put` |
| **Update Resource** | `http.post('/items/:id/update')` | `http.put`, `http.patch` |
| **Destroy Resource** | `http.post('/items/:id/destroy')` | `http.delete` |

---

## 4. Testing Laravel 422 Error Bags (`mapLaravelErrorsToForm`)

To verify that server-side validation errors correctly display under form inputs, override the network handler locally in your test using `server.use()`:

```javascript
// src/components/feature/FeatureForm.test.jsx
import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { renderWithProviders } from '@/test/utils';
import { FeatureForm } from './FeatureForm';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

describe('FeatureForm Server Validation', () => {
   it('binds Laravel 422 error bags directly to input fields', async () => {
      // Simulate backend rejecting duplicate name:
      server.use(
         http.post(`${API_BASE}/items/store`, () => {
            return HttpResponse.json(
               {
                  is_error: true,
                  message: 'The given data was invalid.',
                  data: null,
                  errors: {
                     name: ['The name has already been taken.'],
                  },
               },
               { status: 422 }
            );
         })
      );

      const user = userEvent.setup();
      renderWithProviders(<FeatureForm />);

      // Fill in valid data on client to pass Zod pre-flight
      const nameInput = screen.getByPlaceholderText(/enter name/i);
      await user.type(nameInput, 'Existing Name');

      const submitBtn = screen.getByRole('button', { name: /submit/i });
      await user.click(submitBtn);

      // Verify that mapLaravelErrorsToForm bound the error to the name input:
      const fieldError = await screen.findByText('The name has already been taken.');
      expect(fieldError).toBeInTheDocument();
   });
});
```

---

## 5. Testing Server Failures & Network Outages

Test catastrophic backend or network failures without touching production code:

```javascript
// Simulating HTTP 500 Internal Server Error
server.use(
   http.get(`${API_BASE}/items`, () => {
      return HttpResponse.json(
         {
            is_error: true,
            message: 'Database connection failed.',
            data: null,
            errors: {},
         },
         { status: 500 }
      );
   })
);

// Simulating Complete Network Loss (Client Offline)
server.use(
   http.get(`${API_BASE}/items`, () => {
      return HttpResponse.error();
   })
);
```

* **Outcome:** Verifies that your UI renders a clean `error.js` boundary or displays a user-friendly error notification rather than crashing with unhandled exceptions.
