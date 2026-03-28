# SendGrid integration (step-by-step)

This file shows a minimal, practical setup to send transactional emails via SendGrid SMTP from this Laravel app.

Summary (recommended): use SendGrid SMTP with `MAIL_MAILER=smtp` and the username `apikey`.

1. Create a SendGrid account and API key

- Sign in to SendGrid and create an API key with `Full Access` or `Mail Send` scope.
- Verify your sender identity or add a verified sending domain (recommended) in the SendGrid dashboard.

2. Add credentials to your local `.env`
   Replace placeholders with your real values. Do NOT commit `.env`.

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USERNAME=apikey
MAIL_PASSWORD=SG.xxxxxxx-your-sendgrid-api-key-xxxx
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=no-reply@yourdomain.com
MAIL_FROM_NAME="Elite Drive"

# Keep the frontend URL so invite links work
FRONTEND_URL=https://your-frontend-host.example

# Recommended for queued delivery in production
QUEUE_CONNECTION=database
```

3. Configure Laravel (one-time)

- Ensure `config/mail.php` uses `env('MAIL_MAILER', 'smtp')` as the default mailer.
- Clear cached config after updating `.env`:

```bash
php artisan config:clear
php artisan cache:clear
php artisan config:cache
```

4. Verify sender identity in SendGrid

- In SendGrid dashboard > Sender Authentication: add and verify your sending domain or single sender email.
- If unverified, some providers may place messages in spam.

5. Run queue worker (if mails are queued)

- The mailables in the app use `->queue()`. For local quick tests you can set `QUEUE_CONNECTION=sync` so mails send inline.
- For real queued delivery run:

```bash
php artisan queue:work --tries=3
```

6. Send a quick test email (Laravel Tinker)

- Example: open tinker and run a send using one of the mailables.

```bash
php artisan tinker
>>> Mail::to('you@yourdomain.com')->send(new App\\Mail\\ResetPasswordMail('https://frontend/set-password?token=abc','you@yourdomain.com'));
```

Check SendGrid's Activity feed for delivery events and the recipient inbox.

7. Common troubleshooting

- Check `storage/logs/laravel.log` for errors.
- If authentication fails, confirm `MAIL_USERNAME=apikey` and `MAIL_PASSWORD` is the API key.
- If emails land in spam, ensure domain verification and SPF/DKIM are configured in SendGrid for your domain.

8. Production checklist

- Use `QUEUE_CONNECTION=database` (or Redis) and run queue workers under a supervisor.
- Store SendGrid API key in your production environment secrets manager.
- Monitor SendGrid suppressions and delivery metrics.

If you want, I can add a short snippet to `config/mail.php` to toggle between `log` (dev) and `smtp` (sendgrid) using an env flag, or add example commands for supervisor setup.
