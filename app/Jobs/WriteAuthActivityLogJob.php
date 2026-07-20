<?php

namespace App\Jobs;

use App\Models\User;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class WriteAuthActivityLogJob implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public User $user,
        public string $action
    ) {}

    public function handle(): void
    {
        Log::info('Auth activity logged', [
            'user_id' => $this->user->id,
            'email' => $this->user->email,
            'action' => $this->action,
            'time' => now()->toDateTimeString(),
        ]);
    }
}
