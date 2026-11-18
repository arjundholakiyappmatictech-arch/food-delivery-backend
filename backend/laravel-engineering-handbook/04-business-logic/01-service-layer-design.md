# Service Layer Design & Domain Boundaries

---

## 1. Architectural Philosophy

Domain Services represent the business heart of the application. They encapsulate workflows, enforce business invariants, coordinate database mutations, and interact with external systems.

Services must remain completely decoupled from HTTP transport state so they are callable interchangeably from **Controllers, Console commands, Queue jobs, and AI MCP tools**.

---

## 2. Mandatory Service Design Rules

### Rule 1: Flat Placement in `app/Services/`
* Domain services reside strictly as a flat, single-level directory directly under `app/Services/` (e.g., `OrderService.php`, `PaymentService.php`, `RazorpayService.php`).
* **Zero Artificial Layers:** Do NOT create artificial `DTOs/`, `Repositories/`, or `Actions/` directories. Services interact directly with Eloquent models.

### Rule 2: Explicit Actor Context (Strict Ban on `Auth::user()`)
* **Never call `Auth::user()`, `auth()->user()`, or `request()` inside a domain service.**
* Always inject the acting user explicitly as a method argument:
  ```php
  // ✅ Approved: Decoupled and reusable across HTTP, CLI, Queues, and AI MCP tools
  public function store(User $user, array $data): Order
  ```
* Bypasses the need to mock HTTP authentication guards when invoking services from queue workers, console commands, or AI MCP tools.

### Rule 3: Services Are Transaction-Free (Managed at Controller Level)
* Database transactions (`DB::beginTransaction()`, `DB::commit()`, `DB::rollBack()`) are managed exclusively at the **Controller level**.
* Services remain strictly focused on business logic, calculations, entity coordination, and persistence without wrapping code in `DB::transaction()`.

### Rule 4: External API Calls Outside Database Transactions
* External HTTP requests (e.g. Razorpay, Stripe, SMS gateways) introduce variable network latency (200ms–3000ms+).
* **The Rule:** Always execute external network calls **before / outside** database transactions.
* Holding open a database transaction while waiting for third-party network I/O exhausts database connection pools and creates table lock contention under traffic.

### Rule 5: Concurrency Control via `lockForUpdate()`
* Inside domain services, whenever reading data that is about to be mutated and subject to race conditions (e.g. inventory deductions, wallet balances, booking slots), apply pessimistic locking via `->lockForUpdate()`.
* Prevents concurrent requests from overselling stock or double-spending balances.

### Rule 6: Transactional Queue Job & Event Dispatching (`->afterCommit()`)
* Always dispatch queue jobs and domain events using `->afterCommit()` (or after `DB::commit()`):
  ```php
  OrderPlaced::dispatch($order)->afterCommit();
  ```
* Prevents race conditions where eager queue workers query the database before the database transaction has finished committing.

### Rule 7: Strongly Typed Return Contracts
* Services must return strongly typed entities: Eloquent Models (`Order`), Collections (`Collection<int, Order>`), or Paginators (`LengthAwarePaginator`).
* **Services must NEVER return `JsonResponse` or HTTP responses.** HTTP serialization belongs exclusively to Controllers and API Resources.

---

## 3. Approved Service Implementation Signature

Aligned with [GUIDELINES.md Section 3D](../GUIDELINES.md#d-service-and-transaction-safety-boundaries):

```php
namespace App\Services;

use App\Events\OrderPlaced;
use App\Exceptions\Carts\EmptyCartException;
use App\Exceptions\Orders\OutOfStockException;
use App\Models\MenuItem;
use App\Models\Order;
use App\Models\User;

class OrderService
{
    public function __construct(
        protected readonly RazorpayService $razorpayService,
    ) {}

    public function store(User $user, array $data): Order
    {
        // 1. Guard check via typed domain exception
        if ($user->cartItems()->doesntExist()) {
            throw new EmptyCartException();
        }

        // 2. Pre-transaction external API call (zero HTTP latency inside DB transaction)
        $payment = $this->razorpayService->verifyPayment($data['payment_id']);

        // 3. Concurrency Control: Lock records vulnerable to race conditions
        $menuItem = MenuItem::where('id', $data['menu_item_id'])
            ->lockForUpdate()
            ->firstOrFail();

        if ($menuItem->stock < $data['quantity']) {
            throw new OutOfStockException('Item is out of stock.');
        }

        $menuItem->decrement('stock', $data['quantity']);

        // 4. Persistence relying on database constraints (transactions managed at controller)
        $order = Order::create([
            'user_id' => $user->id,
            'restaurant_id' => $data['restaurant_id'],
            'total' => $menuItem->price * $data['quantity'],
            'payment_id' => $payment['id'],
        ]);

        // 5. Queue dispatch strictly after commit
        OrderPlaced::dispatch($order)->afterCommit();

        return $order;
    }
}
```

---

## 4. Code Review Rubric for Services

| Check | Approved Standard | Forbidden Anti-Pattern |
| :--- | :--- | :--- |
| **Auth Coupling** | Explicit `User $user` parameter | Calling `Auth::user()` or `request()->user()` |
| **HTTP Leakage** | Returns Eloquent models or collections | Returning `response()->json()` or `JsonResponse` |
| **Transaction Boundary** | Managed at controller level; services remain transaction-free; external APIs called outside transactions | Managing transactions inside services; calling external APIs inside transactions |
| **Concurrency Control** | Applies `lockForUpdate()` on race-sensitive rows; relies on DB constraints | Unlocked queries for stock/balances; relying only on application-level checks |
| **Queue Race Condition** | Dispatches with `->afterCommit()` | Dispatching jobs in transactions without commit hook |
| **Architecture** | Flat `app/Services/` with direct concrete injection | Nesting service folders; creating `Repositories/`, `DTOs/`, or `Actions/` |
