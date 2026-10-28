# Fonctionnalités & Parcours Produit - Outil d'organisation de troupe de théâtre

Ce document détaille les spécifications fonctionnelles déduites du contexte. Elles sont organisées par étapes chronologiques de la vie d'une troupe (de la rentrée aux représentations), classées par priorité (Indispensable, Souhaitable, Optionnel) et conçues pour être directement exploitables.

---

## 🏗️ 1. Organisation par Étapes & Fonctionnalités

### Étape 1 : Création de la troupe (Module Utilisateurs & Troupes)
*Le début de l'année : le professeur met en place son groupe.*

- **Fonctionnalité 1.1 (Indispensable)** : En tant qu'utilisateur, je veux m'authentifier via un lien magique reçu par email (sans mot de passe) afin d'accéder sans friction à l'application.
- **Fonctionnalité 1.2 (Indispensable)** : En tant qu'utilisateur, je veux créer une "Troupe", ce qui me confère automatiquement le rôle d'administrateur pour celle-ci.
- **Fonctionnalité 1.3 (Indispensable)** : En tant qu'administrateur, je veux inviter des comédiens dans ma troupe :
  - Soit en saisissant leur email (création automatique de leur compte s'il n'existe pas et envoi d'un lien magique).
  - Soit en générant et copiant un **lien d'invitation direct** (à coller dans une discussion de groupe WhatsApp/Telegram) permettant aux membres de rejoindre la troupe immédiatement.
- **Fonctionnalité 1.4 (Indispensable)** : En tant qu'utilisateur, je veux pouvoir accéder aux différentes troupes dont je suis membre (si je fais partie de plusieurs groupes), afin de basculer facilement de l'une à l'autre.
- **Fonctionnalité 1.5 (Indispensable)** : En tant qu'administrateur, je veux pouvoir exclure un membre ; en tant que comédien, je veux pouvoir quitter la troupe de manière autonome.

### Étape 2 : Répertoire et Documents (Module Répertoire & Fichiers)
*Le professeur propose des pièces et partage les textes.*

- **Fonctionnalité 2.1 (Indispensable)** : En tant qu'administrateur, je veux proposer plusieurs Pièces (titre et description) à ma troupe, afin d'ouvrir le choix.
- **Fonctionnalité 2.2 (Indispensable - Nouveau feedback)** : En tant qu'administrateur, je veux pouvoir **joindre directement un document** (texte/script de la pièce au format PDF ou photo) dès le formulaire d'ajout d'une pièce, afin d'éviter de créer la pièce "à vide" et d'avoir à naviguer ensuite dans l'onglet documents.
- **Fonctionnalité 2.3 (Indispensable)** : En tant que membre de la troupe, je veux accéder à l'onglet "Documents" de la pièce pour consulter les fichiers (avec lightbox intégrée pour les photos et visionneuse pour les PDF) et en ajouter de nouveaux si besoin (l'admin conservant le droit de suppression).
- **Fonctionnalité 2.4 (Indispensable)** : En tant que membre de la troupe, je veux lire les descriptions et documents des pièces proposées, et indiquer mon niveau d'envie ("like") pour aider l'administrateur à choisir la pièce finale à monter.
- **Fonctionnalité 2.5 (Indispensable)** : En tant qu'administrateur, je veux pouvoir supprimer une pièce du répertoire.

### Étape 3 : Découpage, Préférences & Suivi des votes (Module Répertoire & Casting)
*La pièce est choisie, on la découpe et on recueille les envies de rôles/scènes.*

- **Fonctionnalité 3.1 (Indispensable)** : En tant qu'administrateur, je veux lister et gérer les Scènes et les Rôles de la pièce retenue.
- **Fonctionnalité 3.2 (Indispensable)** : En tant qu'administrateur, je veux pouvoir activer ou désactiver certaines scènes pour affiner et définir la structure de ce que nous allons monter.
- **Fonctionnalité 3.3 (Indispensable)** : En tant que comédien, je veux indiquer mon niveau d'envie pour qu'une scène soit conservée dans le spectacle, et/ou mon niveau d'envie pour interpréter des rôles spécifiques, afin que l'administrateur connaisse mes préférences.
- **Fonctionnalité 3.4 (Indispensable - Récemment intégré)** : En tant que membre de la troupe, je veux visualiser sur chaque carte de scène les compteurs de votes agrégés (❤️, 👍, 🤏, ❌) pour avoir un aperçu immédiat de la tendance du groupe.
- **Fonctionnalité 3.5 (Indispensable - Nouveau feedback)** : En tant qu'administrateur, je veux avoir une **visibilité détaillée sur qui a voté et qui n'a pas encore voté** sur les scènes d'une pièce, afin d'évaluer le taux de participation et de relancer directement les comédiens retardataires.

