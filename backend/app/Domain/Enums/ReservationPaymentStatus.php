<?php

namespace App\Domain\Enums;

enum ReservationPaymentStatus: string
{
    case UNPAID = 'unpaid';
    case PAID = 'paid';
    case OVERDUE = 'overdue';

    /**
     * @return array<int, string>
     */
    public static function values(): array
    {
        return array_map(static fn (self $status) => $status->value, self::cases());
    }
}
