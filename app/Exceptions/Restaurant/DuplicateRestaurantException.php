<?php

namespace App\Exceptions\Restaurant;

use Exception;

class DuplicateRestaurantException extends Exception
{
    public function __construct(int $radiusInMeters)
    {
        parent::__construct(
            "A restaurant with the same name already exists within {$radiusInMeters} metres of this location",
        );
    }
}
