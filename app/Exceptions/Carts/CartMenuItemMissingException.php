<?php

namespace App\Exceptions\Carts;

use Exception;

class CartMenuItemMissingException extends Exception
{
    public function __construct()
    {
        parent::__construct(message: 'Menu-Item is missing', code: 409);
    }
}
