# Architecture Frontend (React) - MVP

Ce document décrit la structure, les composants et les parcours utilisateurs de l'interface frontend (React + Vite + SSR) pour répondre aux User Stories et s'interfacer avec l'API, en respectant scrupuleusement l'architecture **StartER**.

---

## 🗺️ 1. Parcours Utilisateurs (User Flows)

1. **Onboarding, Connexion & Profil**
   - L'utilisateur saisit son email sur la page d'accueil.
   - Il reçoit un lien magique. Au clic, son token est validé par le backend et il est redirigé vers son Espace (liste de ses Troupes).
   - Depuis son compte (`/account`), il peut mettre à jour ses informations personnelles et téléverser son avatar.
2. **Setup de la Troupe, Invitation & Pièce (Admin)**
   - Depuis son espace, crée une Troupe (il en devient `ADMIN`).
   - Invite les comédiens soit par email, soit en copiant un **lien d'invitation direct** (`/troupes/:troupeId/join`) partagé sur WhatsApp/Telegram.
   - **Ajout de Pièce avec document direct** : Dans le modal d'ajout de pièce, l'admin peut renseigner titre et description et **joindre directement le texte/script (PDF ou image)**, évitant de créer la pièce "à vide".
   - Accède à l'onglet "Documents" de la pièce pour consulter les textes, visionner les photos dans la lightbox ou ajouter des documents supplémentaires.
   - Organise les scènes et les rôles (`/troupes/:troupeId/plays/:playId/roles`).
3. **Expression des Envies & Suivi des votes**
   - Le comédien accède à la Troupe, puis ouvre une Pièce.
   - **Envie sur la pièce** : Indique son envie globale de la jouer (`play_preference`).
   - **Scènes & Rôles** : Consulte la conduite. Indique son niveau d'envie pour chaque scène (`scene_preference`) et rôle (`role_preference`).
   - **Compteurs de votes** : Chaque carte de scène affiche les compteurs agrégés (❤️, 👍, 🤏, ❌).
   - **Suivi des votants / non-votants (Admin)** : L'admin dispose d'une vue de synthèse indiquant nominativement qui a déjà voté et qui n'a pas encore voté sur les scènes de la pièce, pour cibler les relances.
4. **Casting Final (Admin)**
   - L'admin ouvre le Dashboard "Distribution" de la pièce (`/troupes/:troupeId/plays/:playId/casting`).
   - Visualise la matrice croisée (Scènes & Rôles x Acteurs) affichant les pastilles d'envie de tous les membres.
   - Assigne d'un clic l'acteur désiré à chaque rôle pour chaque scène. L'UI se met à jour pour toute la troupe.
5. **Agenda & Présences (Tous)**
   - N'importe quel membre peut consulter le calendrier commun (`/troupes/:troupeId/calendar`) et ajouter un événement (Répétition, Cours, Représentation, Autre).
   - Chaque membre voit l'événement avec un statut "À confirmer" (`PENDING`) par défaut.
   - D'un clic, il valide sa "Présence" (`PRESENT`) ou son "Absence" (`ABSENT`).
6. **Notifications Push (Roadmap)**
   - L'utilisateur peut activer les notifications push Web depuis son navigateur.
   - Dès qu'un nouvel événement est créé ou que le casting est publié, une notification est envoyée aux membres abonnés.

---

## 📄 2. Pages Principales & Arborescence (Routing React Router)

