<?php

// Boot Laravel application for one-off cleanup
require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

echo "Purging vehicle-related tables and images...\n";

DB::statement('SET FOREIGN_KEY_CHECKS=0;');
if (Schema::hasTable('reservations')) {
    DB::table('reservations')->truncate();
}
if (Schema::hasTable('vehicle_prices')) {
    DB::table('vehicle_prices')->truncate();
}
if (Schema::hasTable('vehicles')) {
    DB::table('vehicles')->truncate();
}
DB::statement('SET FOREIGN_KEY_CHECKS=1;');

$vehiclesPublicDir = public_path('vehicles');
if (is_dir($vehiclesPublicDir)) {
    $files = glob($vehiclesPublicDir . DIRECTORY_SEPARATOR . '*');
    foreach ($files as $f) {
        if (is_file($f)) {@unlink($f);}
    }
}

echo "Done.\n";

return 0;
