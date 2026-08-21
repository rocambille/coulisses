# Endpoints API (Express / REST) - MVP

Suite à la définition du modèle de données (centré autour des Troupes), ce document dresse la liste des routes API REST nécessaires pour le MVP de l'application. 
L'API est pensée pour un backend **Node.js (Express)** interagissant avec une base de données **SQLite synchrone** (sans Prisma).

La structure de l'API suit une approche "hybride" :
- **Imbriquée** pour la création et le listing (ex: `/api/troupes/:troupeId/plays`).
- **Plate** pour la lecture unitaire, modification ou suppression d'une ressource (ex: `/api/plays/:playId`).

---

## 🔒 1. Authentification & Compte Utilisateur

L'authentification repose sur un système de lien magique (token éphémère envoyé par email) et l'utilisation de cookies HTTP-Only (`__Host-auth`) pour le maintien de session.

- `POST /api/auth/magic-link`
  - **Body** : `{ email: string }`
  - **Action** : Crée (ou trouve) le `User` et envoie un email contenant un lien de connexion.
  
- `POST /api/auth/verify`
  - **Body** : `{ token: string }`
  - **Action** : Valide le token magique et renvoie un cookie sécurisé contenant la session.

- `GET /api/users/me`
  - **Action** : Renvoie le profil de l'utilisateur connecté (`User`).

- `PUT /api/users/me`
  - **Body** : `{ name?: string, email?: string }`
  - **Action** : Met à jour les informations du compte.

- `DELETE /api/users/me`
  - **Action** : Supprime (soft-delete) le compte de l'utilisateur connecté.

- `POST /api/users/me/avatar`
  - **Body** : `multipart/form-data` avec le champ `avatar` (fichier image).
  - **Action** : Téléverse et associe un avatar à l'utilisateur connecté.

- `DELETE /api/users/me/avatar`
  - **Action** : Supprime l'avatar de l'utilisateur connecté.

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

- `PUT /api/troupes/:troupeId/members/:userId` *(Admin uniquement)*
  - **Body** : `{ role: 'ADMIN' | 'ACTOR' }`
  - **Action** : Modifie le rôle du membre dans la troupe.

- `DELETE /api/troupes/:troupeId/members/:userId` *(Admin uniquement)*
  - **Action** : Retire un utilisateur de la troupe (contrainte : au moins un admin doit subsister).

---

## 🎭 3. Répertoire (Pièces & Envies)

- `GET /api/troupes/:troupeId/plays`
  - **Action** : Liste toutes les pièces proposées au sein d'une troupe.

- `POST /api/troupes/:troupeId/plays` *(Admin uniquement)*
  - **Body** : `{ title: string, description?: string }`
  - **Action** : Crée / propose une nouvelle pièce pour la troupe.

- `GET /api/plays/:playId`
  - **Action** : Détails d'une pièce spécifique.

- `PUT /api/plays/:playId` *(Admin uniquement)*
  - **Body** : `{ title: string, description?: string }`
  - **Action** : Modifie une pièce.

- `DELETE /api/plays/:playId` *(Admin uniquement)*
  - **Action** : Supprime une pièce.

- `POST /api/plays/:playId/preferences` *(Comédien & Admin)*
  - **Body** : `{ level: 'HIGH' | 'MEDIUM' | 'LOW' | 'NOT_INTERESTED' }`
  - **Action** : L'utilisateur enregistre ou met à jour son niveau d'envie global pour cette pièce (`play_preference`).

---

## 🎬 4. Découpage (Scènes & Rôles)

- `GET /api/plays/:playId/scenes`
  - **Action** : Liste toutes les scènes de la pièce (la conduite), ordonnées par `order_in_play`.

- `POST /api/plays/:playId/scenes` *(Admin uniquement)*
  - **Body** : `{ title: string, description?: string, cut_notes?: string, order_in_play: number, duration_estimated_seconds?: number, is_active?: boolean, roleIds: number[] }`
  - **Action** : Ajoute une scène à la pièce et associe les rôles sélectionnés.

- `PUT /api/scenes/:sceneId` *(Admin uniquement)*
  - **Body** : `{ title: string, description?: string, cut_notes?: string, order_in_play: number, duration_estimated_seconds?: number, is_active: boolean, roleIds: number[] }`
  - **Action** : Modifie les attributs d'une scène et synchronise les rôles associés dans `role_scene`.

- `DELETE /api/scenes/:sceneId` *(Admin uniquement)*
  - **Action** : Supprime la scène.

- `GET /api/plays/:playId/roles`
  - **Action** : Liste les rôles de la pièce (incluant le tableau de scènes associées `scenes`).

- `POST /api/plays/:playId/roles` *(Admin uniquement)*
  - **Body** : `{ name: string, description?: string, sceneIds: number[] }`
  - **Action** : Crée un nouveau rôle et l'associe aux scènes sélectionnées.

- `PUT /api/roles/:roleId` *(Admin uniquement)*
  - **Body** : `{ name: string, description?: string, sceneIds: number[] }`
  - **Action** : Modifie un rôle et synchronise ses scènes associées dans `role_scene`.

- `DELETE /api/roles/:roleId` *(Admin uniquement)*
  - **Action** : Supprime le rôle.

- `POST /api/roles/:roleId/scenes` *(Admin uniquement)*
  - **Body** : `{ sceneId: number }`
  - **Action** : Associe un rôle existant à une scène existante (table `role_scene`).

---

## ⭐️ 5. Casting & Distribution

- `GET /api/preferences/me`
  - **Action** : Retourne l'ensemble des préférences de l'utilisateur connecté (`{ playPreferences, scenePreferences, rolePreferences }`).

- `POST /api/scenes/:sceneId/preferences` *(Comédien & Admin)*
  - **Body** : `{ level: 'HIGH' | 'MEDIUM' | 'LOW' | 'NOT_INTERESTED' }`
  - **Action** : L'utilisateur indique son souhait que cette scène soit conservée dans le spectacle (`scene_preference`).

- `POST /api/scenes/:sceneId/roles/:roleId/preferences` *(Comédien & Admin)*
  - **Body** : `{ level: 'HIGH' | 'MEDIUM' | 'LOW' | 'NOT_INTERESTED' }`
  - **Action** : L'utilisateur indique son niveau d'envie pour interpréter ce rôle précis dans cette scène (`role_preference`).

- `GET /api/plays/:playId/castings`
  - **Action** : Endpoint agrégé (Dashboard). Retourne l'ensemble de la matrice : les scènes de la pièce, les rôles associés à chaque scène, toutes les préférences des comédiens, et le casting officiel actuel.

- `POST /api/castings` *(Admin uniquement)*
  - **Body** : `{ user_id: number, role_id: number, scene_id: number }`
  - **Action** : L'administrateur attribue officiellement ce rôle à ce comédien pour cette scène spécifique. (Contrainte : 1 seul comédien par rôle par scène).

- `DELETE /api/castings` *(Admin uniquement)*
  - **Body** : `{ user_id: number, role_id: number, scene_id: number }`
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
  - **Body** : `{ status: 'PENDING' | 'PRESENT' | 'ABSENT' }`
  - **Action** : Met à jour la participation de l'utilisateur connecté à l'événement (`event_presence`).
