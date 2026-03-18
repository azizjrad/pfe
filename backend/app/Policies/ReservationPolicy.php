<?php

namespace App\Policies;

use App\Models\Reservation;
use App\Models\User;

class ReservationPolicy
{
    public function view(User $user, Reservation $reservation): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        if ($user->isClient()) {
            return $reservation->user_id === $user->id;
        }

        if ($user->isAgencyAdmin()) {
            return $reservation->vehicle?->agency_id === $user->agency_id;
        }

        return false;
    }

    public function update(User $user, Reservation $reservation): bool
    {
        return $user->isClient() && $reservation->user_id === $user->id;
    }

    public function cancel(User $user, Reservation $reservation): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        if ($user->isClient()) {
            return $reservation->user_id === $user->id;
        }

        if ($user->isAgencyAdmin()) {
            return $reservation->vehicle?->agency_id === $user->agency_id;
        }

        return false;
    }

    public function updateStatus(User $user, Reservation $reservation): bool
    {
        return $user->isAgencyAdmin() && $reservation->vehicle?->agency_id === $user->agency_id;
    }

    public function pickup(User $user, Reservation $reservation): bool
    {
        return $this->updateStatus($user, $reservation);
    }

    public function return(User $user, Reservation $reservation): bool
    {
        return $this->updateStatus($user, $reservation);
    }
}
