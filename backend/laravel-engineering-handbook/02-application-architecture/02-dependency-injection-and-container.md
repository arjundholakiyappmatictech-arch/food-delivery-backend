# Dependency Injection & Container Mechanics

---

## 1. Container Philosophy: Pragmatic & Lean

Laravel's Service Container provides automatic dependency resolution (auto-wiring). In our architecture, we leverage container auto-wiring for **testability and clean class decoupling** without introducing speculative enterprise interface bloat.

---

## 2. Constructor Dependency Injection

All dependencies required by a class must be injected via the constructor using PHP 8 constructor property promotion:

```php
namespace App\Services;

class OrderService
{
    public function __construct(
        protected readonly RazorpayService $razorpayService,
        protected readonly InvoiceService $invoiceService,
    ) {}
}
```
Laravel automatically inspects constructor type-hints and resolves instances without manual configuration.

---

## 3. Third-Party SDK Singletons in Service Providers

When external SDK clients require configuration credentials or custom initialization, register them as **singletons** in `AppServiceProvider.php` (or a domain provider):

```php
namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Razorpay\Api\Api;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(Api::class, function (): Api {
            return new Api(
                config('services.razorpay.key'),
                config('services.razorpay.secret')
            );
        });
    }
}
```

---

## 4. Facades vs. Injected Dependencies

Laravel Facades provide convenient static proxies to container bindings, but overuse in domain logic introduces hidden coupling.

### Approved Stateless Facades:
Stateless framework utilities that carry zero actor or session state are approved across all layers:
* `DB::transaction()`, `DB::table()` (Database persistence)
* `Log::info()`, `Log::error()` (Logging)
* `Config::get()` (Configuration values)
* `Route::prefix()`, `Route::post()` (Routing declarations)

### Strictly Forbidden Facades in Domain Services:
Facades that access global HTTP transport state must **never** be used inside domain services:
* ❌ `Auth::user()` — Causes services to fail when invoked from Queue Jobs, CLI commands, or AI MCP tools.
* ❌ `Request::input()` — Bypasses Form Request validation boundaries.
* ❌ `Session::get()` — Ties domain logic to web browser cookies.

```php
// ❌ FORBIDDEN: Service reads global HTTP facade
class OrderService
{
    public function store(array $data): Order
    {
        $user = Auth::user(); // Fails in Queue worker, CLI command, or MCP tool!
    }
}

// ✅ APPROVED: Context passed explicitly through parameters
class OrderService
{
    public function store(User $user, array $data): Order
    {
        // Decoupled, predictable, and safely callable from any entry point
    }
}
```

---

> [!NOTE]
> For our pragmatic Dependency Inversion rules (banning speculative interfaces, direct concrete injection, and mocking via `$this->mock()`), see [01-fundamentals/02-solid-in-laravel.md](../01-fundamentals/02-solid-in-laravel.md#d--dependency-inversion-principle-dip--optional--pragmatic-standard).
