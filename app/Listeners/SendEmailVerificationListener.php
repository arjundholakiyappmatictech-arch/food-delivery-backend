<?php

namespace App\Listeners;

use App\Events\UserRegistered;
use App\Jobs\SendEmailVerificationJob;;

class SendEmailVerificationListener
{
    public function handle(UserRegistered $event): void
    {
        /* SendEmailVerificationJob::dispatch($event->user); */
    }
}
