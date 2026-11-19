# Component Testing & User-Centric Assertions

---

## 1. Test Harness Architecture (`src/test/utils.jsx`)

When testing smart containers (Tier 2) or custom hooks (Tier 4) that interact with TanStack Query, tests must be wrapped in a test-configured `QueryClientProvider`.

### Mandatory Invariant: Fresh `QueryClient` with `retry: false`
Never share a global `QueryClient` instance across tests. Always instantiate a fresh `QueryClient` per test with retries disabled so failing assertions fail immediately without waiting for retry delays:

```javascript
// src/test/utils.jsx
import * as React from 'react';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export function createTestQueryClient() {
   return new QueryClient({
      defaultOptions: {
         queries: {
            retry: false, // Crucial: Prevents 3 retry loops on test failure
            staleTime: 0,
         },
         mutations: {
            retry: false,
         },
      },
   });
}

export function renderWithProviders(ui, { queryClient = createTestQueryClient() } = {}) {
   function Wrapper({ children }) {
      return (
         <QueryClientProvider client={queryClient}>
            {children}
         </QueryClientProvider>
      );
   }

   return {
      ...render(ui, { wrapper: Wrapper }),
      queryClient,
   };
}
```

---

## 2. User-Centric Query Priority

Tests must interact with the DOM exactly the way a real user or screen-reader does.

### Approved Query Hierarchy
1. **`getByRole` / `findByRole`:** Highest priority (`button`, `heading`, `textbox`, `combobox`, `dialog`).
2. **`getByLabelText` / `findByLabelText`:** For form inputs bound to visible `<label>` elements.
3. **`getByText` / `findByText`:** For static textual content, paragraphs, and notification messages.
4. **`getByTestId`:** Permitted **only** when semantic roles or text content do not exist (e.g. dynamic canvas or abstract icons).

### ❌ Strictly Forbidden in Tests:
* Querying by CSS class names or DOM selectors (`container.querySelector('.btn-primary')`).
* Inspecting private React component state or props.
* Mocking internal React hooks (`useState`, `useEffect`).

---

## 3. Canonical Smart Container Test Pattern

Here is the approved pattern testing a feature container from initial render through user interaction:

```javascript
// src/components/feature/FeatureContainer.test.jsx
import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/utils';
import { FeatureContainer } from './FeatureContainer';

describe('FeatureContainer', () => {
   it('renders the item list after loading resolves', async () => {
      renderWithProviders(<FeatureContainer />);

      // 1. Initial loading skeleton is visible
      expect(screen.getByTestId('feature-skeleton')).toBeInTheDocument();

      // 2. Await async resolution using findBy*
      const heading = await screen.findByRole('heading', { name: /items directory/i });
      expect(heading).toBeInTheDocument();

      const itemCard = await screen.findByText('Sample Feature Item');
      expect(itemCard).toBeInTheDocument();
   });

   it('submits a new item through the form', async () => {
      const user = userEvent.setup();
      renderWithProviders(<FeatureContainer />);

      // Fill in form inputs via accessible labels
      const nameInput = await screen.findByLabelText(/name/i);
      await user.type(nameInput, 'New Test Item');

      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      // Verify success notification
      const successToast = await screen.findByText(/saved successfully/i);
      expect(successToast).toBeInTheDocument();
   });
});
```

* **Why `findBy*` is Mandatory for Async:** `getBy*` asserts immediately and throws an error if data is fetching. `findBy*` returns a Promise that waits for the element to appear in the DOM following asynchronous TanStack Query resolution.
