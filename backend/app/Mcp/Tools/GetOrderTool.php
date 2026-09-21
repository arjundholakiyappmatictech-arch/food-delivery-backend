<?php

namespace App\Mcp\Tools;

use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\JsonSchema\Types\Type;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\ResponseFactory;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Tool;

#[Description('Retrieve the details of a specific Tomato order by ID.')]
class GetOrderTool extends Tool
{
    public function __construct(private OrderService $orderService) {}
    /**
     * Handle the tool request.
     */
    public function handle(Request $request): ResponseFactory
    {
        $orderId = $request->integer('order_id');

        $order = Order::findOrFail($orderId);

        $order = $this->orderService->show($order);

        return Response::structured($order->toArray());
    }

    /**
     * Get the tool's input schema.
     *
     * @return array<string, Type>
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'order_id' => $schema->integer()->description('The ID of the Tomato order to retrieve.')->required(),
        ];
    }
}
