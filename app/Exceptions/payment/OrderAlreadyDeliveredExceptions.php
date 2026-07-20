<?php

namespace App\Exceptions\payment;

use Exception;

class OrderAlreadyDeliveredExceptions extends Exception
{
    public function __construct()
    {
        return parent::__construct(message: 'Order is alredy has been delivered', code: 409);
    }
}
