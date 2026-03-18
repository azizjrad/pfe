<?php

namespace App\Policies;

use App\Models\Report;
use App\Models\User;

class ReportPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isSuperAdmin() || $user->isAgencyAdmin();
    }

    public function create(User $user): bool
    {
        return in_array($user->role, ['client', 'agency_admin', 'super_admin'], true);
    }

    public function update(User $user, Report $report): bool
    {
        return $user->isSuperAdmin();
    }

    public function delete(User $user, Report $report): bool
    {
        return $user->isSuperAdmin();
    }

    public function restore(User $user, Report $report): bool
    {
        return $user->isSuperAdmin();
    }

    public function forceDelete(User $user, Report $report): bool
    {
        return $user->isSuperAdmin();
    }
}
