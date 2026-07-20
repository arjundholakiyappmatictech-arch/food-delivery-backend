<?php

namespace App\Exceptions\Address;

use Exception;

class AddressLimitExceededException extends Exception
{
    public function __construct(int $limit)
    {
        parent::__construct(message: "You can save a maximum of {$limit} addresses", code: 422);
    }
}
