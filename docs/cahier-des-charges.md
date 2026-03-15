# Cahier des Charges

## Plateforme Web de Gestion de Location de Vehicules Multi-Agences

## 1. Presentation Generale

### Contexte du projet

Le secteur de la location de vehicules necessite une gestion rigoureuse des agences, des vehicules, des reservations, des paiements et du suivi client. Dans un environnement multi-agences, il est important de centraliser les operations, d'ameliorer la visibilite sur l'activite et de faciliter la prise de decision.

### Vision du projet

Le projet consiste a concevoir une plateforme web de gestion de location de vehicules multi-agences permettant de centraliser les operations principales du metier. La plateforme offre une interface adaptee aux differents acteurs du systeme, tout en integrant des mecanismes de suivi, de controle et d'analyse.

La solution vise a etre realiste, exploitable et adaptee a un contexte professionnel, avec une architecture modulaire facilitant l'evolution future du systeme.

## 2. Objectifs du Projet

### Objectifs generaux

- Centraliser la gestion de plusieurs agences de location
- Digitaliser le cycle de reservation de bout en bout
- Offrir une vision claire de l'activite commerciale et operationnelle
- Ameliorer le suivi administratif, financier et client

### Objectifs specifiques

- Permettre aux clients de consulter les vehicules et d'effectuer des reservations en ligne
- Permettre aux agences de gerer leur flotte et leurs reservations
- Fournir au super administrateur une vue globale du systeme
- Assurer le suivi des paiements et des montants restants
- Evaluer la fiabilite des clients a partir de leur historique
- Gerer les signalements et les avis pour ameliorer la qualite du service

## 3. Perimetre Fonctionnel Global

La plateforme couvre les modules principaux suivants :

- Gestion des utilisateurs et des roles
- Gestion des agences
- Gestion des vehicules
- Gestion des reservations
- Calcul automatique du prix de reservation
- Suivi des paiements
- Gestion du score de fiabilite client
- Gestion des retours de vehicules
- Gestion des avis et des signalements
- Administration et tableaux de bord

## 4. Modules Fonctionnels

### 4.1 Module Utilisateurs et Authentification

- Inscription et connexion securisees
- Authentification par roles
- Gestion du profil utilisateur
- Deconnexion et gestion de session
- Consultation des informations du compte

#### Roles geres

- Super administrateur
- Administrateur d'agence
- Client

### 4.2 Module Agences

- Creation et gestion des agences
- Modification des informations d'une agence
- Suppression d'une agence par le super administrateur
- Consultation des informations detaillees d'une agence
- Association des vehicules a une agence
- Visualisation de la vitrine de vehicules d'une agence

### 4.3 Module Vehicules

- Gestion complete des vehicules par agence
- Ajout, modification et suppression des vehicules
- Consultation publique des vehicules disponibles
- Consultation des details d'un vehicule

#### Informations gerees pour un vehicule

- Marque
- Modele
- Annee
- Kilometrage
- Couleur
- Nombre de places
- Transmission
- Type de carburant
- Prix journalier
- Statut
- Image

#### Cycle de vie du vehicule

- Disponible
- Reserve
- En cours d'utilisation
- En maintenance
- Indisponible
- Retourne selon le flux metier de reservation

### 4.4 Module Reservations

#### Cote client

- Recherche de vehicules
- Consultation des details
- Choix des dates de reservation
- Saisie du lieu de prise en charge et de restitution
- Simulation et calcul du prix
- Creation de reservation
- Consultation de ses reservations
- Modification d'une reservation selon les regles metier
- Annulation d'une reservation

#### Cote agence

- Consultation des reservations liees a l'agence
- Validation ou refus selon le statut
- Suivi du calendrier des reservations
- Gestion des departs et retours de vehicules
- Suivi de l'historique

### 4.5 Module de Calcul Automatique du Prix

Le projet actuel integre un calcul automatique du prix base sur des regles simples cote systeme.

#### Elements pris en compte

- Prix journalier du vehicule
- Nombre de jours de location
- Services additionnels eventuels

#### Exemples d'options additionnelles

- Assurance tous risques
- Livraison a l'aeroport
- Livraison a domicile
- Prise en charge hors horaires

#### Objectifs

- Securiser le calcul cote serveur
- Fournir un montant coherent et tracable
- Produire un detail du prix pour la reservation

Remarque : la plateforme actuelle repose sur une tarification automatique simple, et non sur une tarification dynamique avancee basee sur la saisonnalite ou la demande.

