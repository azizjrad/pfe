<?php

namespace App\Exceptions\Domain;

class ConflictException extends DomainException
{
    public function __construct(string $message = 'Resource conflict', ?string $errorCode = null)
    {
        parent::__construct($message, 409, $errorCode);
    }
}
