<?php

namespace App\Exceptions\deliveries;

use Exception;

class DeliveryAgentAlreadyAssignedExceptions extends Exception
{
    public function __construct()
    {
        return parent::__construct(message: 'A delivery agent has already been assigned to this order', code: 409);
    }
}
