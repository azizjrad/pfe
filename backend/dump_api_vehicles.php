<?php
require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Vehicle;
use App\Http\Resources\VehicleResource;
use Illuminate\Http\Request;

$vehicles = Vehicle::all();
$arr = VehicleResource::collection($vehicles)->toArray(new Request());
echo json_encode($arr, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
