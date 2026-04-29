# Réponse pour le jury: calcul correct du score client

Le calcul du score client est sécurisé parce qu’il est fait côté backend, dans une logique centralisée. Le système ne laisse pas l’utilisateur ou l’agence saisir le score manuellement. L’agence met à jour des données réelles de réservation, puis le backend recalcule automatiquement le score à partir de ces données dans [ClientService.php](../backend/app/Services/ClientService.php#L154) et la formule est définie dans [ClientReliabilityScore.php](../backend/app/Models/ClientReliabilityScore.php#L47).

Pour garantir que le calcul est correct, on s’appuie sur trois points:

- une formule fixe et centralisée avec les pénalités dans [config/pfe.php](../backend/config/pfe.php#L41),
- un recalcul automatique à partir des vraies données de réservation, paiement et retour dans [ClientService.php](../backend/app/Services/ClientService.php#L167),
- un test unitaire qui vérifie qu’un scénario connu donne bien le score attendu dans [ClientReliabilityScoreTest.php](../backend/tests/Unit/ClientReliabilityScoreTest.php#L1).

Si un juré demande une phrase simple, tu peux dire:

> Le score client est calculé automatiquement par le backend à partir des événements de réservation, des retards de paiement et de l’état de retour. La logique est centralisée, testée par unit test, et le score est recalculé après chaque mise à jour importante.

Version courte à dire à l’oral:

> L’agence met à jour les réservations et les retours, puis le système recalcule automatiquement le score client avec une formule fixe dans le backend. Cela évite toute saisie manuelle et garantit un calcul cohérent.
