<?php

namespace App\Jobs;

use App\Mail\VerifyEmailMail;
use App\Models\User;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\URL;

class SendEmailVerificationJob implements ShouldQueue
{
    use Queueable;

    public function __construct(public User $user) {}

    public function handle(): void
    {
        $url = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(60),
            [
                'id' => $this->user->id,
                'hash' => sha1($this->user->email),
            ]
        );
    }
}