Afin d'offrir le meilleur contexte visuel à l'utilisateur (surtout s'il fait partie de plusieurs troupes), le routage est **imbriqué**. La navigation se fait de manière hiérarchique, garantissant qu'on sait toujours dans quel espace on se trouve.

- `/login` : Formulaire de demande de Magic Link.
- `/verify` : Page de vérification du token magique.
- `/account` : Gestion du profil utilisateur (nom, email, téléversement d'avatar, suppression de compte, déconnexion).
- `/legal` : Mentions légales.
- `/privacy` : Politique de confidentialité.
- `/` : **Espace Utilisateur** (Liste des Troupes auxquelles il appartient, formulaire de création de troupe).
- `/troupes/:troupeId/join` : **Rejoindre une Troupe** (Validation du lien d'invitation direct et adhésion).
- `/troupes/:troupeId` : **Dashboard de la Troupe** (Liste des pièces en cours, ajout de pièce avec document direct, suppression de pièce).
  - `/troupes/:troupeId/members` : **Gestion des Membres** (Liste, invitation par email, copie du lien d'invitation direct, modification de rôle, exclusion, quitter la troupe).
  - `/troupes/:troupeId/calendar` : **Agenda Commun** (Vue calendrier par mois, filtres par dates, gestion des événements et statuts de présence).
  - `/troupes/:troupeId/plays/:playId` : **Layout d'une Pièce** (Menu interne à la pièce : Scènes, Rôles, Distribution, Documents).
    - `/troupes/:troupeId/plays/:playId/scenes` : **La Conduite**. Liste chronologique des scènes avec compteurs de votes (❤️, 👍, 🤏, ❌), vue de complétion des votes (votants / non-votants) pour l'admin, et recueil des préférences.
    - `/troupes/:troupeId/plays/:playId/roles` : **Les Rôles**. Liste des rôles de la pièce.
    - `/troupes/:troupeId/plays/:playId/casting` : **Distribution Officielle**. Matrice globale d'assignation croisant les scènes, rôles et acteurs de la troupe.
    - `/troupes/:troupeId/plays/:playId/documents` : **Documents**. Bibliothèque de fichiers et photos de la pièce, visionneuse PDF et lightbox photos.

---

## 🧩 3. Composants React Principaux

### 🗂️ Composants d'UI ("Dumb Components")
Construits avec **Pico CSS** (selon le standard StartER, sans tailwind ni librairie tierce) :
- `MagicLinkInput` : Champ email + Bouton.
- `Avatar` : Affichage d'image de profil avec initiales de fallback.
- `RoleBadge` : Nom d'un rôle avec style visuel.
- `PreferenceBadge` : Pastille visuelle d'envie (ex: 🟢 HIGH, 🟡 MEDIUM, ⚪ LOW, ❌ NOT_INTERESTED).
- `PreferenceSelector` : Sélecteur de niveau d'envie (Pièce, Scène, Rôle).
- `PresenceToggle` : Bouton tri-état compact (À confirmer / Présent / Absent).
- `Modal` : Fenêtre modale accessible pour l'ajout/édition de ressources et la lightbox de documents.
- `PrototypeBanner` : Avertissement visuel informant les utilisateurs du statut prototype de l'application.
- `SiteFooter` : Pied de page global avec liens vers Mentions Légales et Politique de Confidentialité.

### 🗂️ Composants Métier ("Smart Components")
- `TroupeCard` : Aperçu d'une troupe cliquable dans l'espace utilisateur.
- `TroupeDashboardPage` : Dashboard troupe avec formulaire d'ajout de pièce (supportant le fichier joint direct) et suppression.
- `MembersPage` : Ligne d'un membre avec action de changement de rôle, exclusion, bouton de copie du lien d'invitation et action pour quitter la troupe.
- `JoinPage` : Page d'atterrissage sur lien d'invitation direct permettant l'adhésion en un clic.
- `SceneCard` : Élément de la conduite affichant durée, notes de coupes, sélecteurs d'envies, rôles présents, **compteurs de votes agrégés** et **déclencheur pour voir les votants / non-votants**.
- `SceneForm` : Formulaire de création/édition d'une scène avec sélection des rôles participants.
- `VotingStatusModal` *(Nouveau feedback)* : Vue modale pour les administrateurs listant les membres ayant voté et les membres en attente de vote sur les scènes.
- `DocumentsPage` : Gestionnaire de fichiers pour une pièce avec téléversement multiple (PDF/images) et visionneuse lightbox.
- `CastingPage` : Tableau de bord de distribution matriciel croisant scènes, rôles, comédiens, préférences et assignations.
- `CalendarPage` : Vue calendrier interactif mensuel avec cartes d'événements et toggles de présence.
- `AvatarUploadForm` : Formulaire de téléversement et suppression d'avatar.

---

## 📂 4. Structure de Dossiers (Standard StartER)

L'architecture respecte strictement le cadriciel imposé par le projet (`AGENTS.md`). Le backend et le frontend vivent dans la même arborescence (`src/`) et partagent les mêmes types globaux.

```text
src/
├── react/                    # Racine Frontend
│   ├── entry-client.tsx      # Point d'entrée pour l'hydratation
│   ├── entry-server.tsx      # Rendu Serveur (SSR)
│   ├── routes.tsx            # Arbre de routage (React Router)
│   ├── helpers/              # Hooks customs (mutations, fetch utilities, cache, datetime)
│   └── components/           # Découpage modulaire du code UI
│       ├── ui/               # Composants purement visuels (RoleBadge, PreferenceBadge, PresenceToggle, Modal, PrototypeBanner, SiteFooter...)
│       ├── auth/             # Pages et formulaires de login, vérification, compte, avatar et MeContext
│       ├── troupe/           # Logique Troupes (TroupeLayout, TroupeDashboardPage, MembersPage, JoinPage, CalendarPage)
│       └── play/             # Logique Pièces (PlayLayout, ScenesPage, SceneForm, SceneCard, RolesPage, CastingPage, DocumentsPage)
├── express/                  # API Backend
│   ├── routes.ts             # Enregistrement centralisé des routes
│   └── modules/              # Modules métier (auth, user, troupe, play, scene, role, preference, casting, event, document...)
└── types/                    # Types TypeScript partagés (User, Troupe, Play, Scene, Role, Event, PlayDocument...)
```

---

## 🤖 5. Choix Techniques & UX

1. **Design System** : Utilisation exclusive de **Pico CSS** pour un design épuré, sémantique et "Zéro configuration", évitant la surcharge cognitive.
2. **Data Fetching & Cache** : Utilisation de `getOrFetch` et du hook `useMutate` avec invalidation ciblée des clés de cache pour des mises à jour réactives.
3. **Contrats API** : Le typage strict est garanti par le partage de contrats entre le Frontend et le backend (Zod).
4. **Optimistic UI** : Sur les actions répétitives et très ciblées (comme changer son statut de "Présence" à un événement ou cocher une "Préférence" de rôle/scène), l'interface graphique est mise à jour instantanément, offrant une fluidité parfaite sur mobile.itives et très ciblées (comme changer son statut de "Présence" à un événement ou cocher une "Préférence" de rôle/scène), l'interface graphique sera mise à jour instantanément, avant même le retour HTTP du serveur, offrant une fluidité parfaite sur mobile.
