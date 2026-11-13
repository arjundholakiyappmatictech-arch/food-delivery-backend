# Chapter 03.1: Routing & URI Conventions

> **Module:** `03-api-engineering`  
> **Classification:** Approved Engineering Standard (Our Organization)  
> **Status:** Active  

---

## 1. Overview & Architectural Philosophy

Routing is the entry point for all incoming HTTP requests into our backend services. In our organization, routing design prioritizes **contract predictability, version control, and simplicity**.

Rather than utilizing the full standard HTTP verb spectrum (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`), our backend architecture enforces a **strict 2-verb model**:
1. **`GET`**: Strictly for data retrieval, idempotent queries, and collection filtering. Never mutates database state.
2. **`POST`**: For all state transitions, resource creations, updates, soft/hard deletions, and custom domain actions.

---

## 2. Mandatory Routing Standards

### A. The 2-Verb Model

| Verb | Permitted Purpose | Prohibited Actions |
| :--- | :--- | :--- |
| **`GET`** | Fetching collections (`index`), single entities (`show`), calculated reports, read-only queries. | Database writes, status changes, session mutations, logging analytics via queries that alter state. |
| **`POST`** | Persisting new entities (`store`), updating existing records (`update`), deleting records (`destroy`), executing domain transitions (`cancel`, `verify`, `dispatch`). | Pure idempotent read operations without state modification. |

> [!IMPORTANT]
> **Strictly Prohibited:** `PUT`, `PATCH`, and `DELETE` HTTP methods are forbidden in route definitions. All state mutations must use `POST`.

---

### B. URI Suffix Conventions

To maintain uniformity across all controllers, URIs must adhere to a deterministic suffix convention:

#### 1. Standard CRUD Mutations
For standard CRUD operations on a resource, the URI must append the operation name as an explicit suffix:

* **Creation:** `POST /api/v1/{resource}/store`
* **Update:** `POST /api/v1/{resource}/{id}/update`
* **Deletion:** `POST /api/v1/{resource}/{id}/destroy`

#### 2. Standard CRUD Retrieval
* **Collection:** `GET /api/v1/{resource}`
* **Single Entity:** `GET /api/v1/{resource}/{id}`

#### 3. Custom Domain Operations
For business logic that does not map to CRUD (e.g. state machines, verification, workflow triggers), use a descriptive custom action slug directly:

* **Custom Mutations (POST):**
  * `POST /api/v1/orders/{id}/cancel`
  * `POST /api/v1/orders/{id}/verify-payment`
  * `POST /api/v1/deliveries/{id}/assign`
* **Custom Read Queries (GET):**
  * `GET /api/v1/orders/{id}/invoice`
  * `GET /api/v1/restaurants/nearby`

---

### C. Versioning & Route Grouping

1. **Mandatory Version Prefix:** All API endpoints must be grouped under a major version prefix (e.g., `v1`).
2. **No Route Names Required:** Generating route name aliases (`->name('orders.store')`) is **not required** for API routes because API controllers return direct JSON responses and do not rely on Blade route helpers.
3. **Route File Organization:** All public and authenticated API routes must reside in `routes/api.php` (or modularized route files imported by `routes/api.php`).

---

## 3. Approved Implementation Pattern

```php
<?php

use App\Http\Controllers\OrderController;
use App\Http\Controllers\RestaurantController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function (): void {
    
    // -------------------------------------------------------------
    // Public / Unauthenticated Endpoints
    // -------------------------------------------------------------
    Route::prefix('restaurants')->group(function (): void {
        Route::get('', [RestaurantController::class, 'index']);
        Route::get('nearby', [RestaurantController::class, 'nearby']);
        Route::get('{restaurant}', [RestaurantController::class, 'show']);
    });

    // -------------------------------------------------------------
    // Authenticated Endpoints
    // -------------------------------------------------------------
    Route::middleware('auth:sanctum')->group(function (): void {
        
        Route::prefix('orders')->group(function (): void {
            // Read Queries (GET)
            Route::get('', [OrderController::class, 'index']);
            Route::get('{order}', [OrderController::class, 'show']);
            Route::get('{order}/invoice', [OrderController::class, 'invoice']);

            // Standard CRUD Mutations (POST with suffix)
            Route::post('store', [OrderController::class, 'store']);
            Route::post('{order}/update', [OrderController::class, 'update']);
            Route::post('{order}/destroy', [OrderController::class, 'destroy']);

            // Custom Domain Mutations (POST with descriptive action)
            Route::post('{order}/cancel', [OrderController::class, 'cancel']);
            Route::post('{order}/verify-payment', [OrderController::class, 'verifyPayment']);
        });

    });

});
```

---

## 4. Forbidden Anti-Patterns

### Anti-Pattern 1: Using `PUT`, `PATCH`, or `DELETE`
```php
// ❌ FORBIDDEN: Standard REST verbs outside our 2-verb model
Route::put('orders/{order}', [OrderController::class, 'update']);
Route::patch('orders/{order}/cancel', [OrderController::class, 'cancel']);
Route::delete('orders/{order}', [OrderController::class, 'destroy']);

// ✅ APPROVED: Strict POST with explicit action suffix
Route::post('orders/{order}/update', [OrderController::class, 'update']);
Route::post('orders/{order}/cancel', [OrderController::class, 'cancel']);
Route::post('orders/{order}/destroy', [OrderController::class, 'destroy']);
```

### Anti-Pattern 2: State Mutations Inside `GET` Routes
```php
// ❌ FORBIDDEN: Mutating database records within a GET endpoint
Route::get('orders/{order}/cancel', [OrderController::class, 'cancel']);

// ✅ APPROVED: State transitions must use POST
Route::post('orders/{order}/cancel', [OrderController::class, 'cancel']);
```

### Anti-Pattern 3: Inconsistent Action Naming
```php
// ❌ FORBIDDEN: Arbitrary or fragmented CRUD suffixes
Route::post('orders/create', [OrderController::class, 'store']);
Route::post('orders/{order}/edit', [OrderController::class, 'update']);
Route::post('orders/{order}/delete', [OrderController::class, 'destroy']);

// ✅ APPROVED: Canonical suffixes matching controller method names
Route::post('orders/store', [OrderController::class, 'store']);
Route::post('orders/{order}/update', [OrderController::class, 'update']);
Route::post('orders/{order}/destroy', [OrderController::class, 'destroy']);
```

### Anti-Pattern 4: Unversioned Top-Level Endpoints
```php
// ❌ FORBIDDEN: Missing API version prefix
Route::post('orders/store', [OrderController::class, 'store']);

// ✅ APPROVED: Explicit version group
Route::prefix('v1')->group(function (): void {
    Route::post('orders/store', [OrderController::class, 'store']);
});
```

---

## 5. Route Model Binding Standards

When route parameters match Eloquent model class names (e.g. `{order}` resolving to `App\Models\Order`):
1. **Implicit Binding:** Ensure type-hinted controller parameters match the route placeholder name.
2. **Explicit Keys:** If binding by a column other than `id` (e.g. UUID, slug, tracking number), define it explicitly in the route signature:
   ```php
   Route::get('orders/{order:uuid}', [OrderController::class, 'show']);
   ```
3. **Scoped Bindings:** For nested child resources, use Laravel's scoped bindings to enforce foreign key ownership automatically:
   ```php
   Route::get('restaurants/{restaurant}/menus/{menu:slug}', [MenuController::class, 'show'])->scopeBindings();
   ```
