# Endpoints API (Express / REST) - MVP

Suite à la définition du modèle de données (centré autour des Troupes), ce document dresse la liste des routes API REST nécessaires pour le MVP de l'application. 
L'API est pensée pour un backend **Node.js (Express)** interagissant avec une base de données **SQLite synchrone** (sans Prisma).

La structure de l'API suit une approche "hybride" :
- **Imbriquée** pour la création et le listing (ex: `/api/troupes/:troupeId/plays`).
- **Plate** pour la lecture unitaire, modification ou suppression d'une ressource (ex: `/api/plays/:playId`).

---

## 🔒 1. Authentification (Magic Link)

L'authentification repose sur un système de lien magique (token éphémère envoyé par email) et l'utilisation de cookies HTTP-Only (`__Host-auth`) pour le maintien de session.

- `POST /api/auth/magic-link`
  - **Body** : `{ email: string }`
  - **Action** : Crée (ou trouve) le `User` et envoie un email contenant un lien de connexion.
  
- `POST /api/auth/verify`
  - **Body** : `{ token: string }`
  - **Action** : Valide le token magique et renvoie un cookie sécurisé contenant la session.

---

## 👥 2. Troupes & Membres (Workspace)

- `GET /api/troupes`
  - **Action** : Liste les troupes auxquelles le `User` connecté appartient.

- `POST /api/troupes`
  - **Body** : `{ name: string, description?: string, external_discussion_link?: string }`
  - **Action** : Crée une troupe. L'utilisateur connecté devient automatiquement membre avec le rôle `ADMIN`.

- `GET /api/troupes/:troupeId`
  - **Action** : Détails d'une troupe spécifique.

- `GET /api/troupes/:troupeId/members`
  - **Action** : Liste tous les membres de la troupe (Admin et Comédiens).

- `POST /api/troupes/:troupeId/members` *(Admin uniquement)*
  - **Body** : `{ email: string, role: 'ADMIN' | 'ACTOR' }`
  - **Action** : Invite un utilisateur dans la troupe. Si l'email n'existe pas en base, un profil temporaire est créé.

- `DELETE /api/troupes/:troupeId/members/:userId` *(Admin uniquement)*
  - **Action** : Retire un utilisateur de la troupe.

---

## 🎭 3. Répertoire (Pièces & Envies)

- `GET /api/troupes/:troupeId/plays`
  - **Action** : Liste toutes les pièces proposées au sein d'une troupe.

- `POST /api/troupes/:troupeId/plays` *(Admin uniquement)*
  - **Body** : `{ title: string, description?: string }`
  - **Action** : Crée / propose une nouvelle pièce pour la troupe.

- `GET /api/plays/:playId`
  - **Action** : Détails d'une pièce spécifique.

- `POST /api/plays/:playId/preferences` *(Comédien)*
  - **Body** : `{ level: 'HIGH' | 'MEDIUM' | 'LOW' | 'NOT_INTERESTED' }`
  - **Action** : L'utilisateur enregistre ou met à jour son niveau d'envie global pour cette pièce (`play_preference`).

---

## 🎬 4. Découpage (Scènes & Rôles)

- `GET /api/plays/:playId/scenes`
  - **Action** : Liste toutes les scènes de la pièce (la conduite), ordonnées par `order_in_play`.

- `POST /api/plays/:playId/scenes` *(Admin uniquement)*
  - **Body** : `{ title: string, description?: string, cut_notes?: string, order_in_play: number, duration_estimated_seconds?: number }`
  - **Action** : Ajoute une scène à la pièce.

- `PUT /api/scenes/:sceneId` *(Admin uniquement)*
  - **Body** : `{ title?: string, cut_notes?: string, order_in_play?: number, is_active?: boolean }`
  - **Action** : Modifie les attributs d'une scène (notamment pour l'activer/désactiver ou modifier les notes de coupes).

- `GET /api/plays/:playId/roles`
  - **Action** : Liste les rôles de la pièce.

- `POST /api/plays/:playId/roles` *(Admin uniquement)*
  - **Body** : `{ name: string, description?: string }`
  - **Action** : Crée un nouveau rôle.

- `POST /api/roles/:roleId/scenes` *(Admin uniquement)*
  - **Body** : `{ sceneId: number }`
  - **Action** : Associe un rôle existant à une scène existante (table `role_scene`).

---

## ⭐️ 5. Casting & Distribution

- `GET /api/plays/:playId/castings`
  - **Action** : Endpoint agrégé (Dashboard). Retourne l'ensemble de la matrice : les scènes, les rôles associés, toutes les préférences des comédiens, et le casting officiel actuel.

- `POST /api/scenes/:sceneId/preferences` *(Comédien)*
  - **Body** : `{ level: 'HIGH' | 'MEDIUM' | 'LOW' | 'NOT_INTERESTED' }`
  - **Action** : Le comédien indique son souhait que cette scène soit conservée dans le spectacle (`scene_preference`).

- `POST /api/scenes/:sceneId/roles/:roleId/preferences` *(Comédien)*
  - **Body** : `{ level: 'HIGH' | 'MEDIUM' | 'LOW' | 'NOT_INTERESTED' }`
  - **Action** : Le comédien indique son niveau d'envie pour interpréter ce rôle précis dans cette scène (`role_preference`).

- `POST /api/roles/:roleId/preferences` *(Comédien)*
  - **Body** : `{ level: 'HIGH' | 'MEDIUM' | 'LOW' | 'NOT_INTERESTED' }`
  - **Action** : Le comédien indique son niveau d'envie pour interpréter ce rôle dans toutes les scènes où ce rôle apparaît (`role_preference`).

- `POST /api/plays/:playId/castings` *(Admin uniquement)*
  - **Body** : `{ userId: number, roleId: number, sceneId: number }`
  - **Action** : L'administrateur attribue officiellement ce rôle à ce comédien pour cette scène spécifique. (Contrainte : 1 seul comédien par rôle par scène).

- `DELETE /api/plays/:playId/castings` *(Admin uniquement)*
  - **Body** : `{ userId: number, roleId: number, sceneId: number }`
  - **Action** : Retire l'acteur de son rôle dans cette scène.

---

## 📅 6. Agenda & Événements

- `GET /api/troupes/:troupeId/events`
  - **Query Params** : `?start=YYYY-MM-DD&end=YYYY-MM-DD`
  - **Action** : Récupère les événements de la troupe, filtrables par fenêtre de dates (semaine en cours, mois prochain...).

- `POST /api/troupes/:troupeId/events` *(Tous les membres)*
  - **Body** : `{ type: 'COURSE' | 'REHEARSAL' | 'SHOW' | 'OTHER', title: string, start_time: string, end_time: string, location?: string, description?: string }`
  - **Action** : Crée un événement. Le créateur en devient le propriétaire (`owner_id`).

- `PUT /api/events/:eventId` *(Admin ou Propriétaire de l'événement)*
  - **Body** : (Champs de l'événement partiels ou totaux)
  - **Action** : Modifie un événement.

- `DELETE /api/events/:eventId` *(Admin ou Propriétaire de l'événement)*
  - **Action** : Supprime l'événement.

- `POST /api/events/:eventId/presence` *(Tous les membres)*
  - **Body** : `{ status: 'PRESENT' | 'ABSENT' }`
  - **Action** : Met à jour la participation de l'utilisateur connecté à l'événement (`event_presence`).
