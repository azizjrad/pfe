<?php

namespace App\Mail;

use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ResetPasswordMail extends Mailable
{
    use SerializesModels;

    public string $link;
    public string $email;

    public function __construct(string $link, string $email)
    {
        $this->link = $link;
        $this->email = $email;
    }

    public function build()
    {
        return $this->locale('fr')
            ->subject('Réinitialisation de votre mot de passe - Elite Drive')
            ->view('emails.reset')
            ->with([
                'link' => $this->link,
                'email' => $this->email,
                'frontend' => rtrim(config('app.frontend_url', env('FRONTEND_URL', '')) , '/'),
            ]);
    }
}
