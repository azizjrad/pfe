<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Réinitialisation - Elite Drive</title>
  </head>
  <body style="margin:0;padding:0;font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; background-color:#f6f7fb;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td align="center" style="padding:24px 12px">
          <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 6px 18px rgba(20,23,39,0.08)">
            <tr>
              <td style="background:linear-gradient(90deg,#0066ff,#0052d4);padding:20px 32px;color:#fff">
                <img src="{{ $frontend ?? '' }}/logo.png" alt="Elite Drive" width="44" style="vertical-align:middle;border-radius:8px;" />
                <span style="font-size:18px;font-weight:700;margin-left:10px;vertical-align:middle">Elite Drive</span>
              </td>
            </tr>

            <tr>
              <td style="padding:28px">
                <h1 style="margin:0 0 8px;font-size:20px;color:#111827">Réinitialisation du mot de passe</h1>
                <p style="margin:0 0 18px;color:#374151;line-height:1.5;font-size:15px">Nous avons reçu une demande de réinitialisation du mot de passe pour <strong>{{ $email }}</strong>. Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe.</p>

                <div style="text-align:center;margin:24px 0">
                  <a href="{{ $link }}" style="display:inline-block;background:#0066ff;color:#fff;text-decoration:none;padding:12px 22px;border-radius:10px;font-weight:700;box-shadow:0 6px 18px rgba(3,102,214,0.2)">Réinitialiser mon mot de passe</a>
                </div>

                <p style="color:#6b7280;font-size:13px">Si le bouton ne fonctionne pas, copiez-collez ce lien dans votre navigateur :</p>
                <p style="word-break:break-all;color:#6b7280;font-size:13px">{{ $link }}</p>

                <hr style="border:none;border-top:1px solid #eef2ff;margin:22px 0" />

                <p style="font-size:13px;color:#6b7280">Si vous n'avez pas demandé cette réinitialisation, ignorez cet e-mail.</p>
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
