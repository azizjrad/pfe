<?php

namespace App\Mail;

use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ConfirmAccountMail extends Mailable
{
    use SerializesModels;

    public string $link;
    public ?string $role;
    public ?string $name;

    public function __construct(string $link, ?string $role = null, ?string $name = null)
    {
        $this->link = $link;
        $this->role = $role;
        $this->name = $name;
    }

    public function build()
    {
        return $this->locale('fr')
            ->subject('Confirmez votre compte - Elite Drive')
            ->view('emails.confirmation')
            ->with([
                'link' => $this->link,
                'role' => $this->role,
                'name' => $this->name,
                'frontend' => rtrim(config('app.frontend_url', env('FRONTEND_URL', '')) , '/'),
            ]);
    }
}
