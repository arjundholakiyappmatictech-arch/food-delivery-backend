<?php

namespace App\Exceptions\deliveries;

use Exception;

class AssignOnlyPlacedOrder extends Exception
{
    public function __construct()
    {
        return parent::__construct(message: 'A delivery agent can only be assigned to a placed order', code: 409);
    }
}
