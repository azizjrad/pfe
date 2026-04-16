<?php

namespace App\Policies;

use App\Domain\Enums\VehicleStatus;
use App\Models\User;
use App\Models\Vehicle;

class VehiclePolicy
{
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['super_admin', 'agency_admin', 'client'], true);
    }

    public function view(User $user, Vehicle $vehicle): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        if ($user->isAgencyAdmin()) {
            return $vehicle->agency_id === $user->agency_id;
        }

        return $user->isClient() && $vehicle->status === VehicleStatus::AVAILABLE->value;
    }

    public function create(User $user): bool
    {
        return $user->isAgencyAdmin();
    }

    public function update(User $user, Vehicle $vehicle): bool
    {
        return $user->isSuperAdmin() || ($user->isAgencyAdmin() && $vehicle->agency_id === $user->agency_id);
    }

    public function delete(User $user, Vehicle $vehicle): bool
    {
        return $this->update($user, $vehicle);
    }
}
