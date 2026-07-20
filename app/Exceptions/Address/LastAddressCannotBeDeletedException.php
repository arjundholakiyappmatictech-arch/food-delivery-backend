<?php

namespace App\Exceptions\Address;

use Exception;

class LastAddressCannotBeDeletedException extends Exception
{
    public function __construct()
    {
        parent::__construct('At least one address keep at saved');
    }
}
