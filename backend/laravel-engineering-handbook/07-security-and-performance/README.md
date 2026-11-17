# Module 07: Security & Performance Invariants

> Architectural invariants for cryptographic webhook verification, transaction-safe cache invalidation, and decoupled authentication boundaries.

---

## 1. Company Invariants vs. Laravel Boost

Generic security controls (parameter binding, mass-assignment `$fillable`, rate limiting, environment secrets) and caching operations (`Cache::remember()`, `Cache::flexible()`) are natively documented in **Laravel Boost** (`.agents/skills/laravel-best-practices/rules/`). Our company enforces 3 strict invariants:

| Category | Mandatory Company Rule | Prohibited Anti-Pattern |
| :--- | :--- | :--- |
| **Webhook Security** | Cryptographic verification via `hash_equals()` / HMAC SHA256 before processing payload; enforce payload idempotency. | Processing webhook payloads without cryptographic signature checks; trusting unverified status keys. |
| **Cache Invalidation** | All cache tag / key invalidations inside transactions must execute via `->afterCommit()` hooks. | Flushing or updating cache before or during uncommitted transactions (risks stale cache on DB rollback). |
| **Auth Decoupling** | Authenticate via Sanctum middleware; inject acting entity as `User $user` from Controller into Domain Services. | Calling `Auth::user()` or reading auth tokens inside domain services or background jobs. |

---

## 2. Invariant Signatures

### A. Webhook Cryptographic Verification & Idempotency
Webhook handlers (`POST /api/v1/{gateway}/webhooks`) must strictly verify provider signatures and prevent duplicate execution:

```php
public function handle(Request $request): JsonResponse
{
    $signature = $request->header('X-Razorpay-Signature') ?? '';
    $expected = hash_hmac('sha256', $request->getContent(), config('services.razorpay.webhook_secret'));

    if (! hash_equals($expected, $signature)) {
        return $this->errorResponse('Invalid signature', 400);
    }

    $this->paymentService->handleWebhook($request->all());

    return $this->successResponse('Webhook processed successfully', null, 200);
}
```

### B. Transaction-Safe Cache Invalidation (`afterCommit`)
Never clear or mutate cached entries inside an uncommitted database transaction:

```php
DB::transaction(function () use ($restaurant, $data): void {
    $restaurant->update($data);

    // Invalidate cache ONLY after the transaction commits successfully
    DB::afterCommit(function () use ($restaurant): void {
        Cache::forget("restaurants:{$restaurant->id}:menu");
    });
});
```
