<?php

namespace App\Exceptions\Mcp;

class RestaurantNotFoundException extends McpException
{
    public function __construct(int $restaurantId)
    {
        parent::__construct("Restaurant {$restaurantId} was not found.");
    }
}
