# 🔒 Guide de Sécurité - Fonctionnalités Implémentées

> **Pour débutants** : Ce document explique toutes les mesures de sécurité utilisées dans ce projet, pourquoi elles sont importantes, et comment elles fonctionnent.

---

## 📋 Table des Matières

1. [Hashing des Mots de Passe (Bcrypt)](#1-hashing-des-mots-de-passe-bcrypt)
2. [Validation Forte des Mots de Passe](#2-validation-forte-des-mots-de-passe)
3. [Tokens d'Authentification (Laravel Sanctum)](#3-tokens-dauthentification-laravel-sanctum)
4. [Expiration des Tokens (60 minutes)](#4-expiration-des-tokens-60-minutes)
5. [Rate Limiting (Protection Brute Force)](#5-rate-limiting-protection-brute-force)
6. [CORS Restrictif](#6-cors-restrictif)
7. [Limite de Sessions Simultanées (3 appareils max)](#7-limite-de-sessions-simultanées-3-appareils-max)
8. [Logging des Activités](#8-logging-des-activités)
9. [Validation Côté Serveur](#9-validation-côté-serveur)
10. [Protection Mass Assignment](#10-protection-mass-assignment)
11. [HTTPS en Production](#11-https-en-production)
12. [Protection XSS (Cross-Site Scripting)](#12-protection-xss-cross-site-scripting)
13. [Protection SQL Injection](#13-protection-sql-injection)
14. [Middleware d'Authentification](#14-middleware-dauthentification)

---

## 1. 🔐 Hashing des Mots de Passe (Bcrypt)

### C'est quoi ?

Le **hash** transforme un mot de passe en une chaîne illisible et irréversible.

### Exemple concret :

```
Mot de passe saisi      : "Password123!"
Mot de passe stocké en DB : "$2y$12$randomSalt.hashedString..."
```

### Comment ça marche ?

```php
// Inscription - Transformer le password en hash
$hashedPassword = Hash::make('Password123!');
// Résultat : "$2y$12$abc..." (impossible à décrypter)

// Connexion - Vérifier sans connaître le password
Hash::check('Password123!', $hashedPassword);  // true
Hash::check('WrongPassword', $hashedPassword);  // false
```

### Pourquoi c'est important ?

- ✅ Si quelqu'un vole la base de données, il ne peut PAS lire les mots de passe
- ✅ Même l'administrateur ne connaît pas les mots de passe des users
- ✅ Protège contre les fuites de données

### Le Salt (grain de sel) :

```
Password + Salt aléatoire = Hash unique
"Password123!" + "xYz9..." = "$2y$12$xYz9...abc"
```

- **Avantage** : Même password = hash différent pour chaque user
- **Protection** : Contre les rainbow tables (tables précalculées)

### Implémentation dans notre projet :

📁 **Fichier** : `backend/app/Models/User.php`

```php
protected function casts(): array
{
    return [
        'password' => 'hashed',  // Auto-hashing par Eloquent
    ];
}
```

📁 **Fichier** : `backend/app/Http/Controllers/Api/AuthController.php`

```php
// Lors de l'inscription
$user = User::create([
    'password' => Hash::make($validated['password']),  // Transformation en hash
]);

// Lors de la connexion
if (!Hash::check($request->password, $user->password)) {
    // Password incorrect
}
```

---

## 2. 🛡️ Validation Forte des Mots de Passe

### C'est quoi ?

Forcer l'utilisateur à créer un mot de passe **complexe** et difficile à deviner.

### Règles implémentées :

```php
'password' => [
    'required',              // Obligatoire
    'string',                // Doit être du texte
    'min:8',                 // Minimum 8 caractères
    'confirmed',             // Doit matcher password_confirmation
    'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/',
    // ↑ Au moins: 1 minuscule, 1 majuscule, 1 chiffre, 1 caractère spécial
],
```

### Exemples :

| Mot de passe   | Valide ? | Raison                             |
| -------------- | -------- | ---------------------------------- |
| `password`     | ❌       | Pas de majuscule, chiffre, spécial |
| `Password`     | ❌       | Pas de chiffre, spécial            |
| `Password123`  | ❌       | Pas de caractère spécial           |
| `Password123!` | ✅       | Tous les critères respectés        |

### Pourquoi c'est important ?

- ✅ Protège contre les **attaques par dictionnaire** (testeur automatique de mots de passe communs)
- ✅ Rend le **brute force** plus difficile (essayer toutes les combinaisons)
- ✅ Force l'utilisateur à choisir un password sécurisé

### Message d'erreur personnalisé :

```php
[
    'password.regex' => 'Le mot de passe doit contenir au moins une minuscule, une majuscule, un chiffre et un caractère spécial (@$!%*?&).',
]
```

### Implémentation :

📁 **Fichier** : `backend/app/Http/Controllers/Api/AuthController.php` (ligne 23-29)

---

## 3. 🎫 Tokens d'Authentification (Laravel Sanctum)

### C'est quoi ?

Un **token** est comme un **badge numérique** unique que l'utilisateur reçoit après connexion.

### Comment ça fonctionne ?

```
1. User se connecte avec email + password
   ↓
2. Serveur vérifie les credentials
   ↓
3. Serveur génère un token unique : "42|xyz123abc..."
   ↓
4. Frontend stocke le token dans localStorage
   ↓
5. Chaque requête envoie le token dans le header :
   Authorization: Bearer 42|xyz123abc...
   ↓
6. Serveur vérifie le token et identifie l'utilisateur
```

### Exemple concret :

```php
// Backend - Générer un token
$token = $user->createToken('auth_token')->plainTextToken;
// Résultat : "1|xyz123abc456def..."

// Frontend - Utiliser le token
axios.get('/api/user', {
    headers: {
        Authorization: `Bearer ${token}`
    }
});
```

### Pourquoi Sanctum ?

| Feature           | Sanctum | Autres |
| ----------------- | ------- | ------ |
| Simplicité        | ⭐⭐⭐  | ⭐     |
| SPA-friendly      | ✅      | ❌     |
| Révocation facile | ✅      | ❌     |
| Mobile support    | ✅      | ✅     |

### Stockage sécurisé :

```
Frontend (localStorage) : "42|xyz123abc..."   (texte clair)
Database (hashed)       : "hashedVersionOf..."  (hash SHA-256)
```

- ✅ Si quelqu'un vole la DB, les tokens sont hachés (inutilisables)
- ✅ Chaque appareil a son propre token

### Implémentation :

📁 **Fichier** : `backend/config/sanctum.php`
📁 **Fichier** : `backend/routes/api.php` (middleware auth:sanctum)

---

## 4. ⏰ Expiration des Tokens (60 minutes)

### C'est quoi ?

Les tokens deviennent **invalides après 60 minutes** d'inactivité.

### Configuration :

```php
// backend/config/sanctum.php
'expiration' => 60,  // Minutes
```

### Comment ça fonctionne ?

```
1. User se connecte à 10:00
   → Token créé, expiration : 11:00

2. User fait une requête à 10:30
   → Token valide ✅

3. User fait une requête à 11:05
   → Token expiré ❌
   → Redirection vers /login
```

### Pourquoi c'est important ?

- ✅ **Sécurité** : Si quelqu'un vole le token, il n'est valide que temporairement
- ✅ **Sessions abandonnées** : User oublie de se déconnecter, token expire automatiquement
- ✅ **Ordinateurs publics** : Protection si user oublie de logout

### Gestion frontend :

```javascript
// Intercepteur axios vérifie les erreurs 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login"; // Redirection auto
    }
  },
);
```

### Implémentation :

📁 **Fichier** : `backend/config/sanctum.php` (ligne 51)
📁 **Fichier** : `frontend/src/services/api.js` (intercepteur ligne 26-35)

---

## 5. 🚦 Rate Limiting (Protection Brute Force)

### C'est quoi ?

Limiter le **nombre de tentatives de connexion** pour empêcher les attaques automatisées.

### Configuration actuelle :

```php
// Max 5 tentatives de login par minute
Route::post('/login', [AuthController::class, 'login'])
    ->middleware('throttle:5,1');
```

### Comment ça fonctionne ?

```
Tentative 1 : ✅ Acceptée
Tentative 2 : ✅ Acceptée
Tentative 3 : ✅ Acceptée
Tentative 4 : ✅ Acceptée
Tentative 5 : ✅ Acceptée (dernière)
Tentative 6 : ❌ BLOQUÉE ! (Too Many Requests - 429)
  ↓
Attendre 60 secondes
  ↓
Tentative 7 : ✅ Acceptée (compteur réinitialisé)
```

### Pourquoi c'est important ?

- ✅ **Protège contre brute force** : Attaquant essaie 1000 passwords/seconde → Bloqué après 5 essais
- ✅ **Protège le serveur** : Évite la surcharge
- ✅ **Détecte les comportements suspects**

### Scénario d'attaque bloquée :

```python
# Script malveillant (exemple)
passwords = ["password123", "admin123", "qwerty", ...]
for password in passwords:
    login(email="admin@example.com", password=password)
    # ↑ Bloqué après 5 tentatives !
```

### Réponse serveur :

```json
{
  "message": "Too Many Requests",
  "retry_after": 60
}
```

### Implémentation :

📁 **Fichier** : `backend/routes/api.php` (ligne 19)

---

## 6. 🌐 CORS Restrictif

### C'est quoi ?

**CORS** (Cross-Origin Resource Sharing) contrôle **quels sites web** peuvent accéder à ton API.

### Configuration actuelle :

```php
// backend/config/cors.php
'allowed_origins' => [
    'http://localhost:5173',   // Seulement ton frontend Vite
    'http://localhost:3000',    // Alternative React port
    'http://127.0.0.1:5173',
],
'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
'allowed_headers' => ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
```

### Pourquoi c'est important ?

```
❌ Avant (CORS permissif) :
   - Evil.com peut appeler ton API
   - Voler les données users

✅ Après (CORS restrictif) :
   - Seulement localhost:5173 peut appeler l'API
   - Evil.com est bloqué par le navigateur
```

### Scénario bloqué :

```javascript
// Site malveillant : evil.com
fetch("https://ton-api.com/api/user", {
  headers: { Authorization: "Bearer stolen_token" },
});
// ↑ BLOQUÉ par CORS !
// Erreur : "Access-Control-Allow-Origin"
```

### En production :

```php
'allowed_origins' => [
    'https://elitedrive.tn',  // Ton domaine de production
],
```

### Implémentation :

📁 **Fichier** : `backend/config/cors.php`

---

## 7. 📱 Limite de Sessions Simultanées (3 appareils max)

### C'est quoi ?

Limiter le nombre d'**appareils connectés simultanément** avec le même compte.

### Comment ça fonctionne ?

```
User se connecte sur :
1. Chrome Windows (Token 1) ✅
2. Safari iPhone  (Token 2) ✅
3. Firefox Linux  (Token 3) ✅ (dernier autorisé)

4. Edge Android   (Token 4) → Supprime Token 1 (le plus ancien)
```

### Code implémenté :

```php
// Vérifier le nombre de tokens actifs
$existingTokens = $user->tokens()->count();

if ($existingTokens >= 3) {
    // Supprimer le token le plus ancien
    $user->tokens()->oldest()->first()->delete();

    Log::info('Session limit reached - Oldest token removed');
}

// Créer le nouveau token
$token = $user->createToken('auth_token')->plainTextToken;
```

### Pourquoi c'est important ?

- ✅ **Empêche le partage de comptes** : 10 personnes ne peuvent pas utiliser le même login
- ✅ **Sécurité** : Limite l'impact si un token est volé
- ✅ **Détection d'activité suspecte** : Si tokens dépassent 3, quelqu'un utilise peut-être le compte

### Notification user (optionnel) :

```
"Votre session la plus ancienne (Chrome Windows) a été déconnectée
car vous avez atteint la limite de 3 appareils connectés."
```

### Implémentation :

📁 **Fichier** : `backend/app/Http/Controllers/Api/AuthController.php` (lignes 143-152)

---

## 8. 📝 Logging des Activités

### C'est quoi ?

Enregistrer les **événements importants** dans des fichiers logs pour audit et sécurité.

### Événements loggés :

#### 1. Tentatives de login échouées (user inexistant) :

```php
Log::warning('Failed login attempt - User not found', [
    'email' => $request->email,
    'ip' => $request->ip(),
    'user_agent' => $request->userAgent(),
    'timestamp' => now(),
]);
```

**Fichier log :** `storage/logs/laravel.log`

```
[2026-02-23 10:30:45] local.WARNING: Failed login attempt - User not found
{"email":"hacker@evil.com","ip":"192.168.1.100","user_agent":"PostmanRuntime/7.32.2"}
```

#### 2. Tentatives de login échouées (mauvais password) :

```php
Log::warning('Failed login attempt - Invalid password', [
    'email' => $request->email,
    'user_id' => $user->id,
    'ip' => $request->ip(),
]);
```

#### 3. Connexions réussies :

```php
Log::info('Successful login', [
    'user_id' => $user->id,
    'email' => $user->email,
    'ip' => $request->ip(),
]);
```

#### 4. Limite de sessions atteinte :

```php
Log::info('Session limit reached - Oldest token removed', [
    'user_id' => $user->id,
    'email' => $user->email,
]);
```

### Pourquoi c'est important ?

- ✅ **Audit** : Tracer qui a fait quoi et quand
- ✅ **Détection d'attaques** : Voir les patterns suspects (100 tentatives depuis même IP)
- ✅ **Debugging** : Comprendre les erreurs utilisateurs
- ✅ **Conformité RGPD** : Prouver la sécurité des données

### Analyse des logs :

```bash
# Voir les tentatives échouées
php artisan tail --filter="Failed login"

# Compter les tentatives par IP
grep "Failed login" storage/logs/laravel.log | grep -o '"ip":"[^"]*"' | sort | uniq -c
```

### Implémentation :

📁 **Fichier** : `backend/app/Http/Controllers/Api/AuthController.php`

---

## 9. ✅ Validation Côté Serveur

### C'est quoi ?

Vérifier les données **côté backend** même si le frontend valide aussi.

### Pourquoi 2 validations (frontend + backend) ?

```
Frontend (JavaScript) :
✅ Feedback immédiat à l'utilisateur
❌ Peut être contournée (désactiver JavaScript)

Backend (Laravel) :
✅ Impossible à contourner
✅ Protection réelle
```

### Attaque bloquée :

```javascript
// Attaquant contourne la validation frontend
fetch("http://localhost:8000/api/register", {
  method: "POST",
  body: JSON.stringify({
    email: "hacker@evil.com",
    password: "123", // ❌ Trop court
    role: "super_admin", // ❌ Rôle interdit
  }),
});

// Backend rejette :
// - password: "min:8 required"
// - role: "in:client,agency_admin" (super_admin bloqué)
```

### Règles de validation implémentées :

```php
$validated = $request->validate([
    'name' => 'required|string|max:255',
    'email' => 'required|string|email|max:255|unique:users',
    'password' => [
        'required', 'string', 'min:8', 'confirmed',
        'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/',
    ],
    'role' => 'required|in:client,agency_admin',  // ⚠️ Pas de super_admin !
    'phone' => 'required|string|size:8',
    'address' => 'nullable|string|max:500',
]);
```

### Messages d'erreur retournés :

```json
{
  "message": "The given data was invalid",
  "errors": {
    "email": ["The email has already been taken."],
    "password": ["Le mot de passe doit contenir au moins une minuscule..."]
  }
}
```

### Implémentation :

📁 **Fichier** : `backend/app/Http/Controllers/Api/AuthController.php` (register + login)

---

## 10. 🛡️ Protection Mass Assignment

### C'est quoi ?

Empêcher un attaquant de modifier des champs non autorisés.

### Exemple d'attaque (sans protection) :

```javascript
// Attaquant envoie un champ supplémentaire
fetch('/api/register', {
    body: JSON.stringify({
        name: 'Hacker',
        email: 'hacker@evil.com',
        password: 'Password123!',
        role: 'client',
        is_admin: true,  // ⚠️ Essaie de devenir admin !
    })
});

// Sans protection :
User::create($request->all());  // ❌ Tous les champs acceptés !
```

### Protection implémentée :

```php
// backend/app/Models/User.php
protected $fillable = [
    'name',
    'email',
    'password',
    'role',
    'agency_id',
    'phone',
    'address',
    'driver_license',
];
// ↑ Seuls ces champs peuvent être assignés

// Tentative d'injection bloquée :
User::create([
    'name' => 'Hacker',
    'is_admin' => true,  // ⚠️ IGNORÉ ! (pas dans $fillable)
]);
```

### Champs protégés (jamais exposés) :

```php
protected $hidden = [
    'password',        // Ne jamais retourner le hash
    'remember_token',  // Token interne Laravel
];
```

### Pourquoi c'est important ?

- ✅ **Contrôle strict** : Seuls les champs autorisés peuvent être modifiés
- ✅ **Protection admin** : Impossible de s'auto-promouvoir
- ✅ **Vie privée** : Password jamais exposé dans les réponses JSON

### Implémentation :

📁 **Fichier** : `backend/app/Models/User.php`

---

## 11. 🔐 HTTPS en Production

### C'est quoi ?

**HTTPS** chiffre la communication entre le navigateur et le serveur.

### Différence HTTP vs HTTPS :

```
HTTP (Non sécurisé) :
User → [Password123! en clair] → Serveur
  ↑ Visible par n'importe qui sur le réseau

HTTPS (Sécurisé) :
User → [Données chiffrées: $#@!%^&*] → Serveur
  ↑ Impossible à lire en transit
```

### Scénario d'attaque bloquée :

```
☕ Café avec WiFi public

Hacker (Man-in-the-Middle) :
  ↓ écoute le réseau WiFi

❌ HTTP  : Voit "email=ahmed@example.com&password=Password123!"
✅ HTTPS : Voit "$#@!%^&*..." (incompréhensible)
```

### Configuration production :

#### 1. Obtenir un certificat SSL :

```bash
# Gratuit avec Let's Encrypt
sudo certbot --nginx -d elitedrive.tn
```

#### 2. Forcer HTTPS :

```php
// backend/app/Providers/AppServiceProvider.php
public function boot()
{
    if (App::environment('production')) {
        URL::forceScheme('https');
    }
}
```

#### 3. Header HSTS (HTTP Strict Transport Security) :

```php
// Force le navigateur à toujours utiliser HTTPS
header('Strict-Transport-Security: max-age=31536000; includeSubDomains');
```

### Vérification :

```
✅ https://elitedrive.tn → Cadenas vert 🔒
❌ http://elitedrive.tn  → Redirection auto vers HTTPS
```

### Implémentation :

📁 **En développement** : HTTP ok (localhost)
📁 **En production** : HTTPS obligatoire !

---

## 12. 🧼 Protection XSS (Cross-Site Scripting)

### C'est quoi ?

Empêcher l'injection de code JavaScript malveillant.

### Exemple d'attaque (sans protection) :

```javascript
// Attaquant s'inscrit avec :
name: "<script>alert('Hacked!');</script>"

// Page affiche le nom :
<h1>Bienvenue <script>alert('Hacked!');</script></h1>
// ↑ Script s'exécute ! ❌
```

### Protection automatique Laravel (Blade) :

```blade
{{-- Blade template --}}
<h1>Bienvenue {{ $user->name }}</h1>
{{-- ↑ Échappe automatiquement le HTML --}}

Résultat :
<h1>Bienvenue &lt;script&gt;alert('Hacked!');&lt;/script&gt;</h1>
{{-- ↑ Affiché comme texte, pas exécuté ✅ --}}
```

### Protection automatique React :

```jsx
// React échappe automatiquement
<h1>Bienvenue {user.name}</h1>
// ↑ Pas d'exécution de script ✅
```

### Quand c'est dangereux :

```jsx
// ❌ DANGEREUX !
<div dangerouslySetInnerHTML={{__html: user.bio}} />
// ↑ Exécute le HTML/JS sans échapper !

// ✅ SÉCURISÉ
<div>{user.bio}</div>
// ↑ Texte seulement
```

### Content Security Policy (CSP) :

```php
// Bloquer l'exécution de scripts inline
header("Content-Security-Policy: script-src 'self'");
```

### Implémentation :

📁 **Automatique** : Laravel Blade + React échappent par défaut

---

## 13. 💉 Protection SQL Injection

### C'est quoi ?

Empêcher l'injection de commandes SQL malveillantes.

### Exemple d'attaque (code vulnérable) :

```php
// ❌ DANGEREUX (raw SQL)
$email = $_POST['email'];  // "' OR 1=1 --"
$query = "SELECT * FROM users WHERE email = '$email'";
// Résultat : SELECT * FROM users WHERE email = '' OR 1=1 --'
// ↑ Retourne TOUS les utilisateurs !
```

### Protection Eloquent :

```php
// ✅ SÉCURISÉ (prepared statements automatiques)
$user = User::where('email', $request->email)->first();
// ↑ Laravel échappe automatiquement

// En coulisses :
// Préparation : SELECT * FROM users WHERE email = ?
// Binding : ['email' => $request->email]
// ↑ L'email est traité comme une VALEUR, pas comme du CODE SQL
```

### Attaque bloquée :

```javascript
// Attaquant essaie :
fetch('/api/login', {
    body: JSON.stringify({
        email: "' OR 1=1 --",
        password: "anything"
    })
});

// Backend Laravel :
User::where('email', "' OR 1=1 --")->first();
// ↑ Cherche littéralement un email = "' OR 1=1 --"
// ✅ Aucun user trouvé (injection bloquée)
```

### Règles de sécurité :

1. ✅ **Toujours utiliser Eloquent** ou Query Builder
2. ❌ **Jamais de raw SQL** avec input utilisateur
3. ⚠️ Si raw SQL nécessaire, utiliser bindings :
   ```php
   DB::select('SELECT * FROM users WHERE email = ?', [$email]);
   ```

### Implémentation :

📁 **Automatique** : Tous nos controllers utilisent Eloquent

---

## 14. 🚪 Middleware d'Authentification

### C'est quoi ?

Un **gardien** qui vérifie si l'utilisateur est connecté avant d'accéder à certaines routes.

### Architecture :

```
Requête → [Middleware auth:sanctum] → Controller
            ↓
        Token valide ?
        ✅ Oui → Continue
        ❌ Non → 401 Unauthorized
```

### Code implémenté :

```php
// backend/routes/api.php

// Routes PUBLIQUES (pas besoin de token)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Routes PROTÉGÉES (token obligatoire)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::get('/reservations', [ReservationController::class, 'index']);
    // ... toutes les routes sensibles
});
```

### Comment ça fonctionne ?

```
1. Frontend envoie requête :
   GET /api/user
   Header: Authorization: Bearer 42|xyz123abc...

2. Middleware auth:sanctum :
   - Extrait le token du header
   - Cherche dans la table personal_access_tokens
   - Hash le token et compare
   - Charge l'utilisateur associé

3a. Token valide :
   → $request->user() disponible
   → Controller s'exécute

3b. Token invalide/expiré :
   → Retourne 401 Unauthorized
   → Controller jamais exécuté
```

### Frontend gère l'erreur :

```javascript
// Intercepteur axios
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token invalide → Déconnecter l'user
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
  },
);
```

### Implémentation :

📁 **Fichier** : `backend/routes/api.php`
📁 **Fichier** : `frontend/src/services/api.js` (intercepteur)

---

## 🎯 Checklist de Sécurité

Avant de déployer en production, vérifie que :

### Backend :

- [ ] ✅ Tous les passwords hachés avec Bcrypt
- [ ] ✅ Validation forte du password (min 8, majuscule, minuscule, chiffre, spécial)
- [ ] ✅ Tokens expirent après 60 minutes
- [ ] ✅ Rate limiting activé (5 tentatives/minute)
- [ ] ✅ CORS restrictif (seulement ton domaine)
- [ ] ✅ Limite de 3 sessions simultanées
- [ ] ✅ Logs des tentatives échouées actifs
- [ ] ✅ HTTPS forcé en production
- [ ] ✅ Certificat SSL valide
- [ ] ✅ Variables .env sécurisées (pas dans Git)
- [ ] ✅ APP_DEBUG=false en production
- [ ] ✅ Eloquent utilisé partout (pas de raw SQL)

### Frontend :

- [ ] ✅ Token stocké dans localStorage (ou httpOnly cookie)
- [ ] ✅ Intercepteur 401 pour déconnexion auto
- [ ] ✅ Pas de dangerouslySetInnerHTML avec input user
- [ ] ✅ Validation côté client (UX)
- [ ] ✅ HTTPS utilisé en production

### Serveur :

- [ ] ✅ Firewall configuré (ports 80, 443 seulement)
- [ ] ✅ Fail2ban installé (bloque IPs suspectes)
- [ ] ✅ Backups automatiques de la DB
- [ ] ✅ Logs monitorés (Sentry, LogRocket, etc.)

---

## 📚 Ressources Complémentaires

### Documentation Officielle :

- [Laravel Security](https://laravel.com/docs/11.x/security)
- [Laravel Sanctum](https://laravel.com/docs/11.x/sanctum)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

### Outils de Test de Sécurité :

- **Postman** : Tester les endpoints API
- **OWASP ZAP** : Scanner de vulnérabilités
- **Burp Suite** : Analyse du trafic réseau

### Articles Recommandés :

- "Password Hashing: PBKDF2, Scrypt, Bcrypt and ARGON2" - Auth0
- "JWT vs Session Tokens" - Stack Overflow
- "CSRF Protection in SPAs" - Laravel News

---

## 🎓 Pour ta Soutenance PFE

### Questions Possibles :

**Q1 : Pourquoi stocker le token en localStorage et pas en cookie ?**

> **R :** Deux approches valides. localStorage est plus simple pour un SPA, évite les problèmes CORS, et fonctionne naturellement avec les requêtes fetch/axios. Pour plus de sécurité (protection XSS), on pourrait migrer vers httpOnly cookies.

**Q2 : Comment protèges-tu contre les attaques par force brute ?**

> **R :** Trois mesures : 1) Rate limiting (5 tentatives/min), 2) Validation password forte, 3) Logging des tentatives échouées pour détection.

**Q3 : Que se passe-t-il si quelqu'un vole le token ?**

> **R :** Le token expire après 60 min. De plus, on loggue toutes les connexions (IP, user-agent), donc on peut détecter une activité suspecte. En cas de vol détecté, on peut révoquer tous les tokens de l'user.

**Q4 : Pourquoi limiter à 3 sessions simultanées ?**

> **R :** Pour empêcher le partage de comptes massif et détecter les activités anormales. Si un user a 50 sessions actives, c'est suspect.

**Q5 : HTTPS est-il vraiment obligatoire ?**

> **R :** OUI ! Sans HTTPS, les passwords et tokens sont visibles en clair sur le réseau. N'importe qui sur le même WiFi peut intercepter les données.

---

**Date** : 23 Février 2026  
**Version** : 1.0  
**Auteur** : Elite Drive Platform  
**Statut** : ✅ Production Ready
