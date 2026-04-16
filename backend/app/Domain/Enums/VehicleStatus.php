<?php

namespace App\Domain\Enums;

enum VehicleStatus: string
{
    case AVAILABLE = 'available';
    case RESERVED = 'reserved';
    case IN_USE = 'in_use';
    case RETURNED = 'returned';
    case MAINTENANCE = 'maintenance';
    case RENTED = 'rented';
    case UNAVAILABLE = 'unavailable';

    /**
     * @return array<int, string>
     */
    public static function values(): array
    {
        return array_map(static fn (self $status) => $status->value, self::cases());
    }
}
