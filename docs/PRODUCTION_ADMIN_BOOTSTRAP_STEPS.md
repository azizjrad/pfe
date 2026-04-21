# Production - Steps to Create the Initial Admin Account

This guide explains how to create the first super admin account safely in production.

## Prerequisites

- You have SSH/terminal access to your hosting provider.
- You are inside the backend project folder.
- Your environment is set correctly for production.

## 1) Confirm production environment

Check your `.env` (or hosting environment variables):

- `APP_ENV=production`
- `APP_DEBUG=false`
- `APP_URL=https://your-domain.tn`

Then refresh config:

```bash
php artisan config:clear
php artisan config:cache
```

## 2) Run database migrations

Always migrate first so schema is ready:

```bash
php artisan migrate --force
```

## 3) Bootstrap the initial admin account (one-time)

Run the custom command:

```bash
php artisan admin:bootstrap --email=admin@your-domain.tn --name="Platform Admin"
```

What this command does:

- Creates a `super_admin` account only if none exists.
- Generates a strong temporary password.
- Sets `must_change_password=true` for first login security.
- Prints credentials once in terminal.

## 4) Save credentials securely

Immediately store these in a secure password manager:

- Admin email
- Temporary password printed by the command

Do not store credentials in code, docs, screenshots, or public chat.

## 5) First login and mandatory password change

- Login with the temporary password.
- The app will force password change before allowing protected routes.
- After successful change, normal access is restored.

## 6) Verify account creation

Optional checks:

```bash
php artisan tinker
```

Inside tinker:

```php
App\Models\User::where('role', 'super_admin')->count();
App\Models\User::where('email', 'admin@your-domain.tn')->value('must_change_password');
```

Expected:

- Super admin count >= 1
- `must_change_password` is initially `true` before first password update

## 7) Important production rules

- Do not run full demo seeders in production by default.
- Use `admin:bootstrap` for initial admin creation.
- Keep seeder execution blocked in production unless explicitly enabled.

## 8) Re-run behavior (safe)

If you run the command again after admin exists, it should skip creation and not duplicate accounts.

## 9) Quick deployment sequence (copy-paste)

```bash
php artisan config:clear
php artisan migrate --force
php artisan admin:bootstrap --email=admin@your-domain.tn --name="Platform Admin"
php artisan config:cache
```

## 10) Troubleshooting

### Error: command not found

- Ensure latest code is deployed.
- Run:

```bash
php artisan optimize:clear
```

Then retry the command.

### Error: admin already exists

- This is expected on subsequent runs.
- No action needed unless you intentionally want a different admin process.

### Error: SQL column not found (`must_change_password`)

- Migration was not applied on this environment.
- Run:

```bash
php artisan migrate --force
```

## 11) Optional hardening recommendations

- Enable MFA for admin accounts.
- Restrict admin login by IP if feasible.
- Audit log admin actions (role changes, suspensions, deletes).
- Rotate admin passwords periodically.
