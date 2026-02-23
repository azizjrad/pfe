# 🔗 Connexion Login/Register avec l'API Authentication

## 📋 Vue d'ensemble de l'architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌───────────────────┐
│  Login.jsx      │ ──────→ │  AuthContext.jsx │ ──────→ │  api.js           │
│  Register.jsx   │         │  (State Global)   │         │  (Axios Service)  │
└─────────────────┘         └──────────────────┘         └───────────────────┘
                                                                   │
                                                                   ↓
                                                          ┌───────────────────┐
                                                          │ Laravel API       │
                                                          │ AuthController.php│
                                                          └───────────────────┘
                                                                   │
                                                                   ↓
                                                          ┌───────────────────┐
                                                          │ MySQL Database    │
                                                          │ - users           │
                                                          │ - agencies        │
                                                          │ - access_tokens   │
                                                          └───────────────────┘
```

---

## 🔐 PARTIE 1 : INSCRIPTION (Register.jsx → API)

### **Étape 1 : L'utilisateur remplit le formulaire**

**Fichier** : `frontend/src/pages/Register.jsx`

**State du formulaire** :

```javascript
const [formData, setFormData] = useState({
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  role: "client", // ou "agency_admin"
  password: "",
  confirmPassword: "",
  address: "",
  driverLicense: "", // pour clients
  agencyName: "", // pour agences
  agencyLocation: "", // pour agences
  agreeToTerms: false,
});
```

**Fonction de gestion des changements** :

```javascript
onChange={(e) => setFormData({ ...formData, email: e.target.value })}
```

---

### **Étape 2 : Validation côté client**

**Fonctions de validation** dans `Register.jsx` :

```javascript
// 1. Validation de l'email
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "Adresse e-mail invalide";
  }
  return "";
};

// 2. Validation du téléphone (8 chiffres)
const validatePhone = (phone) => {
  if (phone.length !== 8) {
    return "Le numéro doit contenir exactement 8 chiffres";
  }
  return "";
};

// 3. Validation du mot de passe
const validatePassword = (password) => {
  const hasUppercase = /[A-Z]/.test(password);
  const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (password.length < 8) {
    return "Le mot de passe doit contenir au moins 8 caractères";
  }
  if (!hasUppercase) {
    return "Le mot de passe doit contenir au moins une lettre majuscule";
  }
  if (!hasSymbol) {
    return "Le mot de passe doit contenir au moins un symbole";
  }
  return "";
};
```

**Validation au submit** :

```javascript
const handleSubmit = async (e) => {
  e.preventDefault();

  // Valider tous les champs
  const emailError = validateEmail(formData.email);
  const phoneError = validatePhone(formData.phone);
  const passwordError = validatePassword(formData.password);

  if (emailError || phoneError || passwordError) {
    setErrors({
      email: emailError,
      phone: phoneError,
      password: passwordError,
    });
    return; // ❌ Arrêter si erreurs
  }

  // ✅ Continuer si tout est valide
};
```

---

### **Étape 3 : Préparation des données pour l'API**

**Format des données** dans `handleSubmit` :

```javascript
// Préparer les données selon le format Laravel
const registrationData = {
  name: `${formData.firstName} ${formData.lastName}`, // Concaténation
  email: formData.email,
  password: formData.password,
  password_confirmation: formData.confirmPassword, // Laravel validation
  role: formData.role, // "client" ou "agency_admin"
  phone: formData.phone,
  address: formData.address,
  driver_license: formData.driverLicense,
};

// ➕ Ajouter les champs spécifiques pour les agences
if (formData.role === "agency_admin") {
  registrationData.agency_name = formData.agencyName;
  registrationData.agency_location = formData.agencyLocation;
}
```

---

### **Étape 4 : Appel du AuthContext**

**Fonction** : `register()` du Context

```javascript
// Dans Register.jsx
const { register: registerUser } = useAuth();

const response = await registerUser(registrationData);
```

**Ce qui se passe dans `AuthContext.jsx`** :

```javascript
// frontend/src/contexts/AuthContext.jsx

