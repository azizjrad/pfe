# Fonctionnalites de securite - Implementation actuelle (alignee au code)

Ce document est aligne avec l'etat actuel du code.
Il liste uniquement les fonctionnalites de securite reellement implementees, ainsi que les limites qui dependent de l'infrastructure de production.

---

## 1) Hachage des mots de passe

Statut : Implemente

- Les mots de passe sont haches via le cast Eloquent (`password => hashed`).
- La verification a la connexion utilise `Hash::check`.
- Aucun mot de passe en clair n'est stocke en base.
- Fichiers principaux :
  - `backend/app/Models/User.php`
  - `backend/app/Services/AuthService.php`

---

## 2) Validation forte du mot de passe

Statut : Implemente

- L'inscription impose des regles de complexite :
  - longueur minimale
  - lettre minuscule
  - lettre majuscule
  - chiffre
  - caractere special
- La mise a jour du mot de passe profil suit maintenant les memes regles.
- Fichiers principaux :
  - `backend/app/Http/Requests/RegisterRequest.php`
  - `backend/app/Http/Requests/UpdateProfileRequest.php`
  - `frontend/src/pages/auth/ForcePasswordChange.jsx`

---

## 3) Modele d'authentification (Sanctum + cookie HttpOnly)

Statut : Implemente

- Le backend cree un token Sanctum lors du login/register.
- Le token est place dans un cookie HttpOnly (`auth_token`) par la reponse backend.
- Le frontend envoie les credentials avec `withCredentials: true`.
- Un middleware mappe le token du cookie vers le header `Authorization` pour Sanctum.
- Fichiers principaux :
  - `backend/app/Http/Controllers/Api/AuthController.php`
  - `backend/app/Http/Middleware/AuthenticateFromCookie.php`
  - `frontend/src/services/http.js`

Note importante :

- L'application utilise actuellement un transport d'authentification base sur cookie, pas un transport bearer token dans localStorage.

---

## 4) Expiration des tokens

Statut : Configure

- L'expiration Sanctum est configuree a 60 minutes.
- Fichier principal :
  - `backend/config/sanctum.php`

Note :

- Le login controle aussi la duree de vie du cookie (`remember_me`), mais expiration du token et duree du cookie restent deux mecanismes distincts.

---

## 5) Rate limiting (anti brute force)

Statut : Implemente

- La route login est limitee (`throttle:5,1`).
- La route register est limitee (`throttle:5,1`).
- La route reset-password utilise un limiteur dedie (`throttle:reset-password`).
- Le limiteur reset-password applique des limites par IP et par email.
- Fichiers principaux :
  - `backend/routes/api/auth.php`
  - `backend/app/Providers/AppServiceProvider.php`

---

## 6) Controle CORS

Statut : Implemente

- CORS est configure explicitement pour les origines locales et de deploiement connues.
- Les requetes avec credentials sont autorisees (`supports_credentials: true`).
- Fichier principal :
  - `backend/config/cors.php`

Note :

- Le niveau final de restriction en production depend des domaines conserves dans `allowed_origins`.

---

## 7) Limite de sessions simultanees

Statut : Implemente

- Les sessions utilisateur sont limitees a 3 tokens Sanctum simultanes.
- Le token le plus ancien est supprime si la limite est depassee.
- Fichier principal :
  - `backend/app/Services/AuthService.php`

---

## 8) Journalisation securite (logging)

Statut : Implemente

- Les echecs de login sont journalises.
- Les logins reussis sont journalises.
- Les evenements de limite de sessions sont journalises.
- Les acces bloques pour utilisateur suspendu sont journalises.
- Fichiers principaux :
  - `backend/app/Services/AuthService.php`
  - `backend/app/Http/Middleware/EnsureUserNotSuspended.php`
  - `backend/bootstrap/app.php`

---

## 9) Validation cote serveur

Statut : Implemente

- La validation est centralisee dans des classes FormRequest.
- L'API retourne des erreurs de validation structurees.
- Fichiers principaux :
  - `backend/app/Http/Requests/*.php`
  - `backend/bootstrap/app.php`

---

## 10) Protection contre le mass assignment

Statut : Implemente

- Le modele `User` utilise une whitelist explicite `$fillable`.
- Les champs sensibles sont caches (`$hidden`).
- Fichier principal :
  - `backend/app/Models/User.php`

---

## 11) En-tetes de securite

Statut : Implemente

- Les reponses API incluent :
  - `X-Frame-Options: DENY`
  - restrictive `Content-Security-Policy`
  - `Strict-Transport-Security` when request is HTTPS
