<?php

namespace App\Exceptions\order;

use Exception;

class OrderAlreadyCancelledException extends Exception
{
    public function __construct()
    {
        return parent::__construct(message: 'This order has already been cancelled', code: 409);
    }
}
