# FAQ Soutenance Technique (Tunisie) - Questions frequentes et reponses

## Comment utiliser ce document

- Lire les questions a voix haute.
- Repondre en 30 a 60 secondes maximum.
- Donner un exemple concret de votre projet dans chaque reponse.

---

## 1) Questions d'architecture

### Q1. Pourquoi avoir choisi Laravel + React ?

Reponse type:
Nous avons choisi Laravel pour la robustesse backend (routing, validation, securite, ORM) et React pour une interface dynamique et modulaire. Cette combinaison separe clairement le frontend et le backend, ce qui facilite la maintenance et l'evolution.

### Q2. Pourquoi une couche Service et pas toute la logique dans les Controllers ?

Reponse type:
Les Controllers doivent rester legers et orchestrer la requete. La logique metier est centralisee dans les Services pour etre reutilisable, testable et plus simple a maintenir.

### Q3. Comment est organise votre backend ?

Reponse type:
Nous avons une structure par responsabilite: Http (Controllers, Requests, Middleware, Resources), Services pour la logique metier, Models pour la persistence, Policies pour l'autorisation, et Enums/Exceptions pour la coherence fonctionnelle.

### Q4. Pourquoi separer les routes API par contexte (auth/public/admin/agency/client) ?

Reponse type:
Cette separation ameliore la lisibilite, la securite par role et la maintenance. Chaque domaine fonctionnel est isole, donc l'ajout de fonctionnalites est plus propre.

---

## 2) Questions frontend-backend

### Q5. Comment avez-vous lie le frontend au backend ?

Reponse type:
Le frontend passe par une couche de services Axios centralisee. Une instance HTTP partagee gere baseURL, credentials et interceptors. Les composants n'appellent pas directement l'API.

### Q6. Pourquoi utiliser withCredentials ?

Reponse type:
Parce que l'authentification utilise un cookie HttpOnly. Avec withCredentials, le navigateur envoie automatiquement ce cookie aux endpoints API securises.

### Q7. Comment gerez-vous les erreurs API ?

Reponse type:
Nous avons une gestion locale par fonctionnalite et une gestion globale via interceptor (ex: 401). Cela evite la duplication et garde une UX coherente.

---

## 3) Questions securite

### Q8. Quelles mesures de securite avez-vous implementees ?

Reponse type:
Validation backend via FormRequest, middleware d'authentification/roles, controle des comptes suspendus, rate limiting sur endpoints sensibles, headers de securite, et gestion centralisee des erreurs.

### Q9. Pourquoi cookie HttpOnly au lieu de stocker le token dans localStorage ?

Reponse type:
Le cookie HttpOnly reduit le risque d'exposition du token via JavaScript (XSS). C'est un choix plus securise pour une application web.

### Q10. Comment protegez-vous les actions selon les roles ?

Reponse type:
Avec middleware role et Policies metier. Les routes et operations sensibles sont restreintes selon le profil utilisateur.

---

## 4) Questions base de donnees

### Q11. Pourquoi utiliser les migrations ?

Reponse type:
Les migrations versionnent le schema de la base. Elles garantissent un historique clair des changements et une mise en place reproductible.

### Q12. A quoi servent les seeders ?

Reponse type:
Les seeders permettent d'inserer des donnees de test/demo pour accelerer le developpement, les tests et les demonstrations.

### Q13. Pourquoi utiliser Eloquent ORM ?

Reponse type:
Eloquent simplifie la manipulation des donnees, les relations entre entites et la lisibilite du code tout en restant performant pour le besoin du projet.

---

## 5) Questions qualite et tests

### Q14. Quels types de tests avez-vous realises ?

Reponse type:
Des tests unitaires frontend (Vitest) sur les services API, et des tests backend (PHPUnit) sur des parties critiques.

### Q15. Pourquoi tester les services frontend ?

Reponse type:
Parce qu'ils representent le contrat entre UI et API. Tester les services garantit que les bons endpoints/payloads sont utilises et que les reponses sont correctement traitees.

### Q16. Difference entre test unitaire et test d'integration ?

Reponse type:
Unitaire: teste une unite isolee avec mocks. Integration: teste plusieurs composants ensemble et leurs interactions reelles.

---

## 6) Questions chatbot (si present dans votre demo)

### Q17. Quelle est l'architecture du chatbot ?

Reponse type:
Frontend Chatbot -> service frontend -> controller backend -> service chatbot -> provider IA externe. Le backend joue le role de couche de securite et de controle.

### Q18. Que se passe-t-il si le provider IA ne repond pas ?

Reponse type:
Le backend renvoie une erreur maitrisee et le frontend bascule vers une reponse de secours pour garder une experience utilisateur acceptable.

### Q19. Pourquoi ne pas appeler l'API IA directement depuis le frontend ?

Reponse type:
Pour proteger la cle API, appliquer la validation, journaliser, enrichir le contexte metier et garder le controle des reponses.

---

## 7) Questions de choix techniques

### Q20. Pourquoi ces technologies et pas d'autres ?

Reponse type:
Le choix a ete base sur: adequation au besoin, productivite equipe, ecosysteme mature, securite, maintenabilite, et disponibilite des competences.

### Q21. Quelle est la limite actuelle de votre solution ?

Reponse type:
Certaines parties restent en optimisation (ex: couverture de tests et quelques workflows metier). L'architecture est prete et permet d'ajouter ces ameliorations sans refonte.

### Q22. Quelles ameliorations proposez-vous apres soutenance ?

Reponse type:
Augmenter la couverture de tests, renforcer observabilite/logging, ajouter des tableaux de bord metriques, et automatiser davantage le CI/CD.

---

## 8) Questions pieges frequentes (jury)

### Q23. "Comment prouvez-vous que c'est votre travail ?"

Reponse type:
Je peux expliquer l'architecture de bout en bout, justifier chaque choix, presenter les commits, et modifier une fonctionnalite en direct.

### Q24. "Si on supprime votre couche Service, qu'est-ce qui casse ?"

Reponse type:
Le code controller deviendra lourd, duplique et difficile a tester. La maintenance et l'evolutivite seront degradees.

### Q25. "Quel est le point le plus technique que vous maitrisez ?"

Reponse type:
La chaine complete frontend-backend avec securisation auth/cookie, validation, gestion d'erreurs centralisee, et standardisation des reponses API.

---

## 9) Mini script d'ouverture (30 secondes)

Bonjour, notre projet est une plateforme de location de voitures construite avec une architecture API Laravel et un frontend React. Nous avons organise la logique metier dans une couche Service, renforce la securite via middleware/validation/authentification, et mis en place des tests unitaires sur les services critiques. Je vais presenter le flux technique complet, puis les choix d'architecture et les resultats obtenus.

## 10) Mini script de conclusion (20 secondes)

Le projet est fonctionnel, structure et evolutif. Les choix techniques ont privilegie la securite, la maintenabilite et la clarte architecturale. Les prochaines etapes visent surtout l'extension des tests, l'observabilite et l'industrialisation du deploiement.
