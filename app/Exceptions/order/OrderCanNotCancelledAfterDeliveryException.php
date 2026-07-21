<?php

namespace App\Exceptions\Order;

use Exception;

class OrderCanNotCancelledAfterDeliveryException extends Exception
{
    public function __construct()
    {
        return parent::__construct(
            message: 'This order cannot be cancelled because a delivery agent has already been assigned',
            code: 409,
        );
    }
}
