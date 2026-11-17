# Module 08: Testing & Quality Assurance Invariants

> Architectural invariants for Pest feature test design, strict 2-verb HTTP assertions, and ADR-001 envelope verification.

---

## 1. Company Invariants vs. Laravel Boost

Generic testing concepts (AAA structure, model factories, `expect()` chains, and `Queue::fake()`) are natively documented in **Laravel Boost** (`.agents/skills/testing-best-practices/`). Our company enforces 3 strict invariants:

| Category | Mandatory Company Rule | Prohibited Anti-Pattern |
| :--- | :--- | :--- |
| **ADR-001 Envelope Assertions** | Every endpoint test must verify the ADR-001 JSON structure (`is_error: bool`, `message: string`, `data: mixed|null`). Assert `data: null` on error. | Asserting generic unshaped JSON; allowing `"data": []` on failures. |
| **Strict 2-Verb Testing** | State mutations must only be executed via `postJson()` to explicit suffixes (`/store`, `/{id}/update`, `/{id}/destroy`, `/{id}/action`). | Calling `putJson()`, `patchJson()`, or `deleteJson()` in tests. |
| **External-Only Mocking** | Domain services, database transactions, and Eloquent models must run real against the test database. Only third-party external HTTP APIs (e.g. Razorpay, Stripe) are mocked via `Http::fake()`. | Mocking internal domain services or repositories in feature tests. |

---

## 2. Canonical Pest Feature Test Pattern

Every feature test tests the full HTTP $\rightarrow$ Controller $\rightarrow$ Service $\rightarrow$ DB $\rightarrow$ Resource cycle:

```php
use App\Models\User;
use Illuminate\Support\Facades\Http;

test('authenticated user can create order with external payment pre-flight', function (): void {
    // 1. Arrange: Setup actor and fake external third-party HTTP gateway only
    $user = User::factory()->create();
    Http::fake([
        'https://api.razorpay.com/*' => Http::response(['id' => 'order_fake_123', 'status' => 'created'], 200),
    ]);

    // 2. Act: Strict 2-verb POST mutation with authenticated Sanctum context
    $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/orders/store', [
        'restaurant_id' => 1,
        'items' => [['menu_item_id' => 1, 'quantity' => 2]],
    ]);

    // 3. Assert: Strict ADR-001 envelope structure and database persistence
    $response->assertStatus(201)->assertJson([
        'is_error' => false,
        'message' => 'Order created successfully',
    ])->assertJsonStructure([
        'is_error',
        'message',
        'data' => ['id', 'order_number', 'status', 'total_amount', 'created_at'],
    ]);

    $this->assertDatabaseHas('orders', [
        'user_id' => $user->id,
        'status' => 'pending',
    ]);
});
```