- Fichier principal :
  - `backend/app/Http/Middleware/SecurityHeaders.php`

Note :

- HSTS s'applique uniquement quand l'application est accessible en HTTPS.

---

## 12) Niveau de risque XSS

Statut : Partiellement adresse par les defaults du stack + la politique

- React echappe le contenu par defaut lors du rendu normal.
- Les reponses API sont en JSON (pas des pages HTML serveur avec contenu utilisateur).
- Les en-tetes de securite incluent une base CSP sur les reponses API.
- Fichiers principaux :
  - `frontend/src/**/*`
  - `backend/app/Http/Middleware/SecurityHeaders.php`

Note :

- Toute utilisation de rendu HTML brut dans le frontend exige une sanitation explicite.

---

## 13) Protection contre l'injection SQL

Statut : Implemente par le pattern d'utilisation du framework

- L'acces principal aux donnees utilise Eloquent / Query Builder parametre.
- Aucun flux d'auth principal n'est base sur du SQL concatene non securise.
- Fichiers principaux :
  - `backend/app/Services/*.php`
  - `backend/app/Http/Controllers/Api/*.php`

---

## 14) Chaine middleware de controle d'acces

Statut : Implemente

- Authentication: `auth:sanctum`
- Role checks: `role:*`
- Suspended users blocked: `not_suspended`
- Forced password update gate: `password_changed`
- Fichiers principaux :
  - `backend/bootstrap/app.php`
  - `backend/routes/api/auth.php`
  - `backend/routes/api/admin.php`
  - `backend/routes/api/agency.php`
  - `backend/routes/api/client.php`

---

## 15) Changement de mot de passe obligatoire au premier login

Statut : Implemente

- Les utilisateurs avec `must_change_password` sont limites jusqu'a la mise a jour du mot de passe.
- Le middleware backend n'autorise que `/user`, `/profile`, `/logout` avant changement.
- Le frontend redirige vers la page dediee `/force-change-password`.
- Fichiers principaux :
  - `backend/database/migrations/2026_04_21_000001_add_must_change_password_to_users_table.php`
  - `backend/app/Http/Middleware/EnsurePasswordChanged.php`
  - `backend/app/Services/AuthService.php`
  - `frontend/src/components/features/ProtectedRoute.jsx`
  - `frontend/src/pages/auth/ForcePasswordChange.jsx`

---

## 16) Securisation du bootstrap admin en production

Statut : Implemente

- Une commande de bootstrap admin one-shot existe : `admin:bootstrap`.
- La commande est restreinte a la production par defaut (override possible avec `--force`).
- Elle est ignoree si un super admin existe deja.
- Le nouvel admin est cree avec `must_change_password=true`.
- Fichier principal :
  - `backend/routes/console.php`

Protection liee a la production :

- `DatabaseSeeder` est bloque par defaut en production sauf activation explicite.
- Fichier principal :
  - `backend/database/seeders/DatabaseSeeder.php`

---

## 17) Ce qui n'est pas garanti par le code seul

Ces points dependent de l'hebergement et du deploiement, pas uniquement du depot :

- SSL certificate validity and TLS termination quality
- Reverse proxy forwarding (`X-Forwarded-*`) correctness
- Firewall / fail2ban / WAF
- Backup policy and disaster recovery
- Runtime monitoring stack (Sentry, SIEM, etc.)

---

## 18) Checklist pratique de verification

Utiliser cette checklist avant d'annoncer une securite "production-ready" :

- [ ] `APP_ENV=production`, `APP_DEBUG=false`
- [ ] HTTPS actif et HSTS observe sur les reponses API
- [ ] `php artisan migrate --force` execute en production
- [ ] `php artisan admin:bootstrap` execute une seule fois, mot de passe change immediatement
- [ ] Les seeders production restent bloques sauf besoin explicite
- [ ] Les origines CORS sont reduites aux vrais domaines de production
- [ ] Le throttling login est teste (429 observe apres depassement)
- [ ] Le flux force-change password est teste de bout en bout
- [ ] Le test acces utilisateur suspendu retourne 403
- [ ] Le traitement des 401 et la deconnexion frontend sont valides

---

## 19) Reponse courte pour la soutenance

Si on vous demande "La securite est-elle vraiment implementee ou juste documentee ?", reponse :

- Oui, les controles coeur sont implementes dans le code (validation, auth, chaine middleware, throttling, logging, headers).
- On utilise Sanctum avec transport par cookie HttpOnly et des verifications backend centralisees.
- Certains controles dependent de l'infrastructure (TLS/firewall/monitoring) et sont verifies au niveau deploiement.
