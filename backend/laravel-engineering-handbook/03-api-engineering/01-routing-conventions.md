# Routing & URI Conventions

---

## 1. Architectural Philosophy: The 2-Verb Model

Routing defines the entry contract for all incoming HTTP requests. Rather than utilizing the full standard HTTP verb spectrum (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`), our backend architecture enforces a **strict 2-verb model**:

1. **`GET`**: Strictly for data retrieval, idempotent queries, and collection filtering. Never mutates database state.
2. **`POST`**: For all state mutations, resource creations, updates, soft/hard deletions, and custom domain actions.

> [!IMPORTANT]
> **Strictly Forbidden:** `PUT`, `PATCH`, and `DELETE` HTTP methods are forbidden in route definitions. All state mutations must use `POST`.

---

## 2. Mandatory URI Conventions & Invariant Matrix

| Operation | Approved HTTP Route | Forbidden Anti-Patterns |
| :--- | :--- | :--- |
| **Fetch Collection** | `GET /api/v1/{resource}` | Mutating database state inside `GET` routes. |
| **Fetch Single Entity** | `GET /api/v1/{resource}/{id}` | Using unversioned routes (`/api/{resource}/{id}`). |
| **Create Entity** | `POST /api/v1/{resource}/store` | `POST /create`, using standard REST `POST /{resource}` without suffix. |
| **Update Entity** | `POST /api/v1/{resource}/{id}/update` | Using `PUT` or `PATCH` methods; `POST /{id}/edit`. |
| **Delete Entity** | `POST /api/v1/{resource}/{id}/destroy` | Using `DELETE` method; `POST /{id}/delete`. |
| **Custom Mutation** | `POST /api/v1/{resource}/{id}/{action}` | Performing business actions (e.g. `/cancel`) via `GET`. |
| **Custom Read Query**| `GET /api/v1/{resource}/{id}/{view}` | Mutating status in read endpoints (e.g. `/invoice`). |
| **Route Names** | Omitted by default (not required for JSON APIs) | Generating unused Blade route names (`->name('orders.store')`). |

---

## 3. Approved Implementation Pattern

All routes reside in `routes/api.php` grouped by version and authentication:

```php
use App\Http\Controllers\OrderController;
use App\Http\Controllers\RestaurantController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function (): void {

    // 1. Public / Unauthenticated Endpoints
    Route::prefix('restaurants')->group(function (): void {
        Route::get('', [RestaurantController::class, 'index']);
        Route::get('nearby', [RestaurantController::class, 'nearby']);
        Route::get('{restaurant}', [RestaurantController::class, 'show']);
    });

    // 2. Authenticated Endpoints
    Route::middleware('auth:sanctum')->group(function (): void {
        Route::prefix('orders')->group(function (): void {
            // Read Queries (GET)
            Route::get('', [OrderController::class, 'index']);
            Route::get('{order}', [OrderController::class, 'show']);
            Route::get('{order}/invoice', [OrderController::class, 'invoice']);

            // Standard CRUD Mutations (POST with explicit suffix)
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

## 4. Route Model Binding Standards

* **Implicit Binding:** Type-hint Eloquent models in controller methods (`show(Order $order)`) matching route placeholders (`{order}`).
* **Explicit Keys & Scoping:** Specify alternate keys in route parameters (e.g. `{order:uuid}`) and append `->scopeBindings()` for nested child relationships to enforce parent ownership automatically.

---

## 5. API Versioning Standards (Transport vs. Domain Separation)

When managing multiple API versions (e.g. `v1` and `v2`):

1. **Versioned Transport Layer:**
   * **Route Groups:** Group routes explicitly under `Route::prefix('v1')` and `Route::prefix('v2')`.
   * **Controllers (`app/Http/Controllers/V2/`):** Coordinate v2 inputs and invoke domain services.
   * **Form Requests (`app/Http/Requests/V2/`):** Validate breaking payload changes without breaking legacy v1 clients.
   * **API Resources (`app/Http/Resources/V2/`):** Transform models into updated v2 JSON response contracts.

2. **Version-Agnostic Domain Layer:**
   * **Services (`app/Services/`):** Must **never** be versioned (`app/Services/V2/` is strictly forbidden). Business logic, inventory rules, and database transactions are singular. Both `V1` and `V2` controllers inject the exact same underlying domain services.
   * **Models & Migrations:** Single, version-agnostic database schema.
