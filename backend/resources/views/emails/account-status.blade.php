<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>{{ $suspended ? 'Compte suspendu' : 'Compte réactivé' }} - Elite Drive</title>
  </head>
  <body style="margin:0;padding:0;font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; background-color:#f6f7fb;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td align="center" style="padding:24px 12px">
          <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 6px 18px rgba(20,23,39,0.08)">
            <tr>
              <td style="background:linear-gradient(90deg,{{ $suspended ? '#dc2626' : '#0066ff' }},{{ $suspended ? '#991b1b' : '#0052d4' }});padding:24px 32px;color:#fff">
                <img src="{{ $frontend ?? '' }}/logo.png" alt="Elite Drive" width="44" style="vertical-align:middle;border-radius:8px;" />
                <span style="font-size:18px;font-weight:700;margin-left:10px;vertical-align:middle">Elite Drive</span>
              </td>
            </tr>

            <tr>
              <td style="padding:30px">
                <h1 style="margin:0 0 10px;font-size:20px;color:#111827">
                  {{ $suspended ? 'Votre compte a été suspendu' : 'Votre compte a été réactivé' }}
                </h1>

                <p style="margin:0 0 18px;color:#374151;line-height:1.6;font-size:15px">
                  Bonjour{{ isset($user->name) ? ' ' . e($user->name) : '' }},
                  @if($suspended)
                    votre compte a été suspendu par l’équipe Elite Drive.
                  @else
                    votre compte a été réactivé et vous pouvez à nouveau accéder à la plateforme.
                  @endif
                </p>

                @if($suspended && !empty($reason))
                  <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:14px 16px;margin:18px 0">
                    <div style="font-weight:700;color:#991b1b;margin-bottom:6px">Motif de la suspension</div>
                    <div style="color:#7f1d1d;line-height:1.5">{{ $reason }}</div>
                  </div>
                @endif

                <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:14px 16px;margin:18px 0">
                  <div style="font-weight:700;color:#111827;margin-bottom:6px">Détails du compte</div>
                  <div style="color:#374151;font-size:14px;line-height:1.7">
                    <div><strong>Email:</strong> {{ $user->email }}</div>
                    <div><strong>Rôle:</strong> {{ $user->role }}</div>
                    @if(!empty($user->agency->name))
                      <div><strong>Agence:</strong> {{ $user->agency->name }}</div>
                    @endif
                  </div>
                </div>

                @if(!$suspended)
                  <div style="text-align:center;margin:24px 0">
                    <a href="{{ rtrim($frontend ?? config('app.url'), '/') }}" style="display:inline-block;background:#0066ff;color:#fff;text-decoration:none;padding:12px 22px;border-radius:10px;font-weight:700;box-shadow:0 6px 18px rgba(3,102,214,0.2)">Retourner à Elite Drive</a>
                  </div>
                @endif

                <hr style="border:none;border-top:1px solid #eef2ff;margin:22px 0" />

                <p style="font-size:13px;color:#6b7280;margin:0">
                  @if($suspended)
                    Si vous pensez qu’il s’agit d’une erreur, contactez le support pour obtenir de l’aide.
                  @else
                    Merci de votre patience et de votre confiance.
                  @endif
                </p>
              </td>
            </tr>

            <tr>
              <td style="background:#f8fafc;padding:18px 32px;text-align:center;color:#9aa4c0;font-size:13px">
                © {{ date('Y') }} Elite Drive — Tous droits réservés.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
