<?php

namespace App\Exceptions\carts;

use Exception;

class RestaurantClosedException extends Exception
{
    public function __construct()
    {
        parent::__construct('This restaurant is currently closed');
    }
}
