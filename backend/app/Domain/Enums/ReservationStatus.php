<?php

namespace App\Domain\Enums;

enum ReservationStatus: string
{
    case PENDING = 'pending';
    case CONFIRMED = 'confirmed';
    case ONGOING = 'ongoing';
    case COMPLETED = 'completed';
    case CANCELLED = 'cancelled';

    /**
     * @return array<int, string>
     */
    public static function values(): array
    {
        return array_map(static fn (self $status) => $status->value, self::cases());
    }

    /**
     * @return array<int, string>
     */
    public static function activeValues(): array
    {
        return [
            self::PENDING->value,
            self::CONFIRMED->value,
            self::ONGOING->value,
        ];
    }

    /**
     * @return array<int, string>
     */
    public static function immutableValues(): array
    {
        return [
            self::COMPLETED->value,
            self::CANCELLED->value,
        ];
    }
}
