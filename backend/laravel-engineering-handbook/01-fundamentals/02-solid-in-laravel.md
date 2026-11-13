# Chapter 01.2: Pragmatic SOLID Principles in Laravel

> **Module:** `01-fundamentals`  
> **Classification:** Widely Accepted PHP Engineering Standard  
> **Status:** Active  

---

## 1. Architectural Philosophy

The SOLID principles are often criticized for encouraging over-engineering and enterprise bloat when applied dogmatically to PHP. In our backend organization, we adopt a **pragmatic, Laravel-idiomatic interpretation of SOLID**.

The goal is not to create an interface for every single class, but to establish **clear boundaries, predictable contracts, and testable domain logic**.

---

## 2. The 5 Principles in Practice

### S — Single Responsibility Principle (SRP)
> *"A class should have one, and only one, reason to change."*

In Laravel, the most common SRP violation is the **"God Controller"** that validates data, performs calculations, creates database records, dispatches emails, and sends SMS notifications all in one method.

#### Practical Responsibility Distribution:
* **Form Request:** Validates raw HTTP input and checks policy authorization.
* **Controller:** Receives validated input, calls the appropriate domain service, and delegates the result to an API Resource.
* **Domain Service:** Executes business rules, transactional mutations, and external gateway calls.
* **API Resource:** Formats internal models into standardized JSON output.
* **Queue Job:** Handles asynchronous, latency-heavy background tasks (e.g. notifications, report compilation).

---

### O — Open/Closed Principle (OCP)
> *"Software entities should be open for extension, but closed for modification."*

When adding support for a new payment gateway or notification provider, you should not be modifying 10 different `if/else` checks across your codebase.

#### Practical Implementation (Strategy Pattern):
Define an interface for third-party operations:

```php
namespace App\Contracts\Payments;

interface PaymentGatewayInterface
{
    public function initiatePayment(Order $order): PaymentResult;
    public function verifyPayment(string $paymentId, string $signature): bool;
}
```

Now, adding `StripeGateway` or `RazorpayGateway` is done by creating a new class implementing `PaymentGatewayInterface` without modifying the core `OrderService`.

---

### L — Liskov Substitution Principle (LSP)
> *"Subtypes must be substitutable for their base types without altering program correctness."*

In Laravel, LSP is critical when defining custom exception hierarchies and abstract base classes.

#### Approved Exception Hierarchy:
All domain exceptions must inherit from a common base `AppException`. A handler catching `AppException` must be able to call `$e->getStatusCode()` without caring which concrete domain exception was thrown:

```php
// Base domain exception
abstract class AppException extends Exception
{
    public function __construct(
        string $message,
        protected int $statusCode = 400,
        protected ?array $errors = null
    ) {
        parent::__construct($message, $statusCode);
    }

    public function getStatusCode(): int { return $this->statusCode; }
    public function getErrors(): ?array { return $this->errors; }
}

// Subtypes safely substitute the base
class OrderAlreadyDeliveredException extends AppException
{
    public function __construct(string $message = 'Order is already delivered and cannot be modified.')
    {
        parent::__construct($message, 422);
    }
}
```

---

### I — Interface Segregation Principle (ISP)
> *"Clients should not be forced to depend on methods they do not use."*

Avoid creating "fat" interfaces containing 20 methods. Break them down into small, cohesive contracts:

```php
// ❌ FORBIDDEN: Fat interface forcing unused implementations
interface OrderRepositoryInterface
{
    public function find(int $id): Order;
    public function create(array $data): Order;
    public function exportCsv(): string;
    public function generatePdfInvoice(Order $order): string;
    public function calculateDailyTaxes(): float;
}

// ✅ APPROVED: Segregated, focused contracts
interface OrderRepositoryInterface
{
    public function find(int $id): Order;
    public function create(array $data): Order;
}

interface OrderInvoiceGeneratorInterface
{
    public function generatePdfInvoice(Order $order): string;
}
```

---

### D — Dependency Inversion Principle (DIP) — Pragmatic Team Standard
> *"High-level modules should not depend on low-level modules; both should depend on abstractions."*

> [!NOTE]
> **Team Decision (Simplicity over Abstraction):**
> In our backend architecture, creating separate interface files (`*Interface.php`) and registering custom service provider bindings for single-provider services is **explicitly deferred (Tier 4: Optional)**. It introduces unnecessary file jumping and friction during daily IDE navigation (`Ctrl + Click`).

#### 1. The Approved Standard: Direct Concrete Constructor Injection
When a service only has one concrete implementation (e.g. `RazorpayService`), inject the concrete class directly into the consumer's constructor. Laravel's Service Container automatically resolves it (auto-wiring) without any boilerplate:

```php
// ✅ APPROVED: Fast 1-click IDE navigation, zero boilerplate
class OrderService
{
    public function __construct(
        protected readonly RazorpayService $razorpayService,
    ) {}

    public function cancel(Order $order): Order
    {
        // 1-Click (Ctrl+Click) directly jumps to RazorpayService implementation!
        $this->razorpayService->refundPayment($order->payment->razorpay_payment_id);
    }
}
```

#### 2. Automated Testing Without Interfaces
You **do not** need interfaces to write isolated tests in Laravel. Laravel and Pest/PHPUnit can mock concrete classes directly:

```php
// In your Pest / PHPUnit test:
$this->mock(RazorpayService::class, function ($mock) {
    $mock->shouldReceive('refundPayment')->once()->andReturn(['status' => 'refunded']);
});

// OrderService now uses the mock automatically without hitting the real SDK!
```

#### 3. When to Introduce Interfaces (Threshold):
Only introduce formal interfaces and container bindings when:
* The application runs **multiple active drivers simultaneously** in production (e.g. Razorpay in India and Stripe in the US).
* A single provider setup should **never** create speculative interfaces ("You Aren't Gonna Need It" — YAGNI).

---

## 3. Team Focus Matrix (SOLI vs. D)

| Principle | Team Adoption | Practical Action |
| :--- | :--- | :--- |
| **S — Single Responsibility** | **Mandatory** | Move HTTP/Auth out of Services; pass `User $user` explicitly; isolate invoicing. |
| **O — Open/Closed** | **Mandatory** | Use strategy/driver patterns for extensible business rules without nested `if/else`. |
| **L — Liskov Substitution** | **Mandatory** | Base `AppException` hierarchy to eliminate HTTP status code 0 crashes. |
| **I — Class Segregation** | **Mandatory** | Break monster "God Services" into focused domain services and single-action classes. |
| **D — Dependency Inversion** | **Pragmatic (Direct)** | Inject concrete classes directly; preserve 1-click IDE navigation; avoid speculative interfaces. |

