<?php

namespace App\Exceptions\Mcp;

class OrderNotFoundException extends McpException
{
    public function __construct(int $orderId)
    {
        parent::__construct("Order {$orderId} was not found.");
    }
}
