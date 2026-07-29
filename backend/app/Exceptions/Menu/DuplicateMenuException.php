<?php

namespace App\Exceptions\Menu;

use Exception;

class DuplicateMenuException extends Exception
{
    public function __construct()
    {
        parent::__construct(message: 'A menu with this name already exists for the selected restaurants', code: 409);
    }
}
