<?php

namespace App\Exceptions\Order;

use Exception;

class OrderCannotBeCancelledException extends Exception
{
    public function __construct()
    {
        parent::__construct(message: 'This order cannot be cancelled now', code: 409);
    }
}
