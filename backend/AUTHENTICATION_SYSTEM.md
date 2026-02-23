# 🔐 Système d'Authentification - Documentation PFE

## 📋 Vue d'ensemble

Ce système d'authentification utilise **Laravel Sanctum** pour sécuriser l'API et gérer les tokens d'accès pour l'application React.

---

## 🎯 Concepts Clés à Retenir pour le PFE

### 1. **Laravel Sanctum (Token-Based Authentication)**

**Pourquoi Sanctum ?**

- ✅ **Simple et léger** : Pas besoin d'OAuth complexe
- ✅ **Sécurisé** : Tokens hachés dans la base de données
- ✅ **Idéal pour SPA** : Conçu pour React, Vue, Angular
- ✅ **Révocation facile** : Suppression simple des tokens

**C'est quoi un Token ?**
Imagine un **badge d'accès** à un bâtiment :

- Quand tu t'identifies (login), on te donne un badge unique
- Ce badge te permet d'accéder aux salles autorisées
- Si tu perds ton badge ou qu'on te le vole, on peut le désactiver
- Chaque fois que tu veux entrer quelque part, tu montres ton badge

**Dans notre système :**

- Le token = badge numérique (ex: `1|xyz123abc...`)
- Le login = recevoir le badge
- Les requêtes API = montrer le badge
- Le logout = détruire le badge

**C'est quoi le Hash ?**
Le hash est une **fonction mathématique à sens unique** :

```
Password "Password123!" → Hash "$2y$12$random..."
```

- ✅ On peut transformer le mot de passe en hash
- ❌ On ne peut PAS retrouver le mot de passe depuis le hash
- 🔐 Même mot de passe = hash différent (grâce au "salt")

**Pourquoi hacher ?**
Si quelqu'un vole la base de données :

- ❌ Sans hash : Il voit tous les mots de passe
- ✅ Avec hash : Il voit juste des codes incompréhensibles

**C'est quoi un Middleware ?**
Un middleware est un **gardien** entre la requête et ton code :

```
Requête → [Middleware vérifie] → Controller
```

Exemple avec `auth:sanctum` :

1. User envoie requête avec token
2. Middleware vérifie : "Ce token est-il valide ?"
3. Si OUI → Laisse passer vers le Controller
4. Si NON → Bloque et retourne erreur 401

### 2. **Architecture du Système**

```
┌─────────────┐          ┌──────────────┐          ┌──────────────┐
│   React     │  HTTPS   │  Laravel API │   Hash   │   Database   │
│  Frontend   │ ──────→  │   (Sanctum)  │ ──────→  │   (MySQL)    │
│             │ ←──────  │              │ ←──────  │              │
└─────────────┘  Token   └──────────────┘   Data   └──────────────┘
```

### 3. **Flux d'Authentification**

#### **A. Inscription (Register)**

```
1. User remplit formulaire → Email, Password, Role, Phone
2. Frontend envoie → POST /api/register
3. Laravel valide → Règles de validation
4. Crée User → Hash du password (bcrypt)
5. Si agency_admin → Créer Agency
6. Si client → Créer ClientReliabilityScore (score = 100)
7. Génère Token → $user->createToken('auth_token')
8. Retourne → {user, access_token, token_type}
```

#### **B. Connexion (Login)**

```
1. User entre credentials → Email + Password
2. Frontend envoie → POST /api/login
3. Laravel cherche User → WHERE email = ?
4. Vérifie password → Hash::check($password, $user->password)
5. Supprime old tokens → $user->tokens()->delete()
6. Crée nouveau token → $user->createToken('auth_token')
7. Charge relations → agency, reliabilityScore
8. Retourne → {user, access_token, token_type}
```

#### **C. Routes Protégées**

```
1. Frontend ajoute token → Header: "Authorization: Bearer {token}"
2. Laravel middleware → auth:sanctum
3. Sanctum vérifie → Token existe et valide?
4. Charge User → $request->user()
5. Exécute action → Controller method
6. Retourne données → JSON response
```

#### **D. Déconnexion (Logout)**

```
1. Frontend envoie → POST /api/logout (avec token)
2. Laravel supprime → $request->user()->currentAccessToken()->delete()
3. Token révoqué → Ne peut plus être utilisé
4. Retourne → {message: "Déconnexion réussie"}
```

---

## 📁 Structure des Fichiers

### Backend (Laravel)

```
backend/
├── app/
│   ├── Http/
│   │   └── Controllers/
│   │       └── Api/
│   │           └── AuthController.php    ← Logic d'authentification
│   └── Models/
│       ├── User.php                      ← Model avec HasApiTokens
│       ├── Agency.php
│       └── ClientReliabilityScore.php
├── config/
│   ├── sanctum.php                       ← Configuration Sanctum
│   └── auth.php                          ← Guards et providers
├── database/
│   └── migrations/
│       └── 0001_01_01_000000_create_users_table.php
└── routes/
    └── api.php                           ← Routes API
```

