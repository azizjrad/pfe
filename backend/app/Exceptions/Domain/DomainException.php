<?php

namespace App\Exceptions\Domain;

use RuntimeException;
use Throwable;

class DomainException extends RuntimeException
{
    private int $status;
    private ?string $errorCode;

    public function __construct(
        string $message,
        int $status = 400,
        ?string $errorCode = null,
        ?Throwable $previous = null
    ) {
        parent::__construct($message, 0, $previous);

        $this->status = $status;
        $this->errorCode = $errorCode;
    }

    public function getStatus(): int
    {
        return $this->status;
    }

    public function getErrorCode(): ?string
    {
        return $this->errorCode;
    }
}
