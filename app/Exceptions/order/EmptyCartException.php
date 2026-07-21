<?php

namespace App\Exceptions\Order;

use Exception;

class EmptyCartException extends Exception
{
    public function __construct()
    {
        return parent::__construct(message: 'Cart Is Empty', code: 400);
    }
}
