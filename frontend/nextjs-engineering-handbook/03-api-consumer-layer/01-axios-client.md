# Axios Client Architecture

---

## 1. Centralized Client Configuration (`src/lib/api/api.js`)

All outbound HTTP communication goes through a single, configured Axios instance. Creating ad-hoc Axios instances or using raw `fetch()` is strictly forbidden.

```javascript
import axios from 'axios';

const api = axios.create({
   baseURL: process.env.NEXT_PUBLIC_API_URL,
   headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
   },
});
```

---

## 2. Universal Request Interceptors

The centralized client automatically handles authentication tokens and offline detection:

1. **Bearer Token Injection:** Automatically attaches `Authorization: Bearer <token>` from `localStorage` to every request. Never manually pass auth headers in service methods.
2. **Offline Pre-Flight:** Checks `navigator.onLine` before dispatching. If the client is offline, it rejects immediately with a custom flag (`error.isNetworkOffline = true`), preventing 30-second hanging timeouts.

```javascript
api.interceptors.request.use(
   (config) => {
      if (typeof window !== 'undefined') {
         const token = localStorage.getItem('access_token');
         if (token) {
            config.headers.Authorization = `Bearer ${token}`;
         }

         if (!navigator.onLine) {
            const error = new Error('No internet connection.');
            error.isNetworkOffline = true;
            return Promise.reject(error);
         }
      }
      return config;
   },
   (error) => Promise.reject(error)
);

export default api;
```

---

## 3. Mandatory Request Cancellation (`AbortSignal`)

When a user switches tabs, types in an autocomplete input, or leaves a page, TanStack Query provides an `AbortSignal`.

Every service method **must accept `{ signal }` and forward it directly to Axios**:

```javascript
// ❌ Forbidden (No cancellation support):
export async function getItems(filters = {}) {
   const response = await api.get('/items', { params: filters });
   return response.data?.data ?? [];
}

// ✅ Approved (Cancellation enabled):
export async function getItems(filters = {}, signal) {
   const response = await api.get('/items', { params: filters, signal });
   return response.data?.data ?? [];
}
```

* **Why:** If the user leaves the page before the request completes, Axios cancels the in-flight HTTP connection immediately. This prevents memory leaks, race conditions, and wasted server bandwidth.

---

## 4. Error Normalization (`src/utils/apiError.js`)

Axios error objects, aborted requests (`CanceledError`), and network failures are normalized into a predictable UI error state:

```javascript
export const parseApiError = (error) => {
   const isCancelled = error?.name === 'CanceledError' || error?.code === 'ERR_CANCELED';
   const isOffline = error?.isNetworkOffline === true;
   const isNetworkError = !error?.response && !isCancelled && !isOffline;

   return {
      status: error?.response?.status ?? null,
      message:
         error?.response?.data?.message ??
         (isOffline
            ? 'No internet connection. Please check your connection and try again.'
            : isNetworkError
              ? 'Unable to connect to the server. Please try again.'
              : 'Something went wrong. Please try again.'),
      errors: error?.response?.data?.errors ?? {},
      isNetworkError,
      isOffline,
      isCancelled,
   };
};
```
