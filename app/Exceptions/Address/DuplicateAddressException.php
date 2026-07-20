<?php

namespace App\Exceptions\Address;

use Exception;

class DuplicateAddressException extends Exception
{
    public function __construct()
    {
        parent::__construct('This address is already exist');
    }
}
