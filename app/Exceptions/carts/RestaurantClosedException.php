<?php

namespace App\Exceptions\carts;

use Exception;

class RestaurantClosedException extends Exception
{
    public function __construct()
    {
        parent::__construct(message: 'This restaurant is currently closed', code: 409);
    }
}
