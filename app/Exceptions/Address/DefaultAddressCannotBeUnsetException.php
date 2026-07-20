<?php

namespace App\Exceptions\Address;

use Exception;

class DefaultAddressCannotBeUnsetException extends Exception
{
    public function __construct()
    {
        return parent::__construct(message: 'you cannot change the status of is_default false', code: 409);
    }
}
