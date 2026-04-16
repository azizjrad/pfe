<?php

namespace App\Exceptions\Domain;

class NotFoundException extends DomainException
{
    public function __construct(string $message = 'Resource not found', ?string $errorCode = null)
    {
        parent::__construct($message, 404, $errorCode);
    }
}
