# Structure Backend - Explications (Projet PFE)

## Vue d'ensemble

Le backend est une API Laravel 12 organisee avec une separation claire:

- couche HTTP (routes, middleware, requests, controllers, resources)
- couche metier (services, policies, domain enums, exceptions)
- couche donnees (models, migrations, seeders)
- configuration et bootstrapping (bootstrap, config, providers)

---

## Racine backend/

### artisan

- Point d'entree CLI Laravel.
- Sert pour les commandes: migration, test, cache, queue, etc.

### app/

- Coeur applicatif (logique du projet).
- Contient Domain, Exceptions, Http, Models, Policies, Providers, Services.

### bootstrap/

- Initialisation de l'application au demarrage.
- Enregistre les providers et la configuration de boot.

### config/

- Configuration globale (app, auth, database, session, services, etc.).
- Contient les regles qui pilotent auth, cache, mail, queue, security, etc.

### database/

- Fichiers de schema et donnees initiales.
- Contient factories, migrations, seeders.

### public/

- Point d'entree web public (index.php).
- Assets publics accessibles depuis le navigateur.

### resources/

- Ressources backend (ex: vues si necessaire).
- Dans ce projet API-first, usage limite par rapport au frontend React.

### routes/

- Definitions des endpoints HTTP.
- Organisation par contexte metier (auth, public, admin, agency, client).

### storage/

- Fichiers runtime (logs, cache, sessions, views compilees, uploads).

### tests/

- Tests backend (PHPUnit/Laravel test suite).

### vendor/

- Dependances Composer (framework + libs).
- Genere automatiquement, non modifie a la main.

---

## app/ - Dossiers demandes

## app/Domain/

### But

- Contenir les objets/metadonnees metier transverses.

### app/Domain/Enums/

- `AgencyStatus.php`, `VehicleStatus.php`, `ReservationStatus.php`, `ReportStatus.php`, `PaymentStatus.php`, `ReservationPaymentStatus.php`.
- Role: supprimer les chaines magiques et securiser les statuts autorises.
- Benefice: coherence metier, validation plus robuste, transitions d'etat plus lisibles.

## app/Exceptions/

### But

- Centraliser les exceptions metier pour une gestion d'erreur propre.

### app/Exceptions/Domain/

- `DomainException.php` (base)
- `NotFoundException.php`
- `ConflictException.php`
- `BusinessRuleViolationException.php`
- Role: representer les erreurs fonctionnelles du domaine (pas des erreurs techniques brutes).

## app/Http/

### But

- Couche d'entree/sortie HTTP de l'API.
- Recoit la requete, valide, autorise, appelle les services, retourne JSON.

## app/Http/Controllers/

### But

- Orchestration des cas d'usage HTTP.
- Controllers legers: deleguent la logique metier aux Services.

### app/Http/Controllers/Api/

Fichiers principaux:

- `AuthController.php`: register/login/logout/user/profile.
- `AdminController.php`: operations super-admin (stats, agences, users).
- `AgencyController.php`: operations agence.
- `ClientController.php`: operations client.
- `ReservationController.php`: cycle de vie reservation.
- `VehicleController.php`: gestion vehicules.
- `ReportController.php`: signalements.
- `PublicAgencyController.php`, `PublicVehicleController.php`: endpoints publics.
- `ConfigController.php`: configuration exposee (ex: pricing config).
- `ContactController.php`: messages de contact.
- `ChatbotController.php`: interaction chatbot.

## app/Http/Middleware/

### But

- Appliquer des controles transverses avant controller.

Fichiers:

- `AuthenticateFromCookie.php`: auth via cookie HttpOnly/Sanctum.
- `CheckRole.php`: controle d'acces par role.
- `EnsureUserNotSuspended.php`: bloque les comptes suspendus.
- `SecurityHeaders.php`: ajoute des headers de securite HTTP.

## app/Http/Requests/

### But

- Validation et autorisation des entrees API (FormRequest).
- Evite la validation inline dans les controllers.

Exemples:

- Auth: `LoginRequest.php`, `RegisterRequest.php`, `ResetPasswordRequest.php`, `UpdateProfileRequest.php`.
- Admin/Users/Agencies: `CreateUserRequest.php`, `UpdateUserRequest.php`, `CreateAgencyRequest.php`, `UpdateAgencyRequest.php`, `SuspendUserRequest.php`.
- Reservations/Vehicles/Reports: `StoreReservationRequest.php`, `UpdateReservationRequest.php`, `UpdateReservationStatusRequest.php`, `StoreVehicleRequest.php`, `UpdateVehicleRequest.php`, `StoreReportRequest.php`, `UpdateReportStatusRequest.php`, etc.

