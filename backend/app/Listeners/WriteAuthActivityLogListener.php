<?php

namespace App\Listeners;

use App\Events\UserLoggedIn;
use App\Events\UserRegistered;
use App\Jobs\WriteAuthActivityLogJob;

class WriteAuthActivityLogListener
{
    public function handle(UserRegistered|UserLoggedIn $event): void
    {
        $action = $event instanceof UserRegistered
            ? 'registered'
            : 'logged_in';

        WriteAuthActivityLogJob::dispatch($event->user, $action);
    }
}
