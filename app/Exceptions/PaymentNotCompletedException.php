<?php

namespace App\Exceptions;

use Exception;

class PaymentNotCompletedException extends Exception
{
    public function __construct()
    {
        return parent::__construct(message: 'payment not completed', code: 409);
    }
}
