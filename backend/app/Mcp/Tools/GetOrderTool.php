<?php

namespace App\Mcp\Tools;

use App\Exceptions\Mcp\McpException;
use App\Exceptions\Mcp\OrderNotFoundException;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\ResponseFactory;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Tool;

#[Description('Retrieve the details of a specific Tomato order by ID.')]
class GetOrderTool extends Tool
{
    public function __construct(private OrderService $orderService) {}

    public function handle(Request $request): ResponseFactory|Response
    {
        try {
            $orderId = $request->integer('order_id');

            $order = Order::find($orderId);

            if (!$order) {
                throw new OrderNotFoundException($orderId);
            }

            $order = $this->orderService->show($order);

            return Response::structured(new OrderResource($order)->resolve());
        } catch (McpException $exception) {
            return Response::error($exception->getMessage());
        }
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'order_id' => $schema->integer()->description('The ID of the Tomato order to retrieve.')->required(),
        ];
    }
}
