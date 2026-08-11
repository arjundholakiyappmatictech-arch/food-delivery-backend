<?php

namespace App\Listeners;

use App\Events\OrderPlaced;
use App\Jobs\AssignDeliveryJob;

class AssignDeliveryListener
{
    public function handle(OrderPlaced $event): void
    {
         AssignDeliveryJob::dispatch($event->order->id)
            ->delay(now()->addSeconds(10));
    }
}
