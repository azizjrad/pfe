<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Reservation;
use App\Models\User;
use App\Domain\Enums\ReservationStatus;
use App\Services\ReservationService;
use Illuminate\Log\LogManager;

class AutoCancelPendingReservations extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'reservations:auto-cancel';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Automatically cancel pending reservations older than 24 hours';

    public function handle(ReservationService $reservationService, LogManager $log)
    {
        $threshold = now()->subHours(24);

        $this->info('Checking for pending reservations older than 24 hours...');

        $reservations = Reservation::where('status', ReservationStatus::PENDING->value)
            ->where('created_at', '<=', $threshold)
            ->get();

        $count = $reservations->count();
        $this->info("Found {$count} reservations to cancel");

        // Prefer using a super admin context so ReservationService can run usual flows
        $systemUser = User::where('role', 'super_admin')->first();

        foreach ($reservations as $reservation) {
            try {
                if ($systemUser) {
                    $reservationService->cancel($reservation, $systemUser, ['reason' => 'auto_cancel_no_confirmation']);
                    $this->info("Cancelled reservation #{$reservation->id}");
                    $log->info('Auto-cancelled reservation', ['reservation_id' => $reservation->id]);
                } else {
                    // Fallback: mark cancelled directly
                    $reservation->update(['status' => ReservationStatus::CANCELLED->value]);
                    $this->info("Cancelled reservation #{$reservation->id} (no super_admin found)");
                    $log->warning('Auto-cancelled reservation without super_admin', ['reservation_id' => $reservation->id]);
                }
            } catch (\Throwable $e) {
                $this->error("Failed to cancel reservation #{$reservation->id}: {$e->getMessage()}");
                $log->error('Failed to auto-cancel reservation', ['reservation_id' => $reservation->id, 'error' => $e->getMessage()]);
            }
        }

        $this->info('Auto-cancel process completed.');

        return 0;
    }
}
