<?php

namespace App\Domain\Enums;

enum ReportStatus: string
{
    case OPEN = 'open';
    case INVESTIGATING = 'investigating';
    case RESOLVED = 'resolved';
    case DISMISSED = 'dismissed';

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
    public static function resolutionValues(): array
    {
        return [
            self::RESOLVED->value,
            self::DISMISSED->value,
        ];
    }

    /**
     * @return array<int, string>
     */
    public static function responseValues(): array
    {
        return [
            self::INVESTIGATING->value,
            self::RESOLVED->value,
            self::DISMISSED->value,
        ];
    }
}
