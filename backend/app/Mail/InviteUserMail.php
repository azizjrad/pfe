<?php

namespace App\Mail;

use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class InviteUserMail extends Mailable
{
    use SerializesModels;

    public string $link;
    public ?string $name;
    public ?string $role;

    public function __construct(string $link, ?string $name = null, ?string $role = null)
    {
        $this->link = $link;
        $this->name = $name;
        $this->role = $role;
    }

    public function build()
    {
        return $this->locale('fr')
            ->subject("Complétez votre compte Elite Drive")
            ->view('emails.invite')
            ->with([
                'link' => $this->link,
                'name' => $this->name,
                'role' => $this->role,
                'frontend' => rtrim(config('app.frontend_url', env('FRONTEND_URL', '')) , '/'),
            ]);
    }
}
