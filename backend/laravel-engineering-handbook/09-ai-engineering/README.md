# Module 09: AI Engineering & MCP Standards

> Architectural standards for building Model Context Protocol (MCP) tools, resources, and servers within our decoupled backend architecture.

---

## 1. Company Invariants vs. Laravel Boost

Generic MCP development (artisan generators `make:mcp-*`, `routes/ai.php` registration, and JSON Schema syntax) is natively documented in **Laravel Boost** (`.agents/skills/mcp-development/`). Our company enforces 3 strict invariants:

| Category | Mandatory Company Rule | Prohibited Anti-Pattern |
| :--- | :--- | :--- |
| **Service Delegation** | MCP Tools act as ultra-thin adaptors: inject and delegate all operations to flat `app/Services/` classes. | Executing business logic, raw SQL, or direct Eloquent mutations inside `Tool::handle()`. |
| **Actor Context Injection** | Identify or receive the target actor and explicitly pass `User $user` to domain services. | Calling `Auth::user()` or bypassing domain ownership checks inside AI tools. |
| **Exception Shielding** | Catch typed domain exceptions and return safe client messages via `Response::error()`. | Leaking database `QueryException` details, SQL bindings, or stack traces into LLM context. |

---

## 2. Canonical MCP Tool Implementation

Every MCP tool lives in `app/Mcp/Tools/`, validates schema, delegates to a domain service, and shields exceptions:

```php
namespace App\Mcp\Tools;

use App\Exceptions\Mcp\McpException;
use App\Http\Resources\Mcp\OrderResource;
use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\ResponseFactory;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Tool;

#[Description('Retrieve order details by ID for the acting user context.')]
class GetOrderTool extends Tool
{
    public function __construct(private OrderService $orderService) {}

    public function handle(Request $request): ResponseFactory|Response
    {
        try {
            $order = Order::findOrFail($request->integer('order_id'));
            $result = $this->orderService->show($order);

            return Response::structured(new OrderResource($result)->resolve());
        } catch (McpException $e) {
            return Response::error($e->getMessage());
        } catch (\Throwable $e) {
            return Response::error('Unable to retrieve order details.');
        }
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'order_id' => $schema->integer()->description('The ID of the order to retrieve.')->required(),
        ];
    }
}
```
