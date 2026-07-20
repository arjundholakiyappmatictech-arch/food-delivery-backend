<?php

namespace App\Exceptions\MenuItem;

use Exception;
use Throwable;
use Override;

class DuplicateMenuItemException extends Exception
{
    public function __construct()
    {
        parent::__construct('A MenuItem with this name already exists in the selected menu');
    }
}