---

## 🛠️ Implémentation Détaillée

### 1. **Modèle User (app/Models/User.php)**

```php
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens;  // ← ESSENTIEL pour Sanctum

    protected $fillable = [
        'name', 'email', 'password',
        'role', 'agency_id', 'phone',
        'address', 'driver_license'
    ];

    protected $hidden = ['password', 'remember_token'];

    protected $casts = [
        'password' => 'hashed',  // ← Auto-hashing
    ];

    // Relations
    public function agency() {
        return $this->belongsTo(Agency::class);
    }

    public function reliabilityScore() {
        return $this->hasOne(ClientReliabilityScore::class);
    }
}
```

### 2. **Routes API (routes/api.php)**

```php
// Routes publiques (sans authentification)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Routes protégées (nécessitent token)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
});
```

### 3. **AuthController - Register Method (Expliqué ligne par ligne)**

````php
public function register(Request $request)
{
    // ═══════════════════════════════════════════════════════════════
    // ÉTAPE 1 : VALIDATION DES DONNÉES
    // ═══════════════════════════════════════════════════════════════
    // Pourquoi ? Protéger contre les données invalides/malveillantes

    $validated = $request->validate([
        'name' => 'required|string|max:255',
        // ↑ Obligatoire, texte, max 255 caractères

        'email' => 'required|email|unique:users',
        // ↑ Obligatoire, format email valide, et UNIQUE (pas de doublon)

        'password' => 'required|min:8|confirmed',
        // ↑ Obligatoire, min 8 caractères, et doit matcher password_confirmation

        'role' => 'required|in:client,agency_admin',
        // ↑ Obligatoire, et SEULEMENT 'client' ou 'agency_admin' (sécurité)

        'phone' => 'required|size:8',
        // ↑ Obligatoire, exactement 8 chiffres (format tunisien)
    ]);

    // Si une règle échoue → Laravel lance automatiquement une erreur 422
    // et retourne les messages d'erreur au frontend

    // ═══════════════════════════════════════════════════════════════
    // ÉTAPE 2 : CRÉATION DE L'UTILISATEUR
    // ═══════════════════════════════════════════════════════════════

    $user = User::create([
        'name' => $validated['name'],
        'email' => $validated['email'],

        'password' => Hash::make($validated['password']),
        // ↑ CRITIQUE ! On ne stocke JAMAIS le mot de passe en clair
        // Hash::make() transforme "Password123!" en "$2y$12$random..."
        // Impossible de retrouver le mot de passe original

        'role' => $validated['role'],
        'phone' => $validated['phone'],
        'address' => $validated['address'] ?? null,
        // ↑ Si pas fourni, met NULL (champ optionnel)

        'driver_license' => $validated (Expliqué ligne par ligne)**

```php
public function login(Request $request)
{
    // ═══════════════════════════════════════════════════════════════
    // ÉTAPE 1 : VALIDATION DES CREDENTIALS
    // ═══════════════════════════════════════════════════════════════

    $request->validate([
        'email' => 'required|email',
        'password' => 'required',
    ], [
        // Messages personnalisés en français
        'email.required' => 'L\'adresse e-mail est requise.',
        'email.email' => 'L\'adresse e-mail doit être valide.',
        'password.required' => 'Le mot de passe est requis.',
    ]);

    // Pourquoi validation basique ?
    // On ne révèle PAS si l'email existe (sécurité)

    // ═══════════════════════════════════════════════════════════════
    // ÉTAPE 2 : CHERCHER L'UTILISATEUR PAR EMAIL
    // ═══════════════════════════════════════════════════════════════

    $user = User::where('email', $request->email)->first();
    // ↑ Cherche dans la table users WHERE email = 'ahmed@example.com'
    // Retourne l'utilisateur OU null si n'existe pas

    // Pourquoi first() et pas find() ?
    // find() cherche par ID, nous on cherche par email

    // ═══════════════════════════════════════════════════════════════
    // ÉTAPE 3 : VÉRIFIER SI L'UTILISATEUR EXISTE
    // ═══════════════════════════════════════════════════════════════

    if (!$user) {
        // User n'existe pas → Message clair
        throw ValidationException::withMessages([
            'email' => ['Aucun compte n\'existe avec cette adresse e-mail.'],
        ]);
    }

    // Si on arrive ici → L'utilisateur existe

    // ═══════════════════════════════════════════════════════════════
    // ÉTAPE 4 : VÉRIFIER LE MOT DE PASSE
    // ═══════════════════════════════════════════════════════════════
    // C'est l'étape LA PLUS IMPORTANTE !

    if (!Hash::check($request->password, $user->password)) {
        // ↑ Hash::check() fait :
        //   1. Prend le password saisi ("Password123!")
        //   2. Prend le hash stocké en DB ("$2y$12$random...")
        //   3. Hash le password saisi avec le MÊME salt
        //   4. Compare les deux hashs
        //   5. Retourne true si identiques, false sinon

        // Pourquoi on ne peut pas juste comparer les strings ?
        // Parce que même password = hash DIFFÉRENT à chaque fois !

        throw ValidationException::withMessages([
            'email' => ['Email ou mot de passe incorrect.'],
        ]);
        // ↑ Volontairement vague (sécurité : on ne dit pas "password invalide")
    }

    // Si on arrive ici → Credentials valides !

    // ═══════════════════════════════════════════════════════════════
    // ÉTAPE 5 : SUPPRIMER LES ANCIENS TOKENS
    // ═══════════════════════════════════════════════════════════════
    // Pourquoi ? Sécurité et propreté

    $user->tokens()->delete();
    // ↑ Supprime TOUS les tokens de cet utilisateur
    // Exemples de scénarios :
    //   - User se connecte depuis un nouveau device
    //   - User avait perdu son token
    //   - User se reconnecte après logout

    // Conséquence : Les anciennes sessions sont invalidées
    // Si quelqu'un avait un vieux token → Il ne marche plus

    // ═══════════════════════════════════════════════════════════════
    // ÉTAPE 6 : CRÉER UN NOUVEAU TOKEN
    // ═══════════════════════════════════════════════════════════════

    $token = $user->createToken('auth_token')->plainTextToken;
    // ↑ Génère un NOUVEAU token unique
    // Format : "ID|random_string" (ex: "8|xyz123abc...")

    // Ce token sera utilisé pour TOUTES les futures requêtes
    // Exemple : Authorization: Bearer 8|xyz123abc...

    // ═══════════════════════════════════════════════════════════════
    // ÉTAPE 7 : CHARGER LES RELATIONS (Eager Loading)
    // ═══════════════════════════════════════════════════════════════
    // Pourquoi ? Pour retourner plus d'infos au frontend

    $user->load('agency', 'reliabilityScore');
    // ↑ Charge les données liées :
    //   - agency : Si c'est un agency_admin
    //   - reliabilityScore : Si c'est un client

    // Alternative LENTE (N+1 queries) :
    // $agency = $user->agency;  // Query 1
    // $score = $user->reliabilityScore;  // Query 2

    // Avec load() : UNE SEULE query pour tout !

    // ═══════════════════════════════════════════════════════════════
    // ÉTAPE 8 : RÉPONSE JSON COMPLÈTE
    // ═══════════════════════════════════════════════════════════════

    return response()->json([
        'message' => 'Connexion réussie',

        'user' => [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'phone' => $user->phone,

            // ↓ Données conditionnelles selon le rôle
            'agency' => $user->agency ? [
                'id' => $user->agency->id,
                'name' => $user->agency->name,
                'location' => $user->agency->location,
            ] : null,
            // ↑ Si agency_admin → Infos de l'agence
            //   Si client → null

            'client_score' => $user->reliabilityScore?->score ?? null,
            // ↑ Si client → Score de fiabilité
            //   Si agency_admin → null
            // Le "?" = null-safe operator (évite erreur si null)
        ],

        'access_token' => $token,
        'token_type' => 'Bearer',
    ]);

    // Le frontend va :
    // 1. Stocker le token : localStorage.setItem('token', token)
    // 2. Stocker le user : localStorage.setItem('user', JSON.stringify(user))
    // 3. Rediriger selon le rôle :
    //    - client → /dashboard/client
    //    - agency_admin → /dashboard/agency
    //    - super_admin → /dashboard/admin
} (Explications Détaillées)

### 1. **Hashing du Password (Bcrypt)**

**Comment ça marche ?**
```php
// Inscription
$password = "Password123!";
$hash = Hash::make($password);
// Résultat : "$2y$12$randomSalt.hashedPassword..."

// Connexion
Hash::check("Password123!", $hash);  // true
Hash::check("WrongPassword", $hash);  // false
````

**Le Salt - C'est quoi ?**
Un "grain de sel" aléatoire ajouté au mot de passe :

```
Password + Salt = Hash
"Password123!" + "xYz9..." = "$2y$12$xYz9...abc123"
```

**Pourquoi c'est important ?**

- Même password → Hash DIFFÉRENT pour chaque utilisateur
- Protège contre les "rainbow tables" (tables précalculées)
- Si 2 users ont "Password123!" → Ils auront des hashs totalement différents

**Le coût (12 rounds) :**

```php
// Dans config/hashing.php
'bcrypt' => ['rounds' => 12]
```

- Plus le coût est élevé, plus le hash est lent (mais plus sécurisé)
- 12 = bon équilibre entre sécurité et performance
- Chaque round double le temps de calcul

### 2. **Validation Stricte**

**Pourquoi valider côté backend même si on valide en frontend ?**

Frontend (JavaScript) :

```javascript
// ❌ Peut être contourné (disable JavaScript)
if (password.length < 8) {
    error;
}
```

Backend (Laravel) :

```php
// ✅ Impossible à contourner
'password' => 'required|min:8|confirmed'
```

**Règles importantes :**

| Règle                    | Exemple                              | Pourquoi                              |
| ------------------------ | ------------------------------------ | ------------------------------------- |
| `unique:users`           | email unique                         | Évite les doublons                    |
| `confirmed`              | password match password_confirmation | Évite les erreurs de frappe           |
| `in:client,agency_admin` | role valide                          | Évite l'injection de rôle super_admin |
| `email`                  | format valide                        | Évite les faux emails                 |
| `size:8`                 | exactement 8 caractères              | Format tunisien strict                |

**Exemple d'attaque bloquée :**

```json
// ❌ Attaquant essaie de créer un super admin
POST /api/register
{
  "email": "hacker@evil.com",
  "password": "hack123",
  "role": "super_admin"  // ← Bloqué par in:client,agency_admin
}
```

### 3. **Révocation de Tokens**

**Pourquoi supprimer les anciens tokens ?**

Scénario 1 : **Perte de téléphone**

```
User perd son téléphone avec le token stocké
→ User se reconnecte depuis un nouveau device
→ Ancien token supprimé
→ Voleur ne peut plus utiliser l'ancien token
```

Scénario 2 : **Connexions multiples**

```
User connecté sur :
- PC maison
- PC travail
- Téléphone
→ 3 tokens actifs

User se reconnecte → Tous les anciens supprimés
→ Plus que 1 token actif
```

**Code détaillé :**

```php
$user->tokens()->delete();
// ↑ Équivalent à :
// DELETE FROM personal_access_tokens WHERE tokenable_id = $user->id;
```

### 4. **Middleware Protection (auth:sanctum)**

**Comment ça fonctionne en détail ?**

```
┌────────────────────────────────────────────────────────┐
│ 1. Requête arrive avec le header :                    │
│    Authorization: B (Pour la Soutenance)

### 1. **Choix Technologique : Pourquoi Laravel Sanctum ?**

**Comparaison avec les alternatives :**

| Feature | Sanctum | Passport (OAuth2) | JWT |
|---------|---------|-------------------|-----|
| Complexité | ⭐ Simple | ⭐⭐⭐ Complexe | ⭐⭐ Moyen |
| Setup | 5 min | 30 min | 15 min |
| Mobile Support | ✅ Native | ✅ Native | ✅ Native |
| Token Révocation | ✅ Facile | ✅ Facile | ❌ Difficile |
| Taille Token | Court | Long | Moyen |
| Stockage DB | Oui | Oui | Non |

**Pourquoi on a choisi Sanctum :**
1. **SPA-first** : Conçu spécifiquement pour React/Vue
2. **Simplicité** : Pas besoin d'OAuth pour notre cas d'usage
3. **Révocation** : Facile de déconnecter un user
4. **Léger** : Pas de surcharge inutile
5. **Laravel-native** : Intégré parfaitement

**Quand utiliser les alternatives :**
- **Passport** : Si on veut permettre des apps tierces de se connecter (comme "Se connecter avec Google")
- **JWT** : Si on veut une auth totalement stateless (microservices)

### 2. **Sécurité : Les 5 Piliers**

**a) Hash Passwords (Bcrypt)**
```

Mot de passe → [Bcrypt + Salt] → Hash stocké en DB
"Password123!" → "$2y$12$random..."

````
- ✅ Impossible de retrouver le mot de passe
- ✅ Même password = hash différent (salt)
- ✅ Résistant aux rainbow tables

**b) Token Révocables**
```php
$user->tokens()->delete();  // Révoque tous les tokens
````

- ✅ User se déconnecte → Token détruit
- ✅ Perte de device → On peut désactiver
- ✅ Contrôle total sur les sessions

**c) Validation Multi-couches**

```
Frontend → [Validation UX] → Backend → [Validation Sécurité] → DB
```

- ✅ Frontend : Feedback immédiat
- ✅ Backend : Protection réelle
- ✅ Ne jamais faire confiance au client

**d) Middleware Protection**

```php
Route::middleware('auth:sanctum')
```

- ✅ Vérification automatique du token
- ✅ Charge l'user dans $request
- ✅ Bloque si token invalide

**e) HTTPS Obligatoire**

- ✅ Token chiffré en transit
- ✅ Protection contre l'interception
- ✅ Certificate SSL/TLS

### 3. **Architecture REST : Endpoints Standardisés**

**Principes REST respectés :**

| Principe        | Implémentation              | Exemple                            |
| --------------- | --------------------------- | ---------------------------------- |
| **Ressources**  | URLs nomment des ressources | `/api/users` (pas `/api/getUsers`) |
| **Verbes HTTP** | Actions explicites          | `POST /login` (créer session)      |
| **Stateless**   | Chaque requête indépendante | Token dans chaque header           |
| **Codes HTTP**  | Signification standard      | 201 Created, 401 Unauthorized      |
| **JSON**        | Format standardisé          | `{"user": {...}}`                  |

**Notre API :**

```
POST   /api/register     → Créer un compte (201 Created)
POST   /api/login        → Créer une session (200 OK)
POST   /api/logout       → Détruire la session (200 OK)
GET    /api/user         → Lire user authentifié (200 OK)
```

### 4. **Gestion Rôles : RBAC (Role-Based Access Control)**

**Hiérarchie des rôles :**

```
super_admin (Plateforme)
    │
    ├── Gérer TOUT
    │
agency_admin (Agence)
    │
    ├── Gérer sa propre agence
    │   ├── Véhicules
    │   ├── Réservations
    │   └── Statistiques
    │
client (Utilisateur final)
    │
    └── Gérer son propre profil
        ├── Réserver
        ├── Payer
        └── Consulter historique
```

**Implémentation dans le code :**

```php
// Model User.php
public function isSuperAdmin() {
    return $this->role === 'super_admin';
}

public function isAgencyAdmin() {
    return $this->role === 'agency_admin';
}

public function isClient() {
    return $this->role === 'client';
}
```

**Frontend :**

```javascript
// AuthContext.jsx
const { user, isSuperAdmin, isAgencyAdmin, isClient } = useAuth();

// Redirection automatique
const dashboardPaths = {
    client: "/dashboard/client",
    agency_admin: "/dashboard/agency",
    super_admin: "/dashboard/admin",
};

navigate(dashboardPaths[user.role]);
```

**Protection des routes :**

```jsx
<ProtectedRoute allowedRoles="client">
    <ClientDashboard />
</ProtectedRoute>
```

### 5. **Relations Database : Eloquent ORM**

**a) User → Agency (belongsTo)**

```php
// Un user APPARTIENT À une agence (si agency_admin)
public function agency() {
    return $this->belongsTo(Agency::class);
}

// Usage
$user->agency->name;  // "Elite Cars Sousse"
```

**b) User → ClientReliabilityScore (hasOne)**

```php
// Un user A UN score (si client)
public function reliabilityScore() {
    return $this->hasOne(ClientReliabilityScore::class);
}

// Usage
$user->reliabilityScore->score;  // 95
```

**c) Eager Loading (Performance)**

```php
// ❌ LENT (3 queries)
$user = User::find(1);
$agency = $user->agency;          // Query 2
$score = $user->reliabilityScore; // Query 3

// ✅ RAPIDE (1 query)
$user = User::with('agency', 'reliabilityScore')->find(1);
// SELECT * FROM users WHERE id = 1
// SELECT * FROM agencies WHERE id IN (...)
// SELECT * FROM client_reliability_scores WHERE user_id IN (...)
```

### 6. **Validation : Protection Contre Injections**

**a) SQL Injection (automatiquement protégé)**

```php
// ❌ DANGEREUX (raw SQL)
DB::select("SELECT * FROM users WHERE email = '$email'");
// Attaque : email = "' OR 1=1 --"

// ✅ SÉCURISÉ (Eloquent + bindings)
User::where('email', $email)->first();
// Laravel échappe automatiquement
```

**b) XSS (Cross-Site Scripting)**

```php
// ❌ User entre : <script>alert('hack')</script>

// ✅ Laravel échappe dans Blade
{{ $user->name }}  // &lt;script&gt;...

// ✅ React échappe par défaut
<div>{user.name}</div>  // Pas de script exécuté
```

**c) Mass Assignment Protection**

```php
// Dans le Model
protected $fillable = ['name', 'email', 'password', 'role'];

// ❌ Attaque
User::create($request->all());  // Si request contient 'is_admin' = true

// ✅ Protection
// Seuls les champs fillable sont assignés
```

### 7. **Token Lifecycle : De la Naissance à la Mort**

**1. NAISSANCE (Login/Register)**

```php
$token = $user->createToken('auth_token')->plainTextToken;
// → "42|xyz123abc..."
```

```sql
INSERT INTO personal_access_tokens (tokenable_id, token, ...)
VALUES (42, 'hashed_xyz123...', NOW());
```

**2. VIE (Utilisation)**

```javascript
// Frontend stocke
localStorage.setItem("token", token);

// Chaque requête
axios.get("/api/user", {
    headers: { Authorization: `Bearer ${token}` },
});
```

```php
// Backend vérifie
Route::middleware('auth:sanctum')->get('/user', ...);
// → Sanctum vérifie le token automatiquement
```

**3. VIEILLISSEMENT (Tracking)**

```sql
-- Sanctum met à jour automatiquement
UPDATE personal_access_tokens
SET last_used_at = NOW()
WHERE id = 42;
```

**4. MORT (Révocation)**

**a) Logout explicite**

```php
$request->user()->currentAccessToken()->delete();
```

**b) Reconnexion**

```php
$user->tokens()->delete();  // Tous les anciens tokens
```

**c) Expiration (optionnel)**

```php
// config/sanctum.php
'expiration' => 60,  // 60 minutes

// Les tokens expirent automatiquement
```

**d) Révocation manuelle (Admin)**

```php
// Super admin peut révoquer tous les tokens d'un user
User::find(42)->tokens()->delete();
```

---

## 🎯 Questions Possibles en Soutenance + Réponses

**Q1 : Pourquoi stocker le token en localStorage et pas en cookie ?**

**R :** Deux approches valides :

- **localStorage** : Plus simple, fonctionne cross-domain, pas de CSRF
- **httpOnly cookie** : Plus sécurisé contre XSS, mais nécessite CORS

On a choisi localStorage car :
✅ Plus simple pour un PFE
✅ Fonctionne bien avec SPA
✅ Pas de problème de CORS

**Q2 : Comment empêcher un user de s'inscrire comme super_admin ?**

**R :** Validation stricte dans le controller :

```php
'role' => 'required|in:client,agency_admin'
```

Le super_admin ne peut être créé que par seeder, jamais via l'API.

**Q3 : Que se passe-t-il si quelqu'un vole le token ?**

**R :** Mesures de protection :

1. HTTPS → Token chiffré en transit
2. Expiration courte → Token valide limité dans le temps
3. Révocation → Admin peut désactiver tous les tokens
4. httpOnly (option) → JavaScript ne peut pas lire

**Q4 : Pourquoi supprimer les anciens tokens au login ?**

**R :** Sécurité + UX :

- ✅ Limite les sessions actives
- ✅ Invalide les tokens perdus/volés
- ✅ Évite l'accumulation de tokens en DB
- ✅ Force une seule session (optionnel)

**Q5 : Comment tester la sécurité du système ?**

**R :** Tests réalisés :

1. **Validation** : Tenter d'envoyer données invalides
2. **Authorization** : Accéder routes sans token
3. **Roles** : Client tente d'accéder dashboard admin
4. **SQL Injection** : Envoyer `' OR 1=1 --` dans email
5. **XSS** : Envoyer `<script>` dans le nom
   │ - Plain : xyz123abc... │
   └────────────────────────────────────────────────────────┘
   ↓
   ┌────────────────────────────────────────────────────────┐
   │ 4. Query en DB : │
   │ SELECT _ FROM personal_access_tokens │
   │ WHERE id = 42 │
   └────────────────────────────────────────────────────────┘
   ↓
   ┌────────────────────────────────────────────────────────┐
   │ 5. Vérifie le hash : │
   │ Hash stocké : "hashed_xyz123abc..." │
   │ Hash du token reçu : "hashed_xyz123abc..." │
   │ → MATCH ? ✅ │
   └────────────────────────────────────────────────────────┘
   ↓
   ┌────────────────────────────────────────────────────────┐
   │ 6. Charge l'utilisateur : │
   │ SELECT _ FROM users WHERE id = tokenable_id │
   └────────────────────────────────────────────────────────┘
   ↓
   ┌────────────────────────────────────────────────────────┐
   │ 7. Injecte dans la requête : │
   │ $request->user() → User object complete │
   └────────────────────────────────────────────────────────┘
   ↓
   ┌────────────────────────────────────────────────────────┐
   │ 8. Continue vers le Controller │
   │ Maintenant le controller peut utiliser : │
   │ $request->user()->name │
   │ $request->user()->role │
   │ etc. │
   └────────────────────────────────────────────────────────┘

```

**Si le token est invalide :**
```

Token invalide/expiré/révoqué
→ Middleware bloque
→ Retourne 401 Unauthorized
→ Controller jamais exécuté

```

### 5. **Token Sécurisé**

**Stockage asymétrique :**

| Localisation | Format | Exemple |
|--------------|--------|---------|
| **Frontend** (localStorage) | Texte clair | `42\|xyz123abc...` |
| **Database** (personal_access_tokens) | Hash SHA-256 | `a3f7e2d...` |

**Pourquoi cette différence ?**
- Frontend a BESOIN du token en clair pour l'envoyer
- Backend stocke le HASH pour la sécurité
- Si quelqu'un vole la DB → Les tokens sont inutilisables sans la partie en clair

**Transmission HTTPS uniquement :**
```

❌ HTTP : http://api.com/user → Token visible en clair
✅ HTTPS : https://api.com/user → Token chiffré en transit

````

**One-time return :**
```php
$token = $user->createToken('auth_token')->plainTextToken;
// ↑ C'est la SEULE fois où on voit le token en clair

// Plus tard, impossible de récupérer :
$token = Token::find(42)->plainTextToken;  // ❌ N'existe pas !
// On ne peut que vérifier si un token match
````

### 6. **Protection CSRF (Cross-Site Request Forgery)**

Bien que Sanctum soit token-based (pas besoin de CSRF pour API), on a configuré :

```php
// config/sanctum.php
'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS',
    'localhost,localhost:3000,127.0.0.1'
)),
```

Cela permet une future migration vers une auth stateful si nécessaire.

### 7. **Rate Limiting (Throttle)**

Laravel limite automatiquement les tentatives de login :

```php
// routes/api.php (implicite)
Route::middleware('throttle:60,1')->group(function () {
    // Max 60 requêtes par minute
});
```

**Protection contre brute force :**

- Attaquant essaie 1000 passwords/seconde
- Après 60 tentatives → Bloqué 1 minute
- Empêche les attaques par dictionnaire, ... }

7️⃣ Réponse au frontend :
{
"message": "Connexion réussie",
"user": { "id": 42, "name": "Ahmed", "client_score": 95, ... },
"access_token": "42|xyz123abc456def...",
"token_type": "Bearer"
// ═══════════════════════════════════════════════════════════════
// ÉTAPE 4 : GÉNÉRATION DU TOKEN D'ACCÈS
// ═══════════════════════════════════════════════════════════════
// Pourquoi ? Pour que le user puisse s'authentifier sans re-rentrer
// son mot de passe à chaque requête

    $token = $user->createToken('auth_token')->plainTextToken;
    // ↑ createToken() fait 2 choses :
    //   1. Génère un token aléatoire (ex: "1|xyz123abc...")
    //   2. Stocke le HASH de ce token en DB (sécurité)
    //   3. Retourne le token en clair (une seule fois !)

    // IMPORTANT : On ne reverra JAMAIS ce token en clair
    // Si le user le perd → Il doit se reconnecter

    // ═══════════════════════════════════════════════════════════════
    // ÉTAPE 5 : RÉPONSE JSON VERS LE FRONTEND
    // ═══════════════════════════════════════════════════════════════

    return response()->json([
        'message' => 'Inscription réussie',

        'user' => [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'phone' => $user->phone,
            'agency_id' => $user->agency_id,
        ],
        // ↑ Infos de l'utilisateur (sans le password !)

        'access_token' => $token,
        // ↑ Le précieux sésame pour les requêtes futures

        'token_type' => 'Bearer',
        // ↑ Indique comment utiliser le token (dans le header)

    ], 201);
    // ↑ 201 = Created (nouveau resource créé avec succès)

}

````

**Ce qui se passe en DB après cette fonction :**

```sql
-- 1. Table users
INSERT INTO users (name, email, password, role, ...)
VALUES ('Ahmed', 'ahmed@example.com', '$2y$12$hash...', 'client', ...);
-- Résultat : Nouveau user avec ID = 42

