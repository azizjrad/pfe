<?php

namespace App\Domain\Enums;

enum AgencyStatus: string
{
    case ACTIVE = 'active';
    case INACTIVE = 'inactive';
    case SUSPENDED = 'suspended';

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
    public static function creatableValues(): array
    {
        return [
            self::ACTIVE->value,
            self::INACTIVE->value,
        ];
    }
}
