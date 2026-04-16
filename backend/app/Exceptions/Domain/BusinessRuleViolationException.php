<?php

namespace App\Exceptions\Domain;

class BusinessRuleViolationException extends DomainException
{
    public function __construct(string $message = 'Business rule violated', int $status = 400, ?string $errorCode = null)
    {
        parent::__construct($message, $status, $errorCode);
    }
}
