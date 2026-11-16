# Pragmatic SOLID Principles in Laravel

---

## 1. Architectural Philosophy

We adopt a **pragmatic, Laravel-idiomatic interpretation of SOLID**. The goal is not speculative enterprise abstraction, but **clear boundaries, predictable contracts, and testable domain logic**.

---

## 2. The 5 Principles in Practice

### S — Single Responsibility Principle (SRP)
A class should have one, and only one, reason to change. Prevent "God Controllers" with our strict responsibility distribution:

* **Form Request:** Validates raw HTTP input and checks policy authorization.
* **Controller:** Receives validated input, calls the domain service, and delegates to an API Resource.
* **Domain Service:** Executes business rules, transactional mutations, and external gateway calls.
* **API Resource:** Formats internal models into standardized JSON output.
* **Queue Job:** Handles asynchronous, latency-heavy background tasks (e.g. notifications, report compilation).

---

### O — Open/Closed Principle (OCP)
Entities should be open for extension, but closed for modification. Use strategy interfaces for multi-provider external operations:

```php
namespace App\Contracts\Payments;

interface PaymentGatewayInterface
{
    public function initiatePayment(Order $order): PaymentResult;
    public function verifyPayment(string $paymentId, string $signature): bool;
}
```
Adding `StripeGateway` or `RazorpayGateway` implements `PaymentGatewayInterface` without altering core service workflows.

---

### L — Liskov Substitution Principle (LSP)
Subtypes must be substitutable for their base types without altering program correctness.

#### Approved Exception Hierarchy:
All domain exceptions extend PHP's built-in `Exception`, passing message and HTTP status code directly to `parent::__construct(message: ..., code: ...)`. A controller catching `Throwable $e` safely extracts `$e->getCode()` and `$e->getMessage()`:

```php
namespace App\Exceptions\Order;

use Exception;

class EmptyCartException extends Exception
{
    public function __construct(string $message = 'Cart Is Empty')
    {
        parent::__construct(message: $message, code: 400);
    }
}
```

---

### I — Interface Segregation Principle (ISP)
Clients should never be forced to depend on methods they do not use. Prefer small, cohesive contracts over fat interfaces:

```php
// ❌ FORBIDDEN: Fat interface forcing unused implementations
interface ReportGeneratorInterface
{
    public function generatePdf(Order $order): string;
    public function exportCsv(Collection $orders): string;
    public function sendEmailReport(string $recipient): void;
}

// ✅ APPROVED: Segregated, cohesive contracts
interface PdfReportGeneratorInterface
{
    public function generatePdf(Order $order): string;
}

interface CsvExporterInterface
{
    public function exportCsv(Collection $orders): string;
}
```

---

### D — Dependency Inversion Principle (DIP) — Optional / Pragmatic Standard
High-level modules should not depend on low-level modules; both should depend on abstractions.

> [!NOTE]
> **Status: Optional (Deferred by Default):**
> Creating formal interface abstractions (`*Interface.php`) and container bindings is **strictly optional**. For single-provider services, do not create speculative interfaces—inject concrete classes directly to preserve 1-click IDE navigation (`Ctrl + Click`). Formal interfaces are only introduced when multiple production drivers exist simultaneously.

#### 1. Direct Concrete Constructor Injection
When a service has one concrete implementation (e.g. `RazorpayService`), inject it directly into the constructor. Laravel auto-wires it with zero boilerplate:

```php
class OrderService
{
    public function __construct(
        protected readonly RazorpayService $razorpayService,
    ) {}

    public function cancel(Order $order): Order
    {
        // 1-Click (Ctrl+Click) directly jumps to RazorpayService implementation
        $this->razorpayService->refundPayment($order->payment->razorpay_payment_id);
    }
}
```

#### 2. Isolated Testing Without Interfaces
Laravel and Pest mock concrete classes directly without requiring interface contracts:

```php
$this->mock(RazorpayService::class, function ($mock) {
    $mock->shouldReceive('refundPayment')->once()->andReturn(['status' => 'refunded']);
});
```

#### 3. Threshold for Introducing Interfaces:
Only introduce formal interfaces and container bindings when:
* The application runs **multiple active drivers simultaneously** in production (e.g., Razorpay for domestic payments, Stripe for international payments).
* Never create speculative single-implementation interfaces (YAGNI).
