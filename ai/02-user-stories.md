# Fonctionnalités & Parcours Produit - Outil d'organisation de troupe de théâtre

Ce document détaille les spécifications fonctionnelles déduites du contexte. Elles sont organisées par étapes chronologiques de la vie d'une troupe (de la rentrée aux représentations), classées par priorité (Indispensable, Souhaitable, Optionnel) et conçues pour être directement exploitables.

---

## 🏗️ 1. Organisation par Étapes & Fonctionnalités

### Étape 1 : Création de la troupe (Module Utilisateurs & Troupes)
*Le début de l'année : le professeur met en place son groupe.*

- **Fonctionnalité 1.1 (Indispensable)** : En tant qu'utilisateur, je veux m'authentifier via un lien magique reçu par email (sans mot de passe) afin d'accéder sans friction à l'application.
- **Fonctionnalité 1.2 (Indispensable)** : En tant qu'utilisateur, je veux créer une "Troupe", ce qui me confère automatiquement le rôle d'administrateur pour celle-ci.
- **Fonctionnalité 1.3 (Indispensable)** : En tant qu'administrateur, je veux inviter des comédiens dans ma troupe en saisissant leur email (ce qui crée automatiquement leur compte s'il n'existe pas et leur envoie un lien magique), afin de constituer mon groupe d'élèves.
- **Fonctionnalité 1.4 (Indispensable)** : En tant qu'utilisateur, je veux pouvoir accéder aux différentes troupes dont je suis membre (si je fais partie de plusieurs groupes), afin de basculer facilement de l'une à l'autre.

### Étape 2 : Sélection de la pièce (Module Répertoire - Phase 1)
*Le professeur propose des pièces, les élèves donnent leur avis.*

- **Fonctionnalité 2.1 (Indispensable)** : En tant qu'administrateur, je veux proposer plusieurs Pièces (titre et description uniquement, pas de texte brut) à ma troupe, afin d'ouvrir le choix.
- **Fonctionnalité 2.2 (Souhaitable)** : En tant qu'administrateur, je veux ajouter des photos de couverture ou de pages clés pour illustrer chaque pièce, afin que les comédiens puissent en découvrir des extraits textuels ou l'ambiance. *(Note pour plus tard : un système d'analyse d'image permettra d'extraire le texte automatiquement).*
- **Fonctionnalité 2.3 (Indispensable)** : En tant que membre de la troupe, je veux lire les descriptions et les éventuelles photos des pièces proposées, et indiquer mon niveau d'envie ("like") pour aider l'administrateur à choisir la pièce finale à monter.

### Étape 3 : Découpage et Préférences (Module Répertoire - Phase 2 & Casting)
*La pièce est choisie, on la découpe et on recueille les envies de rôles/scènes.*

- **Fonctionnalité 3.1 (Indispensable)** : En tant qu'administrateur, je veux lister et gérer les Scènes et les Rôles de la pièce retenue.
- **Fonctionnalité 3.2 (Indispensable)** : En tant qu'administrateur, je veux pouvoir activer ou désactiver certaines scènes pour affiner et définir la structure de ce que nous allons monter.
- **Fonctionnalité 3.3 (Indispensable)** : En tant que comédien, je veux indiquer mon niveau d'envie pour qu'une scène soit conservée dans le spectacle, et/ou mon niveau d'envie pour interpréter des rôles spécifiques, afin que l'administrateur connaisse mes préférences et l'avis général avant d'effectuer la distribution.

### Étape 4 : Distribution & Adaptation (Module Casting - Phase finale)
*Le professeur tranche, assigne les rôles et note les coupes.*

- **Fonctionnalité 4.1 (Indispensable)** : En tant qu'administrateur, je veux assigner les rôles aux comédiens en tenant compte de leurs préférences, afin de fixer le casting officiel. *(Règle métier : un rôle peut être partagé par plusieurs comédiens pour alternance, mais dans une scène donnée, un seul comédien tient ce rôle).*
- **Fonctionnalité 4.2 (Indispensable)** : En tant que membre de la troupe, je veux visualiser la distribution mise à jour en temps réel pour l'ensemble des scènes, afin de savoir qui joue quoi et avec qui j'interagis.
- **Fonctionnalité 4.3 (Souhaitable)** : En tant qu'administrateur, je veux pouvoir noter les coupes ou adaptations de mise en scène effectuées en cours d'année dans un champ de notes brut dédié (au niveau de la pièce ou de la scène), afin de conserver une trace textuelle des modifications pour la troupe.

### Étape 5 : Répétitions & Représentations (Module Événements)
*La vie quotidienne de la troupe, la coordination sur l'agenda.*

- **Fonctionnalité 5.1 (Indispensable)** : En tant qu'utilisateur de la troupe (administrateur ou comédien), je veux pouvoir créer un Événement (Répétition de cours, Répétition autonome liée à des scènes, ou Représentation). L'événement appartient à son créateur et est visible par toute la troupe.
- **Fonctionnalité 5.2 (Indispensable)** : En tant que membre de la troupe, je veux pouvoir confirmer ma présence ou signaler mon absence à un événement, afin de faciliter l'organisation du groupe.
  *(Choix d'interface : L'état par défaut d'un utilisateur pour un événement est "À confirmer". Cela force un engagement actif de l'utilisateur, évitant un faux statut "Présent" par défaut. Les statuts disponibles sont donc : À confirmer / Présent / Absent).*

---

## 🎯 2. Première version de l'application (MVP)

Le produit étant destiné à un usage collaboratif immédiat avec de possibles barrières techniques chez certains utilisateurs (non-technophiles), le périmètre initial doit être le plus accessible et robuste possible.

### Périmètre retenu pour le lancement :
*Les fonctionnalités indispensables et souhaitables des 5 étapes définies ci-dessus constituent cette première version.*
1. **Accès et Multi-troupes** : Création de troupe, lien magique, et navigation inter-troupes.
2. **Répertoire Visuel** : Création de pièces, ajout de photos et vote d'intérêt ("likes").
3. **Le Casting Collaboratif** : Scènes, rôles, recueil des préférences et assignation avec respect des contraintes d'alternance/unicité de rôle par scène. Ajout d'un champ notes pour les coupes.
4. **L'Agenda Transverse (Événements)** : Un système global d'événements créables par tous, avec un système de statut de présence strict basé sur l'action ("À confirmer" par défaut).

### Ce qui est volontairement exclu du MVP (Roadmap Future) :
- **Extraction de texte depuis les photos** : La possibilité d'analyser les photos envoyées par le professeur pour en extraire le texte brut de la pièce afin de construire automatiquement des conduites.
- **Recherche de créneaux automatiques (Croisement d'agendas)** : La recherche de créneaux automatiques basée sur le croisement d'agendas Google/Apple extérieurs (trop complexe à mettre en place et pas nécessaire à ce stade avec le système d'événements à confirmer manuellement).
- **Conduite dynamique complexe** : Gestion du chronométrage fin des enchaînements et entrées/sorties en temps réel.
- **Gestion des accessoires et costumes** : La possibilité d'ajouter des accessoires et costumes à la pièce ou aux scènes et de les assigner aux comédiens.
- **Notifications** : La possibilité d'envoyer des notifications push aux utilisateurs pour les informer des événements ou des changements dans la distribution (une v2 pourrait envoyer des emails aux utilisateurs pour les informer des événements, les autres fonctionnalités sont pensées pour être directement utilisables pendant les cours ou les répétitions, sans notifications).

