# Architecture Frontend (React) - MVP

Ce document décrit la structure, les composants et les parcours utilisateurs de l'interface frontend (React + Vite + SSR) pour répondre aux User Stories et s'interfacer avec l'API, en respectant scrupuleusement l'architecture **StartER**.

---

## 🗺️ 1. Parcours Utilisateurs (User Flows)

1. **Onboarding & Connexion**
   - L'utilisateur saisit son email sur la page d'accueil.
   - Il reçoit un lien magique. Au clic, son token est validé par le backend et il est redirigé vers son Espace (liste de ses Troupes).
2. **Setup de la Troupe & Pièce (Admin)**
   - Depuis son espace, crée une Troupe (il en devient `ADMIN`).
   - Invite les comédiens par email (envoi automatique du lien magique).
   - Ajoute une Pièce au répertoire de la troupe.
   - Ajoute des scènes (titre, ordre, durée estimée). Ajoute des rôles et les associe aux scènes.
3. **Expression des Envies (Comédien)**
   - Le comédien accède à la Troupe, puis ouvre une Pièce.
   - **Envie sur la pièce** : Indique son envie globale de la jouer (`play_preference`).
   - **Scènes & Rôles** : Consulte la liste des scènes. Il peut indiquer son souhait que la scène soit conservée au montage final (`scene_preference`) et/ou son envie d'y interpréter un rôle précis (`role_preference`).
4. **Casting Final (Admin)**
   - L'admin ouvre le Dashboard "Distribution" de la pièce.
   - Visualise un tableau croisé (Scènes/Rôles x Acteurs) affichant les pastilles d'envie de tous les membres.
   - Assigne d'un clic l'acteur désiré à chaque rôle pour chaque scène. L'UI se met à jour pour toute la troupe.
5. **Agenda & Présences (Tous)**
   - N'importe quel membre peut ajouter un événement (Répétition, Cours, etc.) au calendrier de la Troupe.
   - Chaque membre voit l'événement avec un statut "À confirmer" (Pending) par défaut.
   - D'un clic, il valide sa "Présence" ou son "Absence".

---

## 📄 2. Pages Principales & Arborescence (Routing React Router)

Afin d'offrir le meilleur contexte visuel à l'utilisateur (surtout s'il fait partie de plusieurs troupes), le routage sera **imbriqué**. La navigation se fait de manière hiérarchique, garantissant qu'on sait toujours dans quel espace on se trouve.

- `/login` : Page de connexion (Magic Link).
- `/verify` : Page de vérification du token magique.
- `/` : **Espace Utilisateur** (Liste des Troupes auxquelles il appartient).
- `/troupes/:troupeId` : **Dashboard de la Troupe**.
  - Affiche l'agenda commun de la troupe, la liste des membres, et les pièces en cours.
- `/troupes/:troupeId/plays/:playId` : **Layout d'une Pièce** (Menu interne à la pièce).
  - `/troupes/:troupeId/plays/:playId/scenes` : **La Conduite**. Liste chronologique des scènes. Les admins peuvent l'éditer, les acteurs y ajoutent leurs envies.
  - `/troupes/:troupeId/plays/:playId/casting` : **Distribution Officielle**. Matrice globale d'assignation croisant toute la troupe et toutes les scènes.

---

## 🧩 3. Composants React Principaux

### 🗂️ Composants d'UI ("Dumb Components")
Construits avec **Pico CSS** (selon le standard StartER, sans tailwind ni librairie tierce) :
- `MagicLinkInput` : Champ email + Bouton.
- `RoleBadge` : Nom d'un rôle (avec couleur).
- `PreferenceBadge` : Pastille visuelle d'envie (ex: 🟢 Très envie, 🟡 Pourquoi pas).
- `PresenceToggle` : Bouton tri-état compact (À confirmer / Présent / Absent).

### 🗂️ Composants Métier ("Smart Components")
- `TroupeCard` : Aperçu d'une troupe cliquable dans l'espace utilisateur.
- `SceneList` : Affiche la conduite de la pièce. Si `ADMIN`, permet de réordonner ou d'éditer.
- `SceneCard` : Élément de la conduite. Contient :
  - `ScenePreferenceSelector` : Composant permettant à l'acteur de dire "Je veux que cette scène soit dans le spectacle".
  - `RolePreferenceSelector` : Composant permettant à l'acteur de dire "Je veux jouer tel rôle dans cette scène".
- `CastingMatrix` : *(Tableau de bord de distribution)*
  - Lignes : Scènes & Rôles.
  - Colonnes : Comédiens.
  - Cellules : Les préférences de l'acteur + le bouton d'assignation officiel (`ADMIN`).
- `EventItem` : Ligne d'agenda (Titre, Date, Lieu) incluant le `PresenceToggle` de l'utilisateur connecté.

---

## 📂 4. Structure de Dossiers (Standard StartER)

L'architecture respecte strictement le cadriciel imposé par le projet (`AGENTS.md`). Le backend et le frontend vivent dans la même arborescence (`src/`) et partagent les mêmes types globaux.

```text
src/
├── react/                    # Racine Frontend
│   ├── entry-client.tsx      # Point d'entrée pour l'hydratation
│   ├── entry-server.tsx      # Rendu Serveur (SSR)
│   ├── routes.tsx            # Arbre de routage (React Router)
│   ├── helpers/              # Hooks customs (mutations, fetch utilities)
│   └── components/           # Découpage modulaire du code UI
│       ├── ui/               # Composants purement visuels (boutons, inputs)
│       ├── layout/           # Layouts partagés (TroupeLayout, PlayLayout)
│       ├── auth/             # Pages et formulaires de login
│       ├── troupe/           # Logique liée aux Troupes (Dashboard, Membres)
│       ├── play/             # Logique des pièces
│       ├── casting/          # La matrice et la sélection des envies
│       └── event/            # L'agenda et les statuts de présence
├── express/                  # API Backend
└── types/                    # Types TypeScript partagés (User, Troupe, Event...)
```

---

## 🤖 5. Choix Techniques & UX

1. **Design System** : Utilisation exclusive de **Pico CSS** pour un design épuré, sémantique et "Zéro configuration", évitant la surcharge cognitive.
2. **Data Fetching** : Utilisation des utilitaires de `fetch` natifs ou des hooks définis dans `src/react/helpers/`. Les données de la `CastingMatrix` seront renvoyées sous forme d'agrégat directement par l'API pour limiter le calcul intensif côté client.
3. **Contrats API** : Le typage strict est garanti par le partage de contrats entre le Frontend et le backend (Zod).
4. **Optimistic UI** : Sur les actions répétitives et très ciblées (comme changer son statut de "Présence" à un événement ou cocher une "Préférence" de rôle/scène), l'interface graphique sera mise à jour instantanément, avant même le retour HTTP du serveur, offrant une fluidité parfaite sur mobile.