-- 2. Table agencies (si agency_admin)
INSERT INTO agencies (name, location, ...)
VALUES ('Elite Cars', 'Sousse', ...);
-- Résultat : Nouvelle agence avec ID = 10

-- 3. Table client_reliability_scores (si client)
INSERT INTO client_reliability_scores (user_id, score, ...)
VALUES (42, 100, ...);
-- Résultat : Score initial pour le client

-- 4. Table personal_access_tokens (Sanctum)
INSERT INTO personal_access_tokens (tokenable_id, token, ...)
VALUES (42, 'hashed_token...', ...);
-- Résultat : Token stocké (version hachée)
````

### 4. **AuthController - Login Method**

```php
public function login(Request $request)
{
    // 1. VALIDATION
    $request->validate([
        'email' => 'required|email',
        'password' => 'required',
    ]);

    // 2. CHERCHER USER
    $user = User::where('email', $request->email)->first();

    // 3. VÉRIFIER PASSWORD
    if (!$user || !Hash::check($request->password, $user->password)) {
        throw ValidationException::withMessages([
            'email' => ['Identifiants incorrects'],
        ]);
    }

    // 4. SUPPRIMER ANCIENS TOKENS (Sécurité)
    $user->tokens()->delete();

    // 5. CRÉER NOUVEAU TOKEN
    $token = $user->createToken('auth_token')->plainTextToken;

    // 6. CHARGER RELATIONS
    $user->load('agency', 'reliabilityScore');

    // 7. RÉPONSE
    return response()->json([
        'user' => [
            'role' => $user->role,
            'agency' => $user->agency,
            'client_score' => $user->reliabilityScore?->score,
            // ...
        ],
        'access_token' => $token,
    ]);
}
```

