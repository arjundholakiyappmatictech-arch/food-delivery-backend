<?php

namespace App\Exceptions\Deliveries;

use Exception;

class PaymentNotFoundException extends Exception
{
    public function __construct()
    {
        parent::__construct(message: 'Please complete the payment before delivery', code: 404);
    }
}
