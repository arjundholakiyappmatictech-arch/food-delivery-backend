<?php

namespace App\Exceptions\Deliveries;

use Exception;

class DeliveryAlreadyOutForDeliveryException extends Exception
{
    public function __construct()
    {
        return parent::__construct(message: 'Delivery Is Already Out For Delivery', code: 409);
    }
}
