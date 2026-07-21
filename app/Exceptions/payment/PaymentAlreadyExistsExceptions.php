<?php

namespace App\Exceptions\Payment;

use Exception;

class PaymentAlreadyExistsExceptions extends Exception
{
    public function __construct()
    {
        return parent::__construct(message: 'Payment Is Already Exists', code: 409);
    }
}
