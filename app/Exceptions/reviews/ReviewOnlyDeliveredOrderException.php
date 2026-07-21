<?php

namespace App\Exceptions\reviews;

use Exception;

class ReviewOnlyDeliveredOrderException extends Exception
{
    public function __construct()
    {
        return parent::__construct(message: 'You can review only delivered order', code: 409);
    }
}
