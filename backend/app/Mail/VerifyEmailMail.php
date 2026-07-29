<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class VerifyEmailMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $user,
        public string $url
    ) {}

    public function build()
    {
        return $this->subject('Verify Your Email')
            ->view('emails.verify-email')
            ->with([
                'user' => $this->user,
                'url' => $this->url,
            ]);
    }
}
