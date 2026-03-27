# Architecture Frontend (React) - MVP

Ce document décrit la structure, les composants et les parcours utilisateurs de l'interface frontend (React, Vite, ou Next.js) pour répondre aux User Stories et s'interfacer avec l'API.

---

## 🗺️ 1. Parcours Utilisateurs (User Flows)

1. **Onboarding & Connexion**
   - L'utilisateur saisit son email.
   - Il reçoit un lien magique. Au clic, son token est validé et il est redirigé vers son Dashboard.
2. **Setup d'une Pièce (Professeur)**
   - Depuis le Dashboard, clique sur "Nouvelle Pièce".
   - Saisit le titre de la pièce.
   - Ajoute des scènes (titre, ordre). Ajoute des rôles associés aux scènes.
   - Invite les comédiens par email (le système enverra leur lien magique).
   - *Alternativement, le professeur ajoute les représentations et les répétitions au calendrier.*
3. **Expression des Préférences (Comédien)**
   - Ouvre une pièce -> "Conduite / Scènes".
   - Consulte les scènes et les rôles nécessaires. 
   - Sur chaque scène, clique sur un bouton pour indiquer son niveau d'envie (ex: "Très envie", "Pourquoi pas").
4. **Casting Final (Professeur)**
   - Ouvre "Distribution / Casting".
   - Visualise un tableau avec : en ligne les rôles, en colonne les acteurs, avec au croisement les préférences affichées sous forme de pastilles de couleur.
   - Assigne d'un clic l'acteur désiré à chaque rôle. L'UI se met à jour pour tous.

---

## 📄 2. Pages Principales & Arborescence (Routing)

L'application sera découpée en grandes sections via un routeur (ex: React Router).

- `/login` : Page de connexion simple (Magic Link).
- `/` : **Dashboard** (Liste des pièces de l'utilisateur).
- `/plays/:playId` : **Layout partagé** pour une pièce spécifique (affiche un menu de navigation interne à la pièce).
  - `/plays/:playId/scenes` : **La Conduite**. Liste des scènes (dans le bon `order`). Les profs peuvent l'éditer, les acteurs peuvent y ajouter leurs préférences (`level`).
  - `/plays/:playId/casting` : **Distribution Officielle**. Matrice ou liste des rôles avec l'acteur affecté, vue complète et filtrable.
  - `/plays/:playId/calendar` : **Agenda**. Liste chronologique des répétitions et représentations.

---

## 🧩 3. Composants React Principaux

### 🗂️ Composants d'UI ("Dumb Components")
- `MagicLinkInput` : Champ email + Bouton "Me connecter".
- `RoleBadge` : Affiche le nom d'un rôle avec une couleur dédiée.
- `PreferenceBadge` : Affiche le niveau d'envie sous forme colorée (🟢 Très envie, 🟡 Pourquoi pas).
- `Avatar` / `UserTag` : Nom/Prénom de l'acteur (ou initiales si pas de photo).

### 🗂️ Composants Métier ("Smart Components")
- `SceneList` : Affiche la liste complète des scènes, gère (si droits `TEACHER`) le *drag & drop* pour la vue Conduite.
- `SceneCard` : Un élément de la Conduite. Affiche le titre de la scène, les rôles qui y figurent. Côté comédien, affiche un `PreferenceSelector` (série de boutons d'envie) s'il n'y a pas encore de casting.
- `CastingMatrix` : *(Tableau de bord de distribution)*
  - Lignes : Les Scènes et leurs Rôles.
  - Colonnes : Les Comédiens.
  - Cellules : Les préférences + Bouton d'assignation (si `TEACHER`).
- `EventItem` : Une ligne du calendrier (Titre de l'événement, Type, Heure, Lieu).

---

## 📂 4. Structure de Dossiers Recommandée (React/Vite)

Une structure par domaine (Feature-Slices) est recommandée pour un projet de cette nature.

```text
src/
├── components/           # Composants partagés (boutons, inputs, layout)
│   ├── ui/               # Design system basique (Badge, Dialog, Button)
│   └── layout/           # PlayLayout, Header, Navigation
├── features/             # Logique métier regroupée par domaine
│   ├── auth/             # Composants et hooks de connexion (MagicLinkForm)
│   ├── plays/            # Gestion globale de la pièce (PlayCard)
│   ├── scenes/           # Composants de la Conduite (SceneList, SceneCard)
│   ├── casting/          # Préférences & Distribution (CastingMatrix, PreferenceSelector)
│   └── calendar/         # Événements (EventItem)
├── pages/                # Pages correspondant aux routes
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── PlayScenesPage.tsx
│   ├── PlayCastingPage.tsx
│   └── PlayCalendarPage.tsx
├── hooks/                # Hooks React génériques (utils)
├── services/             # Appels API (fetch, axios, clients)
└── utils/                # Utilitaires (formatage date, couleurs)
```

---

## 🤖 5. Choix Techniques & UX Complémentaires

1. **Gestion d'État Local** : `React Query` (ou `SWR`) est idéal ici. Les données (scènes, casting) sont fetchées et mises en cache. Lorsqu'une préférence ou un casting change, on invalide la query pour déclencher le *re-fetch* (donnant ce fameux effet "*toujours à jour*").
2. **Accessibilité & Simplicité** : Préférer l'utilisation d'une bibliothèque de composants Headless comme `Radix UI` ou `shadcn/ui` pour une interface accessible au clavier sans surcharger le design.
3. **Optimistic Updates** : Pour le changement d'ordre des scènes ou l'ajout de préférences, mettre à jour l'UI instantanément avant même que le serveur ne réponde, afin de donner un feeling très fluide à l'utilisateur mobile.
