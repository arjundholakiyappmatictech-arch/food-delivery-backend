<?php

namespace App\Exceptions\carts;

use Exception;

class MenuItemUnavailableException extends Exception
{
    public function __construct()
    {
        parent::__construct('This menu item is currently unavailable right now');
    }
}