## app/Http/Resources/

### But

- Transformer les models en JSON de sortie stable.

Fichiers:

- `UserResource.php`, `AgencyResource.php`, `VehicleResource.php`, `ReservationResource.php`, `PaymentResource.php`, `ReportResource.php`, `ContactMessageResource.php`.
- Benefice: schema de reponse coherent pour le frontend.

## app/Models/

### But

- Representer les tables et relations Eloquent.

Modeles presents:

- `User.php`, `Agency.php`, `Vehicle.php`, `Reservation.php`, `Payment.php`, `Report.php`, `Category.php`, `ContactMessage.php`, `ClientReliabilityScore.php`, `UserNotification.php`, `VehicleReturn.php`.
- Role: acces DB, relations, casts, scopes, attributs calcules.

## app/Policies/

### But

- Encapsuler les regles d'autorisation metier par ressource.

Fichiers:

- `AgencyPolicy.php`, `VehiclePolicy.php`, `ReservationPolicy.php`, `ReportPolicy.php`.
- Role: determiner qui peut lire/creer/modifier/supprimer selon role et contexte.

## app/Services/

### But

- Couche metier principale (regles et orchestration de domaine).

Fichiers:

- `AuthService.php`
- `AdminService.php`
- `AgencyService.php`
- `ClientService.php`
- `VehicleService.php`
- `ReservationService.php`
- `ReportService.php`
- `ContactService.php`
- `ChatbotService.php`
- Role: garder les controllers minces, reutiliser la logique, centraliser les regles.

## app/Providers/

### But

- Enregistrement des services/framework hooks.

Fichiers principaux:

- `AppServiceProvider.php`: enregistrement global.
- `RouteServiceProvider.php`: charge les routes API par contexte.

---

## routes/ - API

### Architecture des routes

- `routes/api/auth.php`: endpoints auth et routes protegees communes.
- `routes/api/public.php`: endpoints publics.
- `routes/api/admin.php`: endpoints super-admin.
- `routes/api/agency.php`: endpoints agence.
- `routes/api/client.php`: endpoints client.

### Pourquoi cette separation

- Lisibilite.
- Maintenance.
- Scalabilite par domaine fonctionnel.

---

## bootstrap/

### `bootstrap/app.php`

- Configure le cycle de vie Laravel.
- Point de branchement du handling global (middlewares/exceptions selon architecture).

### `bootstrap/providers.php`

- Liste des providers charges, dont `RouteServiceProvider`.

---

## config/

Fichiers importants:

- `app.php`: config generale app.
- `auth.php`: guards/providers/auth policies.
- `database.php`: connexions DB.
- `session.php`: cookies/session (important pour secure/samesite).
- `services.php`: cles et services externes.
- `mail.php`, `queue.php`, `cache.php`, `filesystems.php`, `logging.php`.

Role global:

- Parametrer le comportement sans coder en dur.

---

## database/

## database/migrations/

- Versionnage du schema SQL.
- Chaque migration decrit une evolution de structure DB.

## database/seeders/

- Donnees initiales / de demo / de reference.
- Exemple entree: `DatabaseSeeder.php`.

## database/factories/

- Generation de faux jeux de donnees pour tests.
- Exemple: `UserFactory.php`.

---

## Cycle d'une requete (resume)

1. Route trouvee dans `routes/api/*.php`.
2. Middleware applique (auth, role, not_suspended, security headers).
3. FormRequest valide les entrees.
4. Controller API appelle le Service.
5. Service applique les regles metier et interagit avec Models.
6. Exceptions metier transformees en reponses API standardisees.
7. Resource serialize la sortie JSON (si utilisee).

---

## Points a maitriser pour soutenance (backend)

- Difference Controller vs Service vs Model.
- Pourquoi FormRequest.
- Pourquoi Policies.
- Pourquoi Enums (anti magic strings).
- Pourquoi exceptions de domaine.
- Comment auth Sanctum + cookie HttpOnly fonctionne.
- Comment la structure des routes par contexte simplifie le projet.

---

## Points a maitriser pour soutenance (chatbot)

