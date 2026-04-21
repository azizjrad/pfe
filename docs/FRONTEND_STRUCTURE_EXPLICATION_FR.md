# Structure Frontend - Explications (Projet PFE)

## Vue d'ensemble

Le frontend est une SPA React (Vite) organisee en couches:

- UI (pages + composants)
- etat et orchestration (hooks, context)
- integration API (services Axios)
- utilitaires (constants, utils, i18n)

---

## Racine frontend/

### dist/

- Build de production genere par Vite.

### node_modules/

- Dependances npm installees.

### public/

- Fichiers statiques servis tels quels.

### src/

- Code source principal React.

### index.html

- Template HTML principal de l'application Vite.

### package.json

- Scripts npm et dependances frontend.

### vite.config.js

- Configuration Vite.

### tailwind.config.js

- Configuration Tailwind CSS.

### postcss.config.js

- Pipeline PostCSS (incluant Tailwind/autoprefixer).

---

## src/ - Dossiers et fichiers

## src/main.jsx

- Point d'entree React.
- Monte l'application et charge les styles globaux.

## src/App.jsx

- Composant racine (routing/layout global selon architecture).

## src/style.css

- Styles globaux.
- Contient les directives Tailwind (`@tailwind base/components/utilities`).

## src/components/

### But

- Composants UI reutilisables, segmentes par domaine visuel.

Sous-dossiers:

- `cards/`: cartes de presentation (stats, entities, etc.).
- `common/`: composants communs transverses.
- `contracts/`: composants lies aux contrats/reservations.
- `dashboard/`: composants de dashboard.
- `features/`: composants metier orientes fonctionnalites.
- `modals/`: boites de dialogue (confirm/edit/etc.).

## src/pages/

### But

- Pages ecran (niveau route).

Sous-dossiers:

- `auth/`: pages login/register/reset.
- `public/`: pages publiques.
- `agencies/`: pages orientation agence.
- `vehicles/`: pages vehicules.
- `error/`: pages d'erreur/fallback.
- `Dashboard.jsx`: conteneur dashboard principal selon role/navigation.

## src/hooks/

### But

- Logique de presentation et orchestration d'etat reusable.

Fichiers:

- `useAdminDashboard.js`: orchestration dashboard admin (stats/agencies/users/actions).
- `useAgencyDashboard.js`: orchestration dashboard agence.
- `useClientDashboard.js`: orchestration dashboard client.
- `useScrollAnimation.js`: logique d'animation scroll.

## src/contexts/

### But

- Etat global transverse via Context API.

Fichier:

- `AuthContext.jsx`: session utilisateur, auth state, flux login/logout/check user.

## src/constants/

### But

- Constantes de domaine partagees.

Fichiers:

- `roles.js`: roles applicatifs.
- `statuses.js`: statuts utilises par l'UI/metier.

## src/utils/

### But

- Fonctions utilitaires pures.

Fichiers:

- `errorMessages.js`: mapping/normalisation des messages d'erreur.
- `formatters.js`: formatage affichage (dates/montants/etc.).
- `normalizers.js`: adaptation de donnees pour composants.

## src/i18n/

### But

- Internationalisation.

Fichiers:

- `index.js`: initialisation i18next.
- `locales/`: fichiers de traduction par langue.

---

## src/services/ - Couche integration API

### Role global

- Centraliser tous les appels HTTP vers le backend.
- Eviter les appels API directs dans les composants/pages.
- Normaliser les reponses et la gestion des erreurs.

### Fichiers coeur

- `http.js`
  - Instance Axios partagee.
  - `withCredentials: true` pour cookie HttpOnly.
  - Intercepteurs (ex: gestion globale 401 via event emitter).

- `apiResponse.js`
  - Helpers de normalisation (`normalizeApiResponse`, `unwrapApiData`).
  - Garantit un format stable pour la couche UI.

- `authEventEmitter.js`
  - Canal d'evenement interne pour notifier les erreurs auth (ex 401).

### Services par domaine

- `authService.js`: register/login/logout/getUser/updateProfile.
- `adminService.js`: stats admin, gestion agences, gestion users.
- `agencyService.js`: operations cote agence.
- `clientService.js`: operations cote client.
- `vehicleService.js`: gestion vehicules.
- `reservationService.js`: gestion reservations.
- `reportService.js`: gestion signalements.
- `publicAgencyService.js`: endpoints publics agences.
- `publicVehicleService.js`: endpoints publics vehicules.
- `pricingConfigService.js`: recuperation configuration de pricing.
- `contactService.js`: envoi/messages contact.
- `chatbotService.js`: interaction chatbot.

### Tests unitaires services

- `services/__tests__/authService.test.js`
  - Test du flux login (appel endpoint + stockage user local).
- `services/__tests__/adminService.test.js`
  - Test du flux blocage/deblocage agence (inactive/active).

---

## Flux frontend typique (resume)

1. Page/Composant appelle un hook (ou service).
2. Hook appelle un service de `src/services`.
3. Service utilise `http.js` (Axios + credentials + interceptors).
4. Reponse normalisee via `apiResponse.js`.
5. Hook met a jour l'etat UI.
6. Composants affichent data / erreurs / loading.

---

## Points a maitriser pour soutenance (frontend)

- Pourquoi separer pages, components, hooks, services.
- Pourquoi centraliser Axios dans `http.js`.
- Pourquoi `withCredentials` est necessaire avec cookie HttpOnly.
- Difference entre role de `AuthContext` et role des hooks dashboard.
- Comment les tests unitaires des services garantissent les contrats API cote UI.
