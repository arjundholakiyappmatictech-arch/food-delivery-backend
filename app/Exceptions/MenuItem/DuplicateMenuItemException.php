<?php

namespace App\Exceptions\MenuItem;

use Exception;

class DuplicateMenuItemException extends Exception
{
    public function __construct()
    {
        parent::__construct(message: 'A MenuItem with this name already exists in the selected menu', code: 409);
    }
}
