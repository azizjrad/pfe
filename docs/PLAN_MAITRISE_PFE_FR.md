# Plan de maîtrise PFE (français)

## Objectif

Maîtriser le projet étape par étape, avec priorité sur les mécanismes techniques les plus importants pour la soutenance.

## 1) Fondations indispensables

- Architecture globale du projet (backend Laravel + frontend React)
- MVC + couche Service
- Flux API complet: frontend -> route -> contrôleur -> service -> modèle -> réponse
- Authentification Sanctum avec cookie HttpOnly
- Validation avec FormRequest
- Gestion centralisée des erreurs (exceptions métier)
- Routage par contexte (auth, public, admin, agency, client)

### À savoir expliquer

- Pourquoi les contrôleurs sont légers
- Pourquoi la logique métier est dans les services
- Pourquoi cookie HttpOnly est plus sécurisé
- Différence entre erreur de validation, erreur métier, erreur système

## 2) Mécanismes métier

- Enums de statut (agency, reservation, report, payment, vehicle)
- Transitions d’état autorisées
- Règles métier critiques (création, update, annulation)
- Contrôle d’accès par rôle
- Format standard des réponses API

### À savoir expliquer

- Pourquoi remplacer les chaînes magiques par des enums
- Comment éviter les transitions de statut invalides
- Comment les règles d’accès sont appliquées

## 3) Frontend et intégration API

- Organisation des services frontend
- Instance HTTP Axios et intercepteurs
- Normalisation des réponses API
- Gestion des erreurs UI
- Synchronisation état local / état serveur

### À savoir expliquer

- Pourquoi centraliser les appels API
- Comment les erreurs 401 sont traitées globalement
- Comment éviter les incohérences d’interface après une action

## 4) Sécurité (essentiel)

- Hash des mots de passe
- Validation forte des mots de passe
- Rate limiting login et reset-password
- Middleware auth et not_suspended
- CORS et envoi de credentials
- Headers de sécurité

### À savoir expliquer

- Quelle menace chaque mesure réduit
- Ce qui peut arriver si une mesure est absente

## 5) Tests et qualité

- Tests unitaires frontend avec Vitest
- Tests backend avec PHPUnit
- Cas nominal vs cas d’erreur
- Ce qu’un test prouve réellement

### À savoir expliquer

- Différence test unitaire / intégration
- Pourquoi mocker les appels HTTP dans un test de service

## Feuille de route de travail (14 jours)

### Semaine 1

- Jour 1: architecture globale + schéma du flux API
- Jour 2: authentification complète (register/login/logout/user)
- Jour 3: FormRequest + exceptions + format des réponses
- Jour 4: routes par contexte + contrôle d’accès
- Jour 5: enums + transitions d’état
- Jour 6: admin flow (agences/utilisateurs)
- Jour 7: révision active + quiz oral

### Semaine 2

- Jour 8: frontend services + normalisation réponses
- Jour 9: intercepteurs axios + gestion 401
- Jour 10: sécurité complète (menace -> contre-mesure)
- Jour 11: tests unitaires login (explication ligne par ligne)
- Jour 12: tests unitaires blocage/déblocage agence
- Jour 13: questions jury techniques + réponses courtes
- Jour 14: simulation soutenance 20 minutes

## Check-list finale (auto-évaluation)

- Je peux expliquer le login de bout en bout sans lire le code
- Je peux expliquer pourquoi active/inactive pour une agence
- Je peux justifier les middlewares critiques
- Je peux montrer où est une règle métier dans le code
- Je peux expliquer un test unitaire ligne par ligne
- Je peux distinguer clairement architecture, sécurité, tests

## Format conseillé pour ton rapport

- Partie 1: choix technologiques
- Partie 2: architecture et organisation du code
- Partie 3: mécanismes de sécurité
- Partie 4: stratégie de tests
- Partie 5: limites actuelles et travaux en cours (chapitre 4 partiellement finalisé)