- Flux complet: `Chatbot.jsx` -> `chatbotService.js` -> `ChatbotController.php` -> `ChatbotService.php` -> provider IA.
- Validation backend: role de `ChatbotMessageRequest` pour filtrer et valider `message` et `history`.
- Fiabilite: gestion des erreurs dans `ChatbotController` (erreurs metier 503, erreurs inattendues 500).
- Qualite de reponse: nettoyage de l'historique (`sanitizeHistory`) et limitation du contexte.
- Reponses contextuelles metier: enrichissement avec la disponibilite vehicules dans `buildInventoryContext`.
- Securite de configuration: cles/API/model lues depuis `config/services.php` + variables d'environnement.
- Fallback frontend: en cas d'echec provider, reponse locale de secours dans `Chatbot.jsx`.

## Comment le presenter a la soutenance (script simple)

1. Commencer par le besoin: "Nous voulions une assistance instantanee pour guider le client sans saturer le support humain".
2. Montrer l'architecture en 4 blocs: UI React, service frontend, API Laravel, provider IA externe.
3. Expliquer la robustesse: validation des entrees, gestion d'erreurs, fallback de secours.
4. Expliquer la valeur metier: le bot repond avec contexte stock/disponibilite, pas seulement des reponses generiques.
5. Conclure par les limites: dependance au provider et qualite variable des reponses, puis pistes d'amelioration (logs, tests, prompt tuning).

## Questions jury probables (chatbot)

- "Que se passe-t-il si le provider IA tombe?"
- "Comment evitez-vous les reponses hors sujet?"
- "Comment securisez-vous la cle API?"
- "Pourquoi passer par le backend au lieu d'appeler l'IA directement depuis le frontend?"

## Reponses courtes conseillees

- En cas de panne provider, l'API renvoie une erreur maitrisee et le frontend affiche une reponse de secours.
- Nous contraignons l'historique et utilisons un prompt/systeme + contexte metier pour reduire le hors sujet.
- La cle reste cote serveur dans l'environnement, jamais exposee au navigateur.
- Le passage backend permet securite, controle, journalisation et enrichissement metier avant l'appel IA.

---

## Soutenance - Comment le frontend est lie au backend

### Reponse courte (a memoriser)

"Nous avons relie le frontend au backend via une couche service Axios centralisee. Les composants UI n'appellent pas directement les endpoints: ils passent par des services dedies. L'instance Axios est configuree avec une baseURL vers l'API Laravel et `withCredentials: true` pour transmettre le cookie HttpOnly d'authentification Sanctum. Les reponses sont ensuite normalisees cote frontend, et les erreurs globales (comme 401) sont gerees via un interceptor."

### Version detaillee (si le jury demande plus)

1. Le composant/page appelle une methode de service frontend (ex: `authService`, `adminService`, `reservationService`).
2. Le service frontend utilise une seule instance HTTP partagee (`http.js`) avec `baseURL` et headers communs.
3. La requete arrive sur les routes Laravel (`routes/api/*.php`) selon le contexte metier.
4. Les middlewares backend appliquent les controles (auth, role, not_suspended, etc.).
5. Le controller valide via FormRequest puis delegue la logique au service metier.
6. La reponse JSON est retournee au frontend et normalisee pour garder un contrat stable dans l'UI.

### Fichiers a citer pendant la presentation

- Frontend HTTP central: `frontend/src/services/http.js`
- Frontend services metier: `frontend/src/services/*.js`
- Exemple auth: `frontend/src/services/authService.js`
- Routes backend: `backend/routes/api/auth.php` (+ autres contextes)
- Controllers API backend: `backend/app/Http/Controllers/Api/*.php`

### Pourquoi ce choix d'architecture

- Separation claire des responsabilites (UI vs integration API vs metier).
- Securite renforcee (cookie HttpOnly au lieu d'exposer un token JS).
- Maintenance plus simple (baseURL/interceptors centralises).
- Scalabilite: ajout de nouvelles fonctionnalites sans casser l'existant.

### Questions jury probables + reponses rapides

- "Pourquoi ne pas appeler le backend directement depuis les composants?"
  Reponse: Pour eviter la duplication, centraliser les erreurs et garder les composants focalises sur l'affichage.

- "Comment gerez-vous l'authentification dans les appels API?"
  Reponse: Axios envoie automatiquement le cookie HttpOnly avec `withCredentials: true`; le backend Sanctum valide ensuite la session.

- "Comment gerez-vous les erreurs globales?"
  Reponse: Un interceptor Axios capte notamment les 401 et declenche la logique de deconnexion/re-authentification.

- "Quel est le benefice principal de cette integration?"
  Reponse: Fiabilite, securite, lisibilite du code et evolution plus rapide.
