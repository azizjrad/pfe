<?php

use App\Models\User;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('admin:bootstrap {--email=} {--name=Platform Admin} {--force}', function () {
    $allowOutsideProduction = (bool) $this->option('force');

    if (!app()->environment('production') && !$allowOutsideProduction) {
        $this->error('This command is restricted to production. Use --force to run in non-production.');
        return 1;
    }

    if (User::query()->where('role', 'super_admin')->exists()) {
        $this->warn('A super admin account already exists. Bootstrap skipped.');
        return 0;
    }

    $email = (string) ($this->option('email') ?: $this->ask('Enter admin email'));
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $this->error('Invalid email format.');
        return 1;
    }

    $name = (string) $this->option('name');
    $temporaryPassword = Str::password(20);

    $admin = User::query()->create([
        'name' => $name,
        'email' => $email,
        'password' => Hash::make($temporaryPassword),
        'role' => 'super_admin',
        'must_change_password' => true,
        'phone' => null,
        'address' => null,
        'driver_license' => null,
        'agency_id' => null,
        'email_verified_at' => now(),
    ]);

    $this->info('Initial super admin account created successfully.');
    $this->line('ID: ' . $admin->id);
    $this->line('Email: ' . $admin->email);
    $this->line('Temporary password: ' . $temporaryPassword);
    $this->warn('First-login password change is required before accessing protected routes.');
    $this->warn('Store the temporary password securely and rotate it immediately.');

    return 0;
})->purpose('Create a one-time initial super admin account for production bootstrap');
