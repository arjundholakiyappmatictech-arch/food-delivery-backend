# Service Layer Design & Domain Boundaries

> **The definitive standard for structuring domain services in `app/Services/`, orchestrating transactions, and decoupling business logic from the HTTP lifecycle.**

---

## 1. Architectural Role & Responsibilities

Domain Services represent the business heart of the application. They encapsulate workflows, enforce business invariants, coordinate database mutations, and interact with external systems.

### Core Service Responsibilities
1. **Coordinate Domain Operations:** Manage multi-step business actions (e.g., placing an order, calculating discounts, checking driver availability).
2. **Enforce Transactional Integrity:** Wrap multiple database mutations in atomic `DB::transaction()` blocks.
3. **Isolate Third-Party Latency:** Execute external HTTP calls (Razorpay, Stripe) *before* opening database transactions.
4. **Communicate via Typed Exceptions:** Throw specific, typed domain exceptions when business rules are violated instead of returning error arrays or booleans.

---

## 2. Mandatory Design Rules

### Rule 1: Directory Placement & Architectural Purity
* Domain services live strictly in **`app/Services/`**.
* **Strictly Flat Organization:** Services must be kept flat directly under `app/Services/` (e.g., `app/Services/OrderService.php`, `app/Services/PaymentService.php`, `app/Services/RazorpayService.php`). Do not create nested subdirectories inside `app/Services/`.
* **Zero Artificial Layers:** Do NOT create artificial `DTOs/`, `Repositories/`, or `Actions/` directories unless explicitly requested. Services interact directly with Eloquent models.

### Rule 2: Explicit Actor Injection (Strict Ban on `Auth::user()`)
* **Never call `Auth::user()` or `auth()->user()` inside a domain service.**
* Always inject the acting user explicitly as a method argument:
  ```php
  // Approved: Decoupled and reusable across HTTP, CLI, Queues, and AI MCP tools
  public function store(User $user, array $data): Order
  
  // Forbidden: Hard-coupled to HTTP session / global authentication state
  public function store(array $data): Order // using Auth::user() inside
  ```
* **Why This Matters:** Calling `Auth::user()` inside a service makes it impossible to call that method from an automated cron command, an asynchronous queue job, or an AI MCP agent without hacking or mocking the global HTTP authentication guard.

### Rule 3: Pragmatic Concrete Dependency Injection
* Inject concrete dependencies directly via PHP 8 constructor property promotion:
  ```php
  namespace App\Services;

  class OrderService
  {
      public function __construct(
          protected RazorpayService $razorpayService,
      ) {}
  }
  ```
* **Do NOT introduce single-implementation interfaces** (e.g., `OrderServiceInterface`). Concrete injection preserves 1-click IDE navigation (`Ctrl + Click`) and simplifies codebase navigation.

### Rule 4: The Zero-HTTP-Latency Transaction Boundary
External HTTP requests (e.g., payment gateway captures, SMS notifications) introduce variable network latency (200ms to 3000ms+).

* **The Anti-Pattern:** Opening `DB::transaction()` and executing a third-party HTTP call inside the block. This holds open a database connection and active table/row locks, quickly exhausting the database connection pool under concurrent traffic.
* **The Approved Pattern:** Always execute external network calls **before** or **after** the transaction boundary:

```php
// Step 1: External API pre-flight (Outside DB transaction)
$paymentToken = $this->razorpayService->verifyPayment($data['razorpay_payment_id']);

// Step 2: Atomic DB mutations (Short-lived database transaction)
$order = DB::transaction(function () use ($user, $data, $paymentToken): Order {
    $order = Order::query()->create([
        'user_id' => $user->id,
        'status' => OrderStatus::Placed,
        'total' => $data['total'],
    ]);

    // Persist order items, deduct inventory, clear cart...
    return $order;
});
```

### Rule 5: Transactional Queue Job & Event Dispatching
* When dispatching events or queue jobs inside a transaction, **always use `->afterCommit()`**:
  ```php
  // Approved: Dispatched ONLY after the database successfully commits
  OrderPlaced::dispatch($order)->afterCommit();
  ```
* **Why This Matters:** If a queue job is dispatched without `->afterCommit()`, an eager queue worker might pick up the job and query the database *before* the transaction has completed committing, triggering a fatal `ModelNotFoundException`.

### Rule 6: Strictly Typed Return Contracts
* Services must return strongly typed entities:
  * Eloquent Models (`Order`)
  * Collections (`Collection<int, Order>`)
  * Paginators (`LengthAwarePaginator`)
  * Primitives or Domain DTOs (`bool`, `int`, `array`)
* **Services must NEVER return `JsonResponse` or HTTP responses.** HTTP serialization is the exclusive responsibility of Controllers and API Resources.

---

## 3. Reference Implementation Standard

```php
<?php

declare(strict_types=1);

namespace App\Services;

use App\Events\OrderPlaced;
use App\Exceptions\Carts\EmptyCartException;
use App\Exceptions\Orders\OrderCannotBeCancelledException;
use App\Models\Order;
use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class OrderService
{
    public function __construct(
        protected RazorpayService $razorpayService,
    ) {}

    public function index(User $user): LengthAwarePaginator
    {
        return Order::query()
            ->with(['items.menuItem', 'payment'])
            ->where('user_id', $user->id)
            ->orderByDesc('id')
            ->paginate(15);
    }

    public function store(User $user, array $data): Order
    {
        // 1. Invariant check via domain exception
        $cartItems = $user->cartItems()->with('menuItem')->get();
        if ($cartItems->isEmpty()) {
            throw new EmptyCartException();
        }

        // 2. Pre-transaction external provider interaction
        $payment = $this->razorpayService->verifyPayment($data['payment_id']);

        // 3. Atomic database persistence
        return DB::transaction(function () use ($user, $cartItems, $payment): Order {
            $order = Order::query()->create([
                'user_id' => $user->id,
                'total_amount' => $cartItems->sum('subtotal'),
            ]);

            foreach ($cartItems as $item) {
                $order->items()->create([
                    'menu_item_id' => $item->menu_item_id,
                    'quantity' => $item->quantity,
                    'price' => $item->menuItem->price,
                ]);
            }

            $user->cartItems()->delete();

            // 4. Deferred event dispatching
            OrderPlaced::dispatch($order)->afterCommit();

            return $order;
        });
    }

    public function cancel(User $user, Order $order): Order
    {
        if ($order->user_id !== $user->id || $order->isDelivered()) {
            throw new OrderCannotBeCancelledException();
        }

        $order->update(['status' => 'cancelled']);

        return $order;
    }
}
```

---

## 4. Code Review Rubric for Services

| Check | Passing Criteria | Immediate Rejection Criteria |
| :--- | :--- | :--- |
| **Authentication Coupling** | Accepts `User $user` as explicit parameter | Calling `Auth::user()` or `request()->user()` inside method |
| **HTTP Transport Leakage** | Returns Eloquent models or collections | Returning `response()->json(...)` from service |
| **Transaction Boundary** | Third-party APIs called outside `DB::transaction()` | External HTTP calls executed inside transaction block |
| **Queue Race Conditions** | Event/Job dispatch uses `->afterCommit()` | Dispatching jobs in transactions without commit hook |
| **Interface Bloat** | Direct concrete class injection | Creating empty `FooServiceInterface` with single implementation |