### 4.6 Module Paiements et Suivi Financier

La plateforme permet le suivi financier des reservations sans integration bancaire complexe.

#### Donnees suivies

- Montant total de la reservation
- Montant paye
- Montant restant
- Statut de paiement
- Methode de paiement

#### Statuts de paiement

- En attente
- Partiellement paye
- Paye
- En retard

#### Methodes de paiement suivies

- Carte bancaire
- Especes
- Virement
- PayPal
- Autres methodes prevues par le systeme

#### Fonctionnalites

- Historique des paiements lies a une reservation
- Suivi du solde restant
- Detection des retards de paiement
- Consultation des statistiques financieres par agence et au niveau global

### 4.7 Module Score de Fiabilite Client

Chaque client possede un score de fiabilite calcule a partir de son comportement historique.

#### Criteres pris en compte

- Nombre total de reservations
- Reservations completees
- Reservations annulees
- Retards de restitution
- Retards de paiement
- Incidents ou dommages signales
- Montants impayes

#### Objectifs

- Aider les agences a evaluer le niveau de risque
- Produire un indicateur synthetique de confiance
- Appuyer la prise de decision administrative

#### Niveaux de risque

- Faible
- Moyen
- Eleve
- Bloque

### 4.8 Module Retours de Vehicules

- Enregistrement du retour d'un vehicule
- Suivi de la date reelle de restitution
- Detection des retours tardifs
- Mise a jour de l'etat de la reservation
- Mise a jour de la disponibilite du vehicule

### 4.9 Module Avis et Signalements

Ce module renforce la qualite de service et la moderation de la plateforme.

#### Avis

- Les clients peuvent publier des avis sur les agences
- Les agences peuvent consulter les avis recus
- Le super administrateur peut consulter et supprimer les avis si necessaire

#### Signalements

- Les utilisateurs authentifies peuvent soumettre des signalements
- Le super administrateur peut consulter, traiter, classer, restaurer ou supprimer les signalements
- Les signalements peuvent concerner un utilisateur ou une agence
- Le systeme conserve un historique des signalements et de leur traitement

### 4.10 Module Notifications

- Consultation des notifications utilisateur
- Diffusion d'informations liees aux actions principales du systeme
- Amelioration du suivi des evenements importants

### 4.11 Module Administration

Le super administrateur dispose d'un espace de supervision globale.

#### Fonctionnalites

- Gestion des agences
- Gestion des utilisateurs
- Supervision des vehicules
- Consultation des statistiques globales
- Consultation des statistiques financieres
- Consultation des avis et signalements
- Analyse des indicateurs cles de performance

## 5. Modele de Donnees Principal

Les principales entites du systeme sont :

- Utilisateurs
- Agences
- Vehicules
- Reservations
- Paiements
- Scores de fiabilite client
- Retours de vehicules
- Avis
- Signalements
- Notifications

Remarque : la gestion par categories de vehicules ne fait plus partie du perimetre fonctionnel actuel.

## 6. Cas d'Usage Prioritaires

- Authentification d'un utilisateur selon son role
- Consultation des vehicules disponibles
- Creation d'une reservation avec calcul automatique du prix
- Gestion d'une reservation par l'agence
- Enregistrement du depart et du retour du vehicule
- Suivi du paiement et du montant restant
- Consultation du score de fiabilite d'un client
- Publication d'un avis sur une agence
- Soumission d'un signalement
- Analyse des indicateurs via le tableau de bord administrateur

## 7. Contraintes du Projet

- Duree estimee du projet : 3 mois
- Solution web realiste et deployable
- Architecture modulaire et evolutive
- Separation claire entre front-end et back-end
- Gestion des acces selon les roles
- Interface adaptee aux differents profils utilisateurs

## 8. Criteres d'Evaluation

- Pertinence des fonctionnalites metiers
- Coherence du modele de donnees
- Qualite de l'architecture logicielle
- Clarite des interfaces et de l'experience utilisateur
- Qualite du suivi administratif et financier
- Integration correcte des roles et des autorisations
- Qualite de la documentation et de la presentation finale

## 9. Conclusion

Cette plateforme ne se limite pas a une simple application de reservation. Elle constitue une solution de gestion multi-agences integrant la reservation, le suivi des vehicules, le controle des paiements, l'evaluation de la fiabilite client, la gestion des avis et des signalements, ainsi qu'une supervision administrative globale.
