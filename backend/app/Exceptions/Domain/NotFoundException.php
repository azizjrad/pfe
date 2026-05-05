<?php

namespace App\Exceptions\Domain;

class NotFoundException extends DomainException
{
    public function __construct(?string $message = null, ?string $errorCode = null)
    {
        $message = $message ?? __('messages.resource_not_found');
        parent::__construct($message, 404, $errorCode);
    }
}
