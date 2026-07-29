<?php

namespace App\Exceptions\Address;

use Exception;

class LastAddressCannotBeDeletedException extends Exception
{
    public function __construct()
    {
        parent::__construct(message: 'At least one address keep at saved', code: 409);
    }
}