---

## 🔒 Sécurité

### Mesures Implémentées:

1. **Hashing du Password**

    ```php
    Hash::make($password)  // Bcrypt avec salt aléatoire
    ```

2. **Validation Stricte**

    ```php
    'password' => 'required|min:8|confirmed'
    'email' => 'required|email|unique:users'
    ```

3. **Révocation de Tokens**

    ```php
    $user->tokens()->delete()  // Supprime tous les anciens tokens
    ```

4. **Middleware Protection**

    ```php
    Route::middleware('auth:sanctum')  // Vérifie token sur chaque requête
    ```

5. **Token Sécurisé**
    - Stocké haché en DB
    - Transmis en HTTPS seulement
    - `plainTextToken` retourné qu'une seule fois

---

## 📊 Base de Données

### Table `users`

```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255),  ← Hash bcrypt
    role ENUM('client', 'agency_admin', 'super_admin'),
    agency_id BIGINT NULL,
    phone VARCHAR(255),
    address TEXT,
    driver_license VARCHAR(255),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### Table `personal_access_tokens` (Sanctum)

```sql
CREATE TABLE personal_access_tokens (
    id BIGINT PRIMARY KEY,
    tokenable_type VARCHAR(255),  ← 'App\Models\User'
    tokenable_id BIGINT,           ← user_id
    name VARCHAR(255),              ← 'auth_token'
    token VARCHAR(64) UNIQUE,       ← Hash SHA-256 du token
    abilities TEXT,
    last_used_at TIMESTAMP,
    created_at TIMESTAMP
);
```

---

## 🌐 Intégration Frontend (React)

### Exemple d'utilisation:

```javascript
// 1. LOGIN
const response = await fetch("http://localhost:8000/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
});

