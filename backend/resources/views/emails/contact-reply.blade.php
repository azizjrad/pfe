<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Reponse - {{ $companyName }}</title>
  </head>
  <body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial;background:#f5f8ff;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td align="center" style="padding:24px 12px;">
          <table width="640" cellpadding="0" cellspacing="0" role="presentation" style="background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 8px 24px rgba(11,32,74,0.12);">
            <tr>
              <td style="background:linear-gradient(90deg,#0a5eea,#2478ff);padding:24px 28px;color:#fff;">
                <div style="font-size:22px;font-weight:800;letter-spacing:.2px;">{{ $companyName }}</div>
                <div style="font-size:13px;opacity:.9;margin-top:4px;">Service Assistance Client</div>
              </td>
            </tr>

            <tr>
              <td style="padding:28px;">
                <h1 style="margin:0 0 10px;color:#0f172a;font-size:20px;">Bonjour {{ $contactMessage->name }},</h1>
                <p style="margin:0 0 18px;color:#334155;font-size:15px;line-height:1.6;">
                  Nous avons bien recu votre message et voici notre reponse personnalisee.
                </p>

                <div style="background:#f8fbff;border:1px solid #dbeafe;border-radius:12px;padding:16px;margin:0 0 14px;">
                  <div style="font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:.04em;margin-bottom:8px;">Votre message</div>
                  <div style="font-size:14px;color:#1e293b;margin-bottom:8px;"><strong>Sujet:</strong> {{ $contactMessage->subject }}</div>
                  <div style="font-size:14px;color:#334155;line-height:1.55;white-space:pre-wrap;">{{ $contactMessage->message }}</div>
                </div>

                <div style="background:#eef6ff;border-left:4px solid #0a5eea;border-radius:10px;padding:16px;margin:0 0 18px;">
                  <div style="font-size:12px;color:#1d4ed8;text-transform:uppercase;letter-spacing:.04em;margin-bottom:8px;">Reponse de l'administration</div>
                  <div style="font-size:15px;color:#0f172a;line-height:1.65;white-space:pre-wrap;">{{ $reply }}</div>
                </div>

                <p style="margin:0;color:#475569;font-size:14px;line-height:1.6;">
                  Pour toute question supplementaire, vous pouvez repondre a cet email ou nous contacter a
                  <a href="mailto:{{ $adminEmail }}" style="color:#0a5eea;text-decoration:none;font-weight:600;">{{ $adminEmail }}</a>.
                </p>
              </td>
            </tr>

            <tr>
              <td style="background:#f8fafc;padding:16px 28px;text-align:center;color:#94a3b8;font-size:12px;">
                © {{ date('Y') }} {{ $companyName }} - Tous droits reserves.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
