<?php

namespace App\Mail;

use App\Models\ContactMessage;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ContactReplyMail extends Mailable
{
    use SerializesModels;

    public ContactMessage $contactMessage;
    public string $reply;
    public string $companyName;
    public string $adminEmail;

    public function __construct(ContactMessage $contactMessage, string $reply)
    {
        $this->contactMessage = $contactMessage;
        $this->reply = $reply;
        $this->companyName = 'Elite Drive';
        $this->adminEmail = 'support@elitedrive.tn';
    }

    public function build()
    {
        return $this->locale('fr')
            ->from($this->adminEmail, $this->companyName)
            ->subject('Reponse a votre message - ' . $this->companyName)
            ->view('emails.contact-reply')
            ->with([
                'contactMessage' => $this->contactMessage,
                'reply' => $this->reply,
                'companyName' => $this->companyName,
                'adminEmail' => $this->adminEmail,
                'frontend' => rtrim(config('app.frontend_url', env('FRONTEND_URL', '')), '/'),
            ]);
    }
}