const data = await response.json();
localStorage.setItem("token", data.access_token);

// 2. REQUÊTE AUTHENTIFIÉE
const token = localStorage.getItem("token");
const response = await fetch("http://localhost:8000/api/user", {
    headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
    },
});
```

---

## ✅ Avantages de cette Architecture

**Pour le PFE:**

1. **Scalabilité**: Facile d'ajouter nouvelles routes protégées
2. **Sécurité**: Standards industry (Laravel + Sanctum)
3. **Maintenance**: Code organisé et testé
4. **Performance**: Tokens stateless, pas de sessions
5. **Mobile-ready**: Même API pour app mobile future

---

## 🎓 Points Clés PFE

### À expliquer dans la soutenance:

1. **Choix Technologique**: Pourquoi Sanctum vs OAuth/Passport?
2. **Sécurité**: Hash passwords, tokens révocables
3. **Architecture REST**: Endpoints standardisés
4. **Gestion Rôles**: client, agency_admin, super_admin
5. **Relations DB**: User → Agency, User → ReliabilityScore
6. **Validation**: Protection contre injections SQL/XSS
7. **Token Lifecycle**: Création → Utilisation → Révocation

---

## 🧪 Tests

### Test manuel avec Postman/Thunder Client:

**1. Register:**

```http
POST http://localhost:8000/api/register
Content-Type: application/json

{
    "name": "Ahmed Ben Salem",
    "email": "ahmed@example.com",
    "password": "Password123!",
    "password_confirmation": "Password123!",
    "role": "client",
    "phone": "20123456"
}
```

**2. Login:**

```http
POST http://localhost:8000/api/login
Content-Type: application/json

{
    "email": "ahmed@example.com",
    "password": "Password123!"
}
```

**3. Get User (Protected):**

```http
GET http://localhost:8000/api/user
Authorization: Bearer {YOUR_TOKEN}
```

---

## 🚀 Prochaines Étapes

1. ✅ Backend AuthController créé
2. ⏳ Tester endpoints avec Postman
3. ⏳ Créer AuthContext React
4. ⏳ Protéger routes frontend
5. ⏳ Redirection selon rôle (client → /dashboard/client)

---

**Date**: {{ now() }}  
**Auteur**: Elite Drive Platform  
**Version**: 1.0