const register = async (userData) => {
  setError(null); // Reset des erreurs

  try {
    // 📡 Appel du service API
    const response = await authService.register(userData);

    // 💾 Mise à jour du state global
    setUser(response.user);

    return response;
  } catch (err) {
    // ❌ Gestion des erreurs
    const errorMessage =
      err.response?.data?.message || "Erreur lors de l'inscription";
    setError(errorMessage);
    throw err;
  }
};
```

---

### **Étape 5 : Service API (Axios)**

**Fichier** : `frontend/src/services/api.js`

**Configuration Axios** :

```javascript
const api = axios.create({
  baseURL: "http://localhost:8000/api", // URL Laravel
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});
```

**Fonction register** :

```javascript
export const authService = {
  register: async (userData) => {
    // 📤 POST request vers Laravel
    const response = await api.post("/register", userData);

    // 💾 Stocker le token dans localStorage
    if (response.data.access_token) {
      localStorage.setItem("token", response.data.access_token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }

    return response.data;
  },
};
```

**Interceptor - Ajout automatique du token** :

```javascript
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`; // 🔑 Token ajouté
  }
  return config;
});
```

**Interceptor - Gestion erreur 401** :

```javascript
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token invalide → Déconnexion
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);
```

---

### **Étape 6 : Backend Laravel (AuthController)**

**Fichier** : `backend/app/Http/Controllers/Api/AuthController.php`

**Fonction register()** :

```php
public function register(Request $request)
{
    // 1️⃣ VALIDATION DES DONNÉES
    $validated = $request->validate([
        'name' => 'required|string|max:255',
        'email' => 'required|string|email|max:255|unique:users',
        'password' => 'required|string|min:8|confirmed',
        'role' => 'required|in:client,agency_admin',
        'phone' => 'required|string|size:8',
        'address' => 'nullable|string|max:500',
        'driver_license' => 'nullable|string|max:50',
        'agency_name' => 'required_if:role,agency_admin|string|max:255',
        'agency_location' => 'required_if:role,agency_admin|string|max:255',
    ]);

    // 2️⃣ CRÉATION DE L'UTILISATEUR
    $user = User::create([
        'name' => $validated['name'],
        'email' => $validated['email'],
        'password' => Hash::make($validated['password']),  // 🔒 Hash bcrypt
        'role' => $validated['role'],
        'phone' => $validated['phone'],
        'address' => $validated['address'] ?? null,
        'driver_license' => $validated['driver_license'] ?? null,
    ]);

    // 3️⃣ LOGIQUE MÉTIER SELON LE RÔLE

    // Si AGENCE → Créer l'agence
    if ($validated['role'] === 'agency_admin') {
        $agency = Agency::create([
            'name' => $validated['agency_name'],
            'location' => $validated['agency_location'],
            'phone' => $validated['phone'],
            'email' => $validated['email'],
            'address' => $validated['address'] ?? '',
        ]);

        // Lier l'agence à l'utilisateur
        $user->agency_id = $agency->id;
        $user->save();
    }

    // Si CLIENT → Initialiser le score de fiabilité
    if ($validated['role'] === 'client') {
        ClientReliabilityScore::create([
            'user_id' => $user->id,
            'score' => 100,  // Score initial de 100
            'total_reservations' => 0,
            'cancelled_reservations' => 0,
            'late_returns' => 0,
        ]);
    }

    // 4️⃣ GÉNÉRATION DU TOKEN SANCTUM
    $token = $user->createToken('auth_token')->plainTextToken;

    // 5️⃣ RÉPONSE JSON
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
        'access_token' => $token,
        'token_type' => 'Bearer',
    ], 201);
}
```

---

### **Étape 7 : Base de données**

**Tables impactées** :

```sql
-- 1. Table users
INSERT INTO users (
  name, email, password, role, phone, address, driver_license, agency_id
) VALUES (
  'Ahmed Ben Ali',
  'ahmed@example.com',
  '$2y$12$hashedPassword...',  -- Hash bcrypt
  'client',
  '20123456',
  'Tunis',
  'TN123456',
  NULL
);

-- 2. Table agencies (si agency_admin)
INSERT INTO agencies (
  name, location, phone, email, address
) VALUES (
  'Elite Cars Sousse',
  'Avenue Hedi Chaker, Sousse',
  '70123456',
  'sami@agence.com',
  'Sousse Jawhara'
);

-- 3. Table client_reliability_scores (si client)
INSERT INTO client_reliability_scores (
  user_id, score, total_reservations
) VALUES (
  1,    -- user_id
  100,  -- Score initial
  0     -- Pas encore de réservations
);

-- 4. Table personal_access_tokens (Sanctum)
INSERT INTO personal_access_tokens (
  tokenable_type, tokenable_id, name, token, abilities
) VALUES (
  'App\\Models\\User',
  1,                        -- user_id
  'auth_token',
  'hashed_token_string...',  -- Hash SHA-256
  '["*"]'                    -- Toutes les permissions
);
```

---

### **Étape 8 : Retour vers le Frontend**

**Response Laravel** :

```json
{
  "message": "Inscription réussie",
  "user": {
    "id": 1,
    "name": "Ahmed Ben Ali",
    "email": "ahmed@example.com",
    "role": "client",
    "phone": "20123456",
    "agency_id": null
  },
  "access_token": "1|plaintextTokenString...",
  "token_type": "Bearer"
}
```

**Dans `api.js`** :

```javascript
if (response.data.access_token) {
  localStorage.setItem("token", response.data.access_token); // 💾 Stockage
  localStorage.setItem("user", JSON.stringify(response.data.user));
}
```

**Dans `AuthContext.jsx`** :

```javascript
setUser(response.user); // 🔄 Mise à jour du state global
```

**Dans `Register.jsx`** :

```javascript
// Redirection automatique selon le rôle
const dashboardPaths = {
  client: "/dashboard/client",
  agency_admin: "/dashboard/agency",
};

navigate(dashboardPaths[response.user.role]); // 🚀 Redirection
```

---

## 🔑 PARTIE 2 : CONNEXION (Login.jsx → API)

### **Étape 1 : L'utilisateur entre ses identifiants**

**Fichier** : `frontend/src/pages/Login.jsx`

**State du formulaire** :

```javascript
const [formData, setFormData] = useState({
  email: "",
  password: "",
  rememberMe: false,
});
```

---

### **Étape 2 : Soumission du formulaire**

**Fonction handleSubmit** :

```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setErrors({ email: "", password: "" }); // Reset erreurs

  try {
    // 📡 Appel du AuthContext
    const response = await login({
      email: formData.email,
      password: formData.password,
    });

    // 🚀 Redirection selon le rôle
    const dashboardPaths = {
      client: "/dashboard/client",
      agency_admin: "/dashboard/agency",
      super_admin: "/dashboard/admin",
    };

    navigate(dashboardPaths[response.user.role] || "/");
  } catch (err) {
    // ❌ Gestion des erreurs (voir section erreurs)
    if (err.response?.status === 422) {
      // Erreurs de validation
      const validationErrors = err.response.data.errors;
      setErrors({
        email: validationErrors.email?.[0] || "",
        password: validationErrors.password?.[0] || "",
      });
    } else if (err.response?.status === 401) {
      // Identifiants incorrects
      setErrors({
        email: "Email ou mot de passe incorrect",
        password: "",
      });
    }
  } finally {
    setLoading(false);
  }
};
```

---

### **Étape 3 : AuthContext - login()**

**Fichier** : `frontend/src/contexts/AuthContext.jsx`

```javascript
const login = async (credentials) => {
  setError(null);

  try {
    // 📡 Appel du service API
    const response = await authService.login(credentials);

    // 💾 Mise à jour du state
    setUser(response.user);

    return response;
  } catch (err) {
    const errorMessage =
      err.response?.data?.message || "Identifiants incorrects";
    setError(errorMessage);
    throw err; // Re-throw pour que Login.jsx puisse gérer
  }
};
```

---

### **Étape 4 : Service API - login()**

**Fichier** : `frontend/src/services/api.js`

```javascript
export const authService = {
  login: async (credentials) => {
    // 📤 POST request
    const response = await api.post("/login", credentials);

    // 💾 Stocker token et user
    if (response.data.access_token) {
      localStorage.setItem("token", response.data.access_token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }

    return response.data;
  },
};
```

---

### **Étape 5 : Backend Laravel - login()**

**Fichier** : `backend/app/Http/Controllers/Api/AuthController.php`

```php
public function login(Request $request)
{
    // 1️⃣ VALIDATION
    $request->validate([
        'email' => 'required|email',
        'password' => 'required',
    ], [
        'email.required' => 'L\'adresse e-mail est requise.',
        'email.email' => 'L\'adresse e-mail doit être valide.',
        'password.required' => 'Le mot de passe est requis.',
    ]);

    // 2️⃣ CHERCHER L'UTILISATEUR
    $user = User::where('email', $request->email)->first();

    // 3️⃣ VÉRIFIER SI UTILISATEUR EXISTE
    if (!$user) {
        throw ValidationException::withMessages([
            'email' => ['Aucun compte n\'existe avec cette adresse e-mail.'],
        ]);
    }

    // 4️⃣ VÉRIFIER LE MOT DE PASSE
    if (!Hash::check($request->password, $user->password)) {
        throw ValidationException::withMessages([
            'email' => ['Email ou mot de passe incorrect.'],
        ]);
    }

    // 5️⃣ SUPPRIMER LES ANCIENS TOKENS (Sécurité)
    $user->tokens()->delete();

    // 6️⃣ CRÉER UN NOUVEAU TOKEN
    $token = $user->createToken('auth_token')->plainTextToken;

    // 7️⃣ CHARGER LES RELATIONS
    $user->load('agency', 'reliabilityScore');

    // 8️⃣ RÉPONSE JSON
    return response()->json([
        'message' => 'Connexion réussie',
        'user' => [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'phone' => $user->phone,
            'agency' => $user->agency ? [
                'id' => $user->agency->id,
                'name' => $user->agency->name,
                'location' => $user->agency->location,
            ] : null,
            'client_score' => $user->reliabilityScore?->score ?? null,
        ],
        'access_token' => $token,
        'token_type' => 'Bearer',
    ]);
}
```

---

### **Étape 6 : Base de données (Login)**

```sql
-- 1. Chercher l'utilisateur
SELECT * FROM users WHERE email = 'ahmed@example.com';

-- 2. Vérifier le password (Hash::check en PHP)
-- Comparer le hash stocké avec Hash::check($input, $stored)

-- 3. Supprimer les anciens tokens
DELETE FROM personal_access_tokens WHERE tokenable_id = 1;

-- 4. Créer un nouveau token
INSERT INTO personal_access_tokens (
  tokenable_type, tokenable_id, name, token
) VALUES (
  'App\\Models\\User',
  1,
  'auth_token',
  'hashed_new_token...'
);

-- 5. Charger les relations (Eager loading)
SELECT * FROM agencies WHERE id = (SELECT agency_id FROM users WHERE id = 1);
SELECT * FROM client_reliability_scores WHERE user_id = 1;
```

---

## 🛡️ PARTIE 3 : ROUTES PROTÉGÉES

### **Étape 1 : ProtectedRoute Component**

**Fichier** : `frontend/src/components/ProtectedRoute.jsx`

```javascript
const ProtectedRoute = ({ children, allowedRoles = null }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  // 🔄 Afficher loader pendant chargement
  if (loading) {
    return <LoadingSpinner />;
  }

  // ❌ Rediriger si non authentifié
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // ❌ Vérifier les rôles autorisés
  if (allowedRoles) {
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    if (!roles.includes(user?.role)) {
      // Rediriger vers le bon dashboard
      const dashboardPaths = {
        client: "/dashboard/client",
        agency_admin: "/dashboard/agency",
        super_admin: "/dashboard/admin",
      };

      return <Navigate to={dashboardPaths[user?.role]} replace />;
    }
  }

  // ✅ Utilisateur autorisé
  return children;
};
```

---

### **Étape 2 : Utilisation dans App.jsx**

**Fichier** : `frontend/src/App.jsx`

```javascript
<AuthProvider>
  <Router>
    <Routes>
      {/* Routes publiques */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Routes protégées avec vérification de rôle */}
      <Route
        path="/dashboard/client"
        element={
          <ProtectedRoute allowedRoles="client">
            <ClientDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/agency"
        element={
          <ProtectedRoute allowedRoles="agency_admin">
            <AgencyDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/admin"
        element={
          <ProtectedRoute allowedRoles="super_admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  </Router>
</AuthProvider>
```

---

### **Étape 3 : Requête vers route protégée**

**Exemple** : Récupérer les données utilisateur

```javascript
// Dans ClientDashboard.jsx
useEffect(() => {
  const fetchUserData = async () => {
    const response = await api.get("/user"); // Route protégée
    setUserData(response.data);
  };

  fetchUserData();
}, []);
```

**Ce qui se passe** :

1. **Interceptor ajoute le token** :

```javascript
// api.js
config.headers.Authorization = `Bearer ${token}`;
```

2. **Request vers Laravel** :

```
GET http://localhost:8000/api/user
Authorization: Bearer 1|plaintextToken...
```

3. **Middleware Laravel** (`routes/api.php`) :

```php
Route::middleware('auth:sanctum')->get('/user', [AuthController::class, 'user']);
```

4. **Sanctum vérifie le token** :
   - Extrait le token du header
   - Hash et compare avec la DB
   - Charge l'utilisateur associé

5. **Controller exécute** :

```php
public function user(Request $request)
{
    $user = $request->user();  // User chargé par Sanctum
    $user->load('agency', 'reliabilityScore');

    return response()->json($user);
}
```

---

## 📊 FLUX COMPLET (Diagramme de séquence)

### **INSCRIPTION**

```
User → Register.jsx → AuthContext → api.js → Laravel → Database
 │         │             │            │         │          │
 │     Fill form     register()   POST       validate    INSERT
 │         │             │        /register    data      users
 │         │             │            │         │          │
 │         │             │            │      create      INSERT
 │         │             │            │      user      agencies/
 │         │             │            │         │      scores
 │         │             │            │         │          │
 │         │             │            │    generate      INSERT
 │         │             │            │      token     tokens
 │         │             │            │         │          │
 │         │             │        Response  {user,    Return
 │         │             │            ←    token}      data
 │         │             │            │         │          │
 │         │         setUser()    Store      │          │
 │         │             │         token      │          │
 │         │             │            │         │          │
 │     Navigate to   ←────────────────────────────────────
 │     /dashboard/
```

### **CONNEXION**

```
User → Login.jsx → AuthContext → api.js → Laravel → Database
 │        │           │            │         │          │
 │    Enter creds  login()     POST     validate     SELECT
 │        │           │        /login     email      users
 │        │           │            │         │          │
 │        │           │            │      check       WHERE
 │        │           │            │     password    email=?
 │        │           │            │         │          │
 │        │           │            │      delete     DELETE
 │        │           │            │    old tokens  tokens
 │        │           │            │         │          │
 │        │           │            │     create      INSERT
 │        │           │            │    new token   token
 │        │           │            │         │          │
 │        │           │            │      load      SELECT
 │        │           │            │    relations   relations
 │        │           │            │         │          │
 │        │           │        Response {user,    Return
 │        │           │            ←   token,     data
 │        │           │            │   agency}      │
 │        │       setUser()    Store      │          │
 │        │           │         token      │          │
 │        │           │            │         │          │
 │    Navigate to ←──────────────────────────────────────
 │    appropriate
 │    dashboard
```

### **ROUTE PROTÉGÉE**

```
User → Dashboard → api.js → Laravel → Database
 │        │          │         │          │
 │    Load page   GET /user   auth:     SELECT
 │        │       + token    sanctum    tokens
 │        │          │         │          │
 │        │          │      verify      WHERE
 │        │          │       token     token=?
 │        │          │         │          │
 │        │          │      load       SELECT
 │        │          │       user       users
 │        │          │         │          │
 │        │          │     Response   Return
 │        │          ←       {user}     data
 │        │          │         │          │
 │    Display   ←────────────────────────
 │    user data
```

---

## 🔧 FONCTIONS CLÉS PAR FICHIER

### **Register.jsx**

- `handleSubmit()` - Gère la soumission du formulaire
- `validateEmail()` - Valide le format email
- `validatePhone()` - Valide 8 chiffres
- `validatePassword()` - Valide complexité du mot de passe
- `handleEmailChange()` - Gère changement + validation email
- `handlePhoneChange()` - Gère changement + validation téléphone
- `handlePasswordChange()` - Gère changement + validation mot de passe

### **Login.jsx**

- `handleSubmit()` - Gère la connexion
- `onChange` handlers - Clear les erreurs quand l'user tape

### **AuthContext.jsx**

- `register(userData)` - Appelle l'API register
- `login(credentials)` - Appelle l'API login
- `logout()` - Déconnecte l'utilisateur
- `refreshUser()` - Recharge les données utilisateur
- `hasRole(role)` - Vérifie si user a un rôle
- `hasAnyRole(roles)` - Vérifie si user a un des rôles

### **api.js**

- `authService.register()` - POST /register
- `authService.login()` - POST /login
- `authService.logout()` - POST /logout
- `authService.getUser()` - GET /user
- `authService.isAuthenticated()` - Vérifie si token existe
- `authService.getCurrentUser()` - Récupère user du localStorage
- `request interceptor` - Ajoute Authorization header
- `response interceptor` - Gère erreur 401

### **AuthController.php**

- `register(Request $request)` - Crée un nouveau user
- `login(Request $request)` - Authentifie un user
- `logout(Request $request)` - Révoque le token actuel
- `user(Request $request)` - Retourne user authentifié

### **ProtectedRoute.jsx**

- `ProtectedRoute({ children, allowedRoles })` - Vérifie auth et rôles

---

## 🗄️ STOCKAGE DES DONNÉES

### **Frontend (localStorage)**

```javascript
// Après login/register
localStorage.setItem("token", "bearer_token_string");
localStorage.setItem(
  "user",
  JSON.stringify({
    id: 1,
    name: "Ahmed",
    email: "ahmed@example.com",
    role: "client",
  }),
);

// Récupération
const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user"));

// Suppression (logout)
localStorage.removeItem("token");
localStorage.removeItem("user");
```

### **Backend (Database)**

```sql
-- Users
users (id, name, email, password_hash, role, agency_id, phone, ...)

-- Tokens Sanctum
personal_access_tokens (
  id,
  tokenable_type,    -- 'App\Models\User'
  tokenable_id,      -- user_id
  name,              -- 'auth_token'
  token,             -- SHA-256 hash
  abilities,         -- '["*"]'
  last_used_at,
  created_at
)

-- Agences
agencies (id, name, location, phone, email, address)

-- Scores clients
client_reliability_scores (user_id, score, total_reservations, ...)
```

---

## ✅ POINTS IMPORTANTS À RETENIR

1. **Validation en deux étapes** :
   - Frontend : UX immédiate
   - Backend : Sécurité garantie

2. **Token Sanctum** :
   - Stocké en clair côté client (localStorage)
   - Stocké haché (SHA-256) en DB
   - Envoyé dans header `Authorization: Bearer {token}`

3. **Middleware auth:sanctum** :
   - Extrait le token du header
   - Vérifie dans la DB
   - Charge automatiquement $request->user()

4. **Eager Loading** :
   - `$user->load('agency', 'reliabilityScore')`
   - Évite les requêtes N+1
   - Retourne toutes les données en une requête

5. **Gestion des erreurs** :
   - 422 : Validation errors
   - 401 : Unauthorized
   - 404 : Not found
   - 500 : Server error

6. **Redirection automatique** :
   - Par rôle après login/register
   - Protection des routes non autorisées

7. **State global (Context)** :
   - Un seul source de vérité
   - Accessible partout via `useAuth()`

---

**Date** : 21 février 2026  
**Status** : ✅ Documentation complète
