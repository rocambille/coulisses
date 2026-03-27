# Plan de Développement (Tâches & Architecture existante)

Après analyse du dépôt existant, nous avons identifié que l'application repose sur une stack **Vite SSR + API Express** unifiée (`server.ts`), utilisant **MySQL2** (sans ORM lourd comme Prisma, les requêtes sont sûrement gérées de manière brute ou via un query builder léger dans `src/database`), **Zod** pour la validation, et **Vitest/Testing Library** pour les tests.

Voici le plan de build progressif recommandé, découpé en tâches logiques, en s'appuyant sur cette architecture.

---

## 🏗️ Phase 1 : Fondation Base de Données (Backend)
*Objectif : Mettre en place les tables et les fonctions d`accès aux données (`Data Access Object`) via `mysql2`.*

- [ ] **Tâche 1.1 : Script SQL de migration**
  - Transformer le modèle théorique (`03-data-model.md`) en script de création de tables MySQL (`CREATE TABLE user...`).
- [ ] **Tâche 1.2 : Référentiels DB (src/database)**
  - Mettre à jour `src/schema.sql` et `src/database/seeder.sql` pour intégrer ces tables : `users`, `plays`, `play_members`, `scenes`, `roles`, `preferences`, `castings`, `events` et des données factices.
  - Écrire les tests unitaires (Vitest) associés pour valider l'insertion et la récupération.

---

## 🔒 Phase 2 : API express & Authentification (Backend)
*Objectif : Exposer les middlewares de sécurité et les endpoints REST (`04-api-endpoints.md`).*

- [ ] **Tâche 2.1 : Authentification Magic Link**
  - Adapter `src/express/routes/auth.ts` pour implémenter l'envoi de lien avec un token temporaire.
- [ ] **Tâche 2.2 : Endpoints de la "Source de Vérité" (Plays, Scenes, Roles)**
  - Implémenter le CRUD pour les Pièces et l'ajout de Membres.
  - Implémenter les routes Scènes et Rôles (`GET`, `POST`, `PUT`, `DELETE`).
  - Validation des payloads entrants avec **Zod**.
- [ ] **Tâche 2.3 : Endpoints Casting & Préférences**
  - Implémenter `POST /api/scenes/:sceneId/preferences` (acteur).
  - Implémenter `POST /api/roles/:roleId/castings` (professeur).
  - Créer l'endpoint agrégé (dashboard casting) pour renvoyer la matrice des rôles et préférences d'un seul coup.

---

## 🎨 Phase 3 : Initialisation Frontend & Auth (React)
*Objectif : Connecter les premiers composants React à notre nouvelle API depuis `src/react/`.*

- [ ] **Tâche 3.1 : Page de Login (/login)**
  - Composant de saisie d'email.
  - Gestion du retour du Magic Link (sauvegarde JWT dans le state / localStorage).
- [ ] **Tâche 3.2 : Layouts partagés**
  - Concevoir le Layout avec barre de navigation (Dashboard -> Pièce -> Déconnexion).
  - Création des composants UI de base (boutons, inputs, modal).

---

## 🎬 Phase 4 : Parcours Professeur & Structure de la Pièce (Frontend)
*Objectif : Permettre à un "Teacher" de faire tout le Setup d'une pièce avant d'inviter les acteurs.*

- [ ] **Tâche 4.1 : Dashboard (/) & Création de pièce**
  - Afficher la liste de ses pièces.
  - Interface d'ajout d'une nouvelle pièce.
- [ ] **Tâche 4.2 : Liste des Scènes & Rôles (/plays/:id/scenes)**
  - Interface pour créer une scène, ajuster l'ordre (Conduite).
  - Modale ou champs inline pour gérer les rôles de chaque scène.
- [ ] **Tâche 4.3 : Équipe (/plays/:id/members)**
  - Formulaire simple pour ajouter l'email d'un comédien dans la base `play_members`.

---

## ⭐️ Phase 5 : Parcours Acteur & Casting (Frontend)
*Objectif : Rendre le casting collaboratif.*

- [ ] **Tâche 5.1 : Expression des Préférences (Acteur)**
  - Sur la page des scènes, afficher les petites pastilles actionnables ou un bouton "Mes Envies" permettant d'appeler `POST /api/scenes/:sceneId/preferences`.
- [ ] **Tâche 5.2 : Matrice de Distribution (/plays/:id/casting)**
  - Implémenter le composant `CastingMatrix` affichant qui veut jouer dans quelle scène.
  - Interface côté Professeur pour cliquer sur une cellule et valider un `Casting`.

---

## 📅 Phase 6 : Calendrier (Full-stack)
*Objectif : Ajouter la dernière brique de l'agenda Fixe.*

- [ ] **Tâche 6.1 : Backend** : Ajout du CRUD sur l'entité `events`.
- [ ] **Tâche 6.2 : Frontend** : Vue de type liste simplifiée affichant les prochaines échéances `/plays/:id/calendar`.

---

## 💡 Que coder en premier de manière isolée ?

Si nous devons prioriser un module qui apporte du sens rapidement en limitant le risque d'adhérence, et qui peut être **codé immédiatement** :

🚀 **Je suggère de démarrer par la Phase 1 + Phase 2.2 sur les Entités de Base (`Plays` & `Scenes`).**
1. Création des requêtes MySQL2.
2. Exposition via Express Router.
3. Création des tests via `supertest` sur ces endpoints.

*Cela met en orbite la stack backend avant d'attaquer la complexité côté React + SSR.*
