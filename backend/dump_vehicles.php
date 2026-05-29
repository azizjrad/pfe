<?php
require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Vehicle;

$rows = Vehicle::all()->map(function ($v) {
    return [
        'id' => $v->id,
        'license_plate' => $v->license_plate,
        'image' => $v->image,
        'images' => $v->images,
        'image_url' => $v->image_url,
    ];
});

echo json_encode($rows, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
