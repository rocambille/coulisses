# Endpoints API (Express / REST) - MVP

Suite à la définition du modèle de données, ce document dresse la liste des principales routes API REST nécessaires pour faire fonctionner le MVP de l'application. 
L'API est pensée pour un backend **Node.js (Express)** interagissant avec une base de données au format de notre schéma Prisma.

---

## 🔒 1. Authentification (Magic Link)
L'authentification repose sur l'envoi d'un email contenant un token, qui sera ensuite échangé contre un JWT (JSON Web Token) côté front.

- `POST /api/auth/magic-link`
  - **Body** : `{ email: string }`
  - **Action** : Crée (ou trouve) le `User` et envoie un email avec un lien sécurisé.
  
- `POST /api/auth/verify`
  - **Body** : `{ token: string }`
  - **Action** : Valide le token magique et retourne le profil utilisateur + un JWT Session (ex: `access_token` dans les cookies ou en JSON).

---

## 🎭 2. Gestion des Pièces (Plays) & Membres

- `GET /api/plays`
  - **Action** : Récupère la liste des pièces auxquelles le `User` connecté participe (via la table `PlayMember`).

- `POST /api/plays` *(Professeur)*
  - **Body** : `{ title: string, description?: string }`
  - **Action** : Crée une nouvelle pièce de théâtre.

- `GET /api/plays/:playId`
  - **Action** : Récupère les détails d'une pièce spécifique.

- `GET /api/plays/:playId/members`
  - **Action** : Liste la troupe (acteurs et professeurs) associés à la pièce.

- `POST /api/plays/:playId/members` *(Professeur)*
  - **Body** : `{ email: string, role: MemberRole }`
  - **Action** : Invite un nouvel utilisateur dans la pièce. S'il n'existe pas, il est créé temporairement en attente d'activation.

---

## 🎬 3. Gestion des Scènes & Rôles

- `GET /api/plays/:playId/scenes`
  - **Action** : Récupère la liste des scènes (conduite).

- `POST /api/plays/:playId/scenes` *(Professeur)*
  - **Body** : `{ title: string, durationEst?: number, scene_order: number }`
  - **Action** : Crée une scène.
  
- `GET /api/plays/:playId/roles`
  - **Action** : Récupère la liste des rôles de la pièce.

- `POST /api/plays/:playId/roles` *(Professeur)*
  - **Body** : `{ name: string, description?: string, sceneIds: string[] }`
  - **Action** : Crée un rôle et l'associe à diverses scènes.

- `PUT /api/scenes/:sceneId` *(Professeur)*
  - **Body** : `{ title?: string, scene_order?: number, isActive?: boolean }`
  - **Action** : Modifie une scène (par exemple : changer son ordre dans la conduite).

- `DELETE /api/scenes/:sceneId` *(Professeur)*
  - **Action** : Supprime une scène à condition d'avoir les droits.

---

## ⭐️ 4. Casting & Préférences

- `GET /api/plays/:playId/castings`
  - **Action** : Endpoint agrégé pour le tableau de bord de la distribution. Retourne toutes les scènes + rôles + castings officiels + synthèses des préférences pour la pièce ciblée.

- `POST /api/scenes/:sceneId/preferences` *(Comédien)*
  - **Body** : `{ level: PreferenceLevel }`
  - **Action** : Le comédien connecté crée ou met à jour sa préférence pour cette scène.

- `GET /api/plays/:playId/preferences`
  - **Action** : Récupère la liste de toutes les préférences des comédiens pour visualiser les intentions globales de la troupe sur cette pièce.

- `POST /api/plays/:playId/castings` *(Professeur)*
  - **Body** : `{ roleId: number, userId: number }`
  - **Action** : Le professeur assigne officiellement un rôle à un comédien.

- `DELETE /api/plays/:playId/castings` *(Professeur)*
  - **Body** : `{ roleId: number, userId: number }`
  - **Action** : Le professeur retire l'assignation d'un acteur à un rôle.

---

## 📅 5. Calendrier (Événements)

- `GET /api/plays/:playId/events`
  - **Action** : Récupère les répétitions et représentations liées à la pièce.

- `POST /api/plays/:playId/events` *(Professeur)*
  - **Body** : `{ title: string, type: 'SHOW' | 'FIXED_REHEARSAL' | 'AUTO_REHEARSAL', start_time: string, end_time: string, location?: string, description?: string }`
  - **Action** : Crée un évènement.

- `PUT /api/events/:eventId` *(Professeur)*
  - **Body** : Full `EventData` entity (type, title, description, location, start_time, end_time).
  - **Action** : Met à jour un évènement existant.

- `DELETE /api/events/:eventId` *(Professeur)*
  - **Action** : Supprime un évènement.

*(Les endpoints concernant la planification des répétitions autonomes `AUTO_REHEARSAL` et les disponibilités `Availability` sont mis en attente pour une éventuelle phase post-MVP).*
