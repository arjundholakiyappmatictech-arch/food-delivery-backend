<?php

namespace App\Exceptions\Reviews;

use Exception;

class AlreadyReviewException extends Exception
{
    public function __construct()
    {
        return parent::__construct(message: 'This Order Is Already Reviewed', code: 409);
    }
}
