# Chapter 02.2: Dependency Injection & Container Mechanics

> **Module:** `02-application-architecture`  
> **Classification:** Approved Engineering Standard (Our Organization)  
> **Status:** Active  

---

## 1. Overview & Service Container Philosophy

Laravel's **Service Container** is the inversion-of-control (IoC) engine that manages class dependencies and performs dependency injection.

In our backend architecture, we use the Service Container to achieve **clean class decoupling and testability** while avoiding enterprise boilerplate.

---

## 2. Constructor Dependency Injection

All dependencies required by a class must be injected via the constructor using PHP 8.4 **Constructor Property Promotion**. 

### Standard Pattern:
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

### Auto-Wiring Mechanics:
Laravel automatically inspects constructor type-hints using PHP reflection and resolves instances automatically. You do **not** need to manually configure container bindings for standard service classes.

---

## 3. Container Binding Lifecycles

When third-party SDKs, API clients, or complex services require custom initialization (e.g. reading configuration keys or setting timeouts), configure them inside `AppServiceProvider.php` (or a dedicated domain Service Provider).

### A. Singletons (`$this->app->singleton()`)
Use `singleton` when the service is stateless or expensive to instantiate, and should be shared across the entire request lifecycle:

```php
namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Razorpay\Api\Api;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // Resolved once per request; shared everywhere
        $this->app->singleton(Api::class, function (): Api {
            return new Api(
                config('services.razorpay.key'),
                config('services.razorpay.secret')
            );
        });
    }
}
```

### B. Transient Bindings (`$this->app->bind()`)
Use `bind` when a fresh, isolated instance must be created every time the class is injected:

```php
$this->app->bind(TaxCalculator::class, function () {
    return new TaxCalculator(rate: config('shop.tax_rate'));
});
```

---

## 4. Facades vs. Injected Dependencies

Laravel Facades provide a static interface to classes in the service container. However, overuse of Facades in the wrong layers leads to hidden coupling.

### Approved Facade Usage:
Stateless framework utilities that do not carry actor or session context are approved for use across all layers:
* `DB::transaction()`, `DB::table()` (Database operations)
* `Log::info()`, `Log::error()` (Logging)
* `Route::prefix()`, `Route::get()` (Route registration)
* `Config::get()` (Configuration reading)

### Forbidden Facade Usage in Domain Services:
Facades that access global HTTP transport state must **never** be used inside domain services or action classes:
* ❌ `Auth::user()` — Causes services to fail when called from Queue Jobs, CLI commands, or AI MCP tools.
* ❌ `Request::input()` — Bypasses Form Request validation boundaries.
* ❌ `Session::get()` — Ties domain logic to web browser cookies.

```php
// ❌ FORBIDDEN: Service reads global HTTP facade
class OrderService
{
    public function store(array $data): Order
    {
        $user = Auth::user(); // Fails in Queue worker or CLI command!
    }
}

// ✅ APPROVED: Context passed explicitly through parameters
class OrderService
{
    public function store(User $user, array $data): Order
    {
        // Safe in HTTP, Console, Queue, and MCP
    }
}
```

---

## 5. Direct Concrete Injection (Our Pragmatic Standard)

To maintain maximum developer velocity and **1-click IDE navigation (`Ctrl + Click`)**, our team standard enforces:

1. **Direct Injection for Single Providers:**
   If a service has only one implementation (e.g. `RazorpayService`), inject the concrete class directly into controllers or domain services. Do not create speculative `PaymentGatewayInterface` contracts until multiple concurrent providers are actually required.
2. **Testing via Container Mocking:**
   In Pest or PHPUnit tests, concrete injected services can be mocked directly using Laravel's testing helpers without needing an interface:
   ```php
   $this->mock(RazorpayService::class, function ($mock) {
       $mock->shouldReceive('refundPayment')->once()->andReturn(['status' => 'refunded']);
   });
   ```

