# User Stories & Parcours Produit - Outil d'organisation de troupe de théâtre

Ce document détaille les spécifications fonctionnelles déduites du contexte (01-context). Elles sont organisées par modules, priorisées selon la méthode MoSCoW (Must, Should, Could) et conçues pour être directement exploitables par l'équipe de développement.

---

## 🏗️ 1. Organisation par Modules & User Stories

### Module 1 : Authentification & Accès (Sécurité)
*L'objectif est d'éliminer toute friction à la connexion. Aucun mot de passe à retenir.*

- **US1.1 (Must)** : En tant qu'utilisateur (professeur ou comédien), je veux m'authentifier en cliquant sur un lien magique reçu par email ou SMS, afin d'accéder immédiatement à l'application sans retenir de mot de passe.
- **US1.2 (Must)** : En tant que professeur, je veux inviter de nouveaux membres dans l'espace de la troupe (ajout email/téléphone), afin de leur donner accès au planning et au casting.

### Module 2 : Gestion de l'Œuvre (Scènes & Conduite)
*La structure de base de la pièce qui peut évoluer à tout moment.*

- **US2.1 (Must)** : En tant que professeur, je veux créer, modifier et supprimer des pièces (contenant titre, description), afin de gérer plusieurs pièces en parallèle.
- **US2.2 (Must)** : En tant que professeur, je veux créer, modifier, activer ou désactiver des scènes (contenant titre, description, durée estimée, rôles nécessaires), afin de structurer une pièce.
- **US2.3 (Must)** : En tant que membre de la troupe, je veux consulter la liste de toutes les scènes (actives et désactivées) avec leurs détails, afin de connaître l'état actuel d'une pièce.
- **US2.4 (Should)** : En tant que professeur, je veux ordonner les scènes via un système de "Conduite" (Timeline / drag-and-drop), afin de fixer et visualiser le déroulement exact d'une pièce.
- **US2.5 (Should)** : En tant que membre de la troupe, je veux visualiser cette conduite, afin de comprendre à quels moments je dois entrer ou sortir de scène.

### Module 3 : Casting (Préférences & Distribution)
*Le cœur de l'outil pour éviter les frustrations et clarifier "qui fait quoi".*

- **US3.1 (Must)** : En tant que comédien, je veux déclarer, consulter et modifier mes envies/préférences pour chaque scène (ex: "Très envie que la troupe la monte", "Pourquoi pas"), afin de montrer mon intérêt et d'aider au choix des scènes.
- **US3.2 (Must)** : En tant que professeur, je veux assigner les comédiens aux différents rôles de la pièce (distribution officielle), en m'appuyant sur les lectures et répétitions, afin de figer — même temporairement — le casting.
- **US3.3 (Must)** : En tant que membre de la troupe, je veux visualiser la distribution mise à jour en temps réel pour l'ensemble des scènes, afin de savoir avec qui j'interagis.
- **US3.4 (Could)** : En tant que membre de la troupe, je veux accéder à un tableau de bord transparent récapitulant toutes les préférences de tous les membres, afin de mieux comprendre les choix de distribution du professeur.

### Module 4 : Calendrier Fixe (Représentations & Répétitions de cours)
*La source de vérité pour l'agenda imposé.*

- **US4.1 (Must)** : En tant que professeur, je veux ajouter, modifier et supprimer les dates, heures et lieux des représentations officielles, afin que la troupe connaisse les échéances finales.
- **US4.2 (Must)** : En tant que professeur, je veux définir les créneaux des répétitions de cours régulières ou ponctuelles, afin de centraliser le planning sur lequel la présence est obligatoire/supposée.
- **US4.3 (Must)** : En tant que membre de la troupe, je veux consulter un calendrier global ou une liste des prochains événements officiels, afin de m'organiser.

### Module 5 : Planification Autonome & Disponibilités
*Aider la troupe à répéter d'elle-même sans se heurter au casse-tête des agendas croisés.*

- **US5.1 (Should)** : En tant que comédien, je veux saisir et mettre à jour mes plages de disponibilités exceptionnelles (en dehors des créneaux fixes), afin de faciliter la planification des répétitions autonomes.
- **US5.2 (Should)** : En tant que membre de la troupe, je veux pouvoir proposer et créer une "Répétition Autonome" avec un titre explicite (ex: "Filage Scène 2"), afin de m'entraîner avec mes partenaires sans l'intervention obligatoire du professeur.
- **US5.3 (Should)** : En tant que créateur d'une répétition autonome, je veux visualiser automatiquement les créneaux où les acteurs concernés sont disponibles (croisement des disponibilités et évitement des conflits avec le calendrier fixe), afin de choisir d'un clic le meilleur moment.
- **US5.4 (Should)** : En tant que membre de la troupe, je veux voir l'agenda incluant les répétitions autonomes des autres groupes, afin de garder une transparence totale sur la préparation de la troupe.

---

## 🎯 2. Proposition de MVP (Minimum Viable Product) Strict

Pour garantir un lancement rapide, maximiser l'adoption par des utilisateurs potentiellement peu technophiles, et tester l'usage avant d'investir du temps sur des fonctionnalités complexes (comme la matrice de disponibilités temps-réel), **nous proposons le scope MVP suivant :**

### Périmètre retenu (Ce qu'on développe maintenant) :
*Uniquement les fonctionnalités "Must" (Modules 1, 2 partiel, 3 partiel, 4).*
1. **Accès ultra-simple** : Authentification par lien magique uniquement (email).
2. **Le Référentiel (Source of Truth)** : Gestion basique des scènes par le professeur (CRUD simple, sans notion d'ordre complexe de conduite).
3. **Le Casting collaboratif** :
   - Les acteurs déclarent leurs préférences.
   - Le professeur distribue les rôles.
   - Un tableau simple croisé en lecture seule pour tout le monde.
4. **L'Agenda Fixe** : Ajout manuel par le professeur des Représentations et des Répétitions de cours. Affichage d'une liste chronologique (pas besoin d'une vraie vue "Calendrier mensuel" complexe dans un premier temps, une liste des événements suffit).

### Ce qui est volontairement exclu du MVP (Postponed / Phase 2) :
- **Module 5 complet (Répétitions Autonomes & Disponibilités)** : C'est le module le plus complexe techniquement (gestion des fuseaux, conflits, matrice de disponibilités croisée). Dans un premier temps, les acteurs peuvent utiliser le "Référentiel" pour savoir avec qui ils jouent (et utiliser WhatsApp/Doodle à côté pour se caler). Si l'outil est adopté, ce module sera la "killer feature" de la V2.
- **Module Vue "Conduite" (Timeline structurelle)** : La liste simple des scènes suffit pour démarrer. L'ordre précis avec timing est une optimisation.
- **Synthèses et statistiques poussées** : Affichage transparent mais sans graphiques ou tableaux de bord d'analyse dans un premier temps.

---

## 💻 3. Recommandations Techniques & UX pour le MVP
1. **Mobile-First** : 90% des consultations se feront sur smartphone par les comédiens (consultation de scène, distribution, agenda).
2. **Realtime / Optimistic UI** : Utiliser un système de souscription temps-réel (ex: Supabase, Firebase) ou du polling, pour que la phrase du cahier des charges "*les informations sont toujours à jour*" soit ressentie (si le prof change un rôle, le comédien le voit poper sans recharger la page).
3. **Zéro configuration** : Un user arrive, il voit la prochaine représentation en haut de l'écran, les rôles qui lui sont assignés, et peut cliquer sur une scène pour voir qui d'autre participe.
