# Laravel Sanctum Authentication API

## 🔐 Authentication Endpoints

Base URL: `http://127.0.0.1:8000/api`

---

### 1. Register (Create New Account)

**POST** `/api/register`

**Request Body:**

```json
{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "password_confirmation": "password123",
    "phone": "+216 20 123 456",
    "address": "123 Avenue Habib Bourguiba, Tunis",
    "driver_license": "ABC123456"
}
```

**Response (201):**

```json
{
    "message": "Inscription réussie",
    "user": {
        "id": 8,
        "name": "Test User",
        "email": "test@example.com",
        "role": "client",
        "phone": "+216 20 123 456",
        "address": "123 Avenue Habib Bourguiba, Tunis",
        "driver_license": "ABC123456"
    },
    "token": "1|abcdef123456...",
    "token_type": "Bearer"
}
```

---

### 2. Login

**POST** `/api/login`

**Request Body:**

```json
{
    "email": "sami.jrad@email.tn",
    "password": "password"
}
```

**Response (200):**

```json
{
    "message": "Connexion réussie",
    "user": {
        "id": 4,
        "name": "Sami Jrad",
        "email": "sami.jrad@email.tn",
        "role": "client",
        "phone": "+216 20 456 789",
        "address": "15 Rue de la Liberté, Tunis",
        "driver_license": "TN7890123",
        "agency_id": null
    },
    "token": "2|xyz789abc...",
    "token_type": "Bearer"
}
```

**Error Response (422):**

```json
{
    "message": "Les identifiants fournis sont incorrects.",
    "errors": {
        "email": ["Les identifiants fournis sont incorrects."]
    }
}
```

---

### 3. Get Current User

**GET** `/api/user`

**Headers:**

```
Authorization: Bearer {token}
```

**Response (200):**

```json
{
    "user": {
        "id": 4,
        "name": "Sami Jrad",
        "email": "sami.jrad@email.tn",
        "role": "client",
        "phone": "+216 20 456 789",
        "address": "15 Rue de la Liberté, Tunis",
        "driver_license": "TN7890123",
        "agency_id": null,
        "agency": null,
        "created_at": "2026-02-08T10:56:10.000000Z"
    }
}
```

---

### 4. Logout

**POST** `/api/logout`

**Headers:**

```
Authorization: Bearer {token}
```

**Response (200):**

```json
{
    "message": "Déconnexion réussie"
}
```

---

## 🧪 Test Accounts (from Seeders)

| Role             | Email                      | Password | Description                  |
| ---------------- | -------------------------- | -------- | ---------------------------- |
| **super_admin**  | admin@location.tn          | password | Full system access           |
| **agency_admin** | ahmed.tunis@location.tn    | password | Agence Tunis Centre          |
| **agency_admin** | fatma.aeroport@location.tn | password | Agence Aéroport Carthage     |
| **agency_admin** | mohamed.sousse@location.tn | password | Agence Sousse                |
| **client**       | sami.jrad@email.tn         | password | Reliable client (score: 90)  |
| **client**       | amira.gharbi@email.tn      | password | Perfect client (score: 100)  |
| **client**       | karim.bouazizi@email.tn    | password | High-risk client (score: 38) |

---

## 📝 Usage Examples

### Using cURL (Git Bash / Linux / Mac)

**Login:**

```bash
curl -X POST http://127.0.0.1:8000/api/login \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"email":"sami.jrad@email.tn","password":"password"}'
```

**Get User (with token):**

```bash
curl -X GET http://127.0.0.1:8000/api/user \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Accept: application/json"
```

**Logout:**

```bash
curl -X POST http://127.0.0.1:8000/api/logout \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Accept: application/json"
```

### Using PowerShell

**Login:**

```powershell
$body = @{
    email = 'sami.jrad@email.tn'
    password = 'password'
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri 'http://127.0.0.1:8000/api/login' `
    -Method POST `
    -Body $body `
    -ContentType 'application/json'

$token = $response.token
Write-Host "Token: $token"
```

**Get User:**

```powershell
Invoke-RestMethod -Uri 'http://127.0.0.1:8000/api/user' `
    -Method GET `
    -Headers @{Authorization="Bearer $token"}
```

### Using Postman / Insomnia

1. **Login Request:**
    - Method: POST
    - URL: `http://127.0.0.1:8000/api/login`
    - Headers: `Content-Type: application/json`
    - Body (JSON):
        ```json
        {
            "email": "sami.jrad@email.tn",
            "password": "password"
        }
        ```

2. **Copy the token** from response

3. **Protected Requests:**
    - Add Header: `Authorization: Bearer {paste_token_here}`

---

## 🔒 Role-Based Access (Future Implementation)

You can add middleware for role-based access:

```php
// In routes/api.php
Route::middleware(['auth:sanctum', 'role:super_admin'])->group(function () {
    // Super admin only routes
});

Route::middleware(['auth:sanctum', 'role:agency_admin'])->group(function () {
    // Agency admin only routes
});

Route::middleware(['auth:sanctum', 'role:client'])->group(function () {
    // Client only routes
});
```

---

## ⚙️ Configuration

### CORS (for Frontend)

If you need to connect from React frontend, update `config/cors.php`:

```php
'paths' => ['api/*', 'sanctum/csrf-cookie'],
'allowed_origins' => ['http://localhost:5173'], // Your Vite dev server
```

### Token Expiration

In `config/sanctum.php`:

```php
'expiration' => 60 * 24, // 24 hours (in minutes)
```

---

## ✅ What's Working Now

- ✅ User registration with automatic token generation
- ✅ Login with email/password validation
- ✅ Token-based authentication
- ✅ Get authenticated user details
- ✅ Logout (token revocation)
- ✅ French error messages
- ✅ Role system (client/agency_admin/super_admin)
- ✅ Password hashing with bcrypt
- ✅ Old tokens deletion on new login

---

## 🚀 Next Steps

1. **Add role-based middleware** for protected routes
2. **Create resource controllers** (Agencies, Vehicles, Reservations, etc.)
3. **Implement email verification** (optional)
4. **Add password reset** functionality
5. **Frontend integration** with React