### Étape 4 : Distribution & Adaptation (Module Casting - Phase finale)
*Le professeur tranche, assigne les rôles et note les coupes.*

- **Fonctionnalité 4.1 (Indispensable)** : En tant qu'administrateur, je veux assigner les rôles aux comédiens en tenant compte de leurs préférences, afin de fixer le casting officiel. *(Règle métier : un rôle peut être partagé par plusieurs comédiens pour alternance, mais dans une scène donnée, un seul comédien tient ce rôle).*
- **Fonctionnalité 4.2 (Indispensable)** : En tant que membre de la troupe, je veux visualiser la distribution mise à jour en temps réel pour l'ensemble des scènes, afin de savoir qui joue quoi et avec qui j'interagis.
- **Fonctionnalité 4.3 (Souhaitable)** : En tant qu'administrateur, je veux pouvoir noter les coupes ou adaptations de mise en scène effectuées en cours d'année dans un champ de notes brut dédié au niveau de la scène.

### Étape 5 : Répétitions & Représentations (Module Événements)
*La vie quotidienne de la troupe, la coordination sur l'agenda.*

- **Fonctionnalité 5.1 (Indispensable)** : En tant qu'utilisateur de la troupe (administrateur ou comédien), je veux pouvoir créer un Événement (Répétition de cours, Répétition autonome liée à des scènes, ou Représentation). L'événement appartient à son créateur et est visible par toute la troupe.
- **Fonctionnalité 5.2 (Indispensable)** : En tant que membre de la troupe, je veux pouvoir confirmer ma présence ou signaler mon absence à un événement, afin de faciliter l'organisation du groupe ("À confirmer" par défaut / Présent / Absent).

### Étape 6 : Notifications & Alertes (Module Notifications)
*Garder la troupe mobilisée et synchronisée sans friction.*

- **Fonctionnalité 6.1 (Souhaitable - Nouveau feedback)** : En tant qu'utilisateur, je veux pouvoir autoriser les notifications push sur mon navigateur / smartphone afin de recevoir des alertes même lorsque l'application n'est pas ouverte.
- **Fonctionnalité 6.2 (Souhaitable - Nouveau feedback)** : En tant que membre de la troupe, je veux recevoir une notification push lors d'actions marquantes :
  - Publication d'une nouvelle pièce ou d'un texte joint.
  - Ajout d'une répétition ou modification d'horaire d'un événement.
  - Publication ou modification de la distribution officielle (casting).
  - Relance de vote pour les comédiens n'ayant pas encore exprimé leurs souhaits sur les scènes.

---

## 🎯 2. Périmètre de l'application & Roadmap

### Déjà livré en production :
1. **Accès et Multi-troupes** : Création de troupe, lien magique, navigation inter-troupes, invitation par email ET par lien direct partageable (`/troupes/:troupeId/join`).
2. **Répertoire et Documents** : Création de pièces, likes de pièces, onglet Documents complet avec téléversement PDF/images et lightbox.
3. **Casting Collaboratif & Conduite** : Scènes, rôles, notes de coupes, recueil des préférences, compteurs de votes par scène (❤️, 👍, 🤏, ❌) et matrice d'assignation officielle.
4. **Agenda Transverse** : Calendrier mensuel, création d'événements, confirmation de présence tri-état.
5. **Gestion & Droits** : Suppression de pièces, exclusion de membres, possibilité de quitter la troupe.

### Priorités issues des retours utilisateurs (Sprint en cours / Roadmap immédiate) :
1. **Document direct à la création de pièce** : Permettre d'attacher un fichier texte/PDF dès l'ajout d'une pièce dans la troupe (sans devoir créer la pièce "à vide").
2. **Visibilité détaillée des votes (Votants vs Non-votants)** : Interface permettant à l'administrateur de voir la liste nominative des personnes ayant voté et celles n'ayant pas encore voté sur les scènes.
3. **Système de Notifications Push** : Intégration de Web Push Notifications pour alerter la troupe des nouveautés (événements, distribution, relance de vote).

### Ce qui reste exclu à ce stade :
- **Extraction automatique de texte par OCR** : Analyse automatique des photos pour en extraire le script.
- **Synchronisation avec agendas tiers** : Pas de synchronisation bidirectionnelle Google/Apple Calendar.
- **Gestion des accessoires et costumes**.

