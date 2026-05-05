<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Contrat de réservation - Elite Drive</title>
    <style>
      body { font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial; color:#111827 }
      .container { max-width:800px; margin:0 auto; padding:20px }
      .header { display:flex; gap:12px; align-items:center }
      .vehicle-photo { max-width:200px; border-radius:8px }
      table { width:100%; border-collapse:collapse }
      td,th { padding:8px; vertical-align:top }
      th { text-align:left; background:#f3f4f6 }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <img src="{{ config('app.url') . '/logo.png' }}" alt="Elite Drive" width="56" />
        <div>
          <h2>Contrat de réservation #{{ $reservation->id }}</h2>
          <div>Client: {{ $reservation->user->name ?? '—' }} ({{ $reservation->user->email ?? '—' }})</div>
        </div>
      </div>

      <hr />

      <table>
        <tr>
          <th>Véhicule</th>
          <td>{{ $reservation->vehicle->make ?? '' }} {{ $reservation->vehicle->model ?? '' }} — {{ $reservation->vehicle->plate_number ?? '' }}</td>
        </tr>
        <tr>
          <th>Période</th>
          <td>Début: {{ $reservation->start_date }} <br/> Fin: {{ $reservation->end_date }}</td>
        </tr>
        <tr>
          <th>Prix total</th>
          <td>{{ number_format($reservation->total_price, 2, ',', ' ') }} TND</td>
        </tr>
        <tr>
          <th>Options</th>
          <td>
            @if(!empty($reservation->pricing_details['options']))
              <ul>
                @foreach($reservation->pricing_details['options'] as $opt)
                  <li>{{ $opt['name'] ?? '' }} — {{ number_format($opt['amount'] ?? 0, 2, ',', ' ') }} TND</li>
                @endforeach
              </ul>
            @else
              —
            @endif
          </td>
        </tr>
      </table>

      <div style="margin-top:18px; display:flex; gap:16px; align-items:flex-start">
        @php
          $vehicleImage = $reservation->vehicle->images[0] ?? $reservation->vehicle->main_image ?? $reservation->vehicle->image_url ?? $reservation->vehicle->image ?? '/default-car.jpg';
        @endphp
        <img src="{{ $vehicleImage }}" alt="Photo véhicule" class="vehicle-photo" onerror="this.onerror=null;this.src='/default-car.jpg'" />
        <div style="flex:1">
          <h3>Détails du conducteur</h3>
          <p>{{ $reservation->driver_first_name ?? '' }} {{ $reservation->driver_last_name ?? '' }}<br/>Né(e) le: {{ $reservation->driver_birth_date ?? '—' }}</p>
        </div>
      </div>

      <hr />
      <p style="font-size:13px;color:#6b7280">Signature: ______________________</p>
    </div>
  </body>
</html>
