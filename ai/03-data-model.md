# Modèle de Données - Outil d'organisation de troupe de théâtre

Ce document définit la structure des données de l'application, en s'appuyant sur les Fonctionnalités (02-user-stories.md). 

## 📊 1. Modèle Conceptuel

Cette section décrit les informations stockées par l'application sous forme de concepts, tout en conservant le niveau de détail et de rigueur nécessaire pour un développeur.

### L'Espace de travail
* **Utilisateur (`user`)** : Une personne utilisant l'application. Elle est définie par un identifiant unique, un nom, une adresse email (pour la connexion via lien magique) et sa date d'inscription.
* **Troupe (`troupe`)** : Le groupe théâtral. Elle possède un nom, une description, un lien pour rejoindre un groupe de discussion (ex: whatsapp, discord, telegram, etc.).
* **Membre de la Troupe (`troupe_member`)** : Le lien entre un Utilisateur et une Troupe. Cette association porte le rôle de l'utilisateur au sein de cette troupe (Administrateur ou Comédien). Un utilisateur peut être dans plusieurs troupes avec des rôles différents.

### Le Répertoire
* **Pièce (`play`)** : Une œuvre proposée ou jouée par la troupe. Elle est définie par un titre, une description, et appartient à une Troupe précise.
* **Envie / Avis sur une Pièce (`play_preference`)** : L'avis d'un comédien sur une pièce proposée. Relie un Utilisateur à une Pièce avec un niveau d'envie (par exemple: "J'aimerais la jouer", "Bof").

### Le Découpage
* **Scène (`scene`)** : Une subdivision de la Pièce. Elle possède un titre, une description, un champ de texte libre pour les "notes de coupes" (adaptations du texte), un numéro d'ordre (pour définir l'ordre des scènes dans le spectacle), une durée estimée et un état (active/inactive pour indiquer si la troupe la garde ou la coupe).
* **Rôle (`role`)** : Un personnage de la Pièce. Il possède un nom et une description.
* **Apparition du Rôle dans une Scène (`role_scene`)** : L'indication qu'un Rôle apparaît et interagit dans une Scène spécifique.

### La Distribution (Casting)
* **Scène souhaitée (`scene_preference`)** : L'envie exprimée par un Utilisateur pour que la Scène soit conservée dans le spectacle monté par la troupe (indépendamment du fait d'y jouer ou non).
* **Préférence (`role_preference`)** : L'envie exprimée par un Utilisateur pour jouer un Rôle précis dans une Scène précise. Elle contient un niveau d'envie (ex: "Très envie", "Pourquoi pas"). *(L'interface utilisateur permettra de cocher un rôle de manière globale pour remplir automatiquement les préférences de l'utilisateur pour ce rôle pour toutes les scènes dans lesquelles il apparaît).*
* **Distribution Officielle (`casting`)** : L'assignation finale décidée par l'administrateur. Relie un Utilisateur à un Rôle pour une Scène donnée. *(Règle métier stricte : Pour une scène spécifique, un rôle ne peut être assigné qu'à un seul utilisateur).*

### L'Agenda
* **Événement (`event`)** : Une échéance temporelle pour la Troupe (Cours, Répétitions, Représentations, etc.). Contient un titre, un type d'événement (avec un type "autre" pour les événements ne correspondant à aucun des types prédéfinis), les dates/heures de début et fin, l'éventuel lieu, une description et le lien vers l'Utilisateur créateur.
* **Présence à l'Événement (`event_presence`)** : Le statut de participation d'un Utilisateur à un Événement. Ce statut peut être "À confirmer", "Présent" ou "Absent".

---

## 💻 2. Schéma de Base de Données (SQLite)

Le projet utilisant la stack de base (sans ORM lourd de type Prisma, mais avec des requêtes SQL manuelles via `node:sqlite`), voici la structure DDL (Data Definition Language) correspondante.

```sql
-- schema.sql

-- ==========================================
-- ESPACE DE TRAVAIL
-- ==========================================

CREATE TABLE user (
    id INTEGER PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE troupe (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    external_discussion_link TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE troupe_member (
    user_id INTEGER NOT NULL,
    troupe_id INTEGER NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('ADMIN', 'ACTOR')),
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, troupe_id),
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    FOREIGN KEY (troupe_id) REFERENCES troupe(id) ON DELETE CASCADE
);

-- ==========================================
-- RÉPERTOIRE
-- ==========================================

CREATE TABLE play (
    id INTEGER PRIMARY KEY,
    troupe_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    FOREIGN KEY (troupe_id) REFERENCES troupe(id) ON DELETE CASCADE
);

CREATE TABLE play_preference (
    user_id INTEGER NOT NULL,
    play_id INTEGER NOT NULL,
    level TEXT NOT NULL CHECK(level IN ('HIGH', 'MEDIUM', 'LOW', 'NOT_INTERESTED')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, play_id),
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    FOREIGN KEY (play_id) REFERENCES play(id) ON DELETE CASCADE
);

-- ==========================================
-- DÉCOUPAGE
-- ==========================================

CREATE TABLE scene (
    id INTEGER PRIMARY KEY,
    play_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    cut_notes TEXT,
    order_in_play INTEGER NOT NULL DEFAULT 0,
    duration_estimated_seconds INTEGER NOT NULL DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 1, -- boolean in sqlite
    FOREIGN KEY (play_id) REFERENCES play(id) ON DELETE CASCADE
);

CREATE TABLE role (
    id INTEGER PRIMARY KEY,
    play_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    FOREIGN KEY (play_id) REFERENCES play(id) ON DELETE CASCADE
);

CREATE TABLE role_scene (
    role_id INTEGER NOT NULL,
    scene_id INTEGER NOT NULL,
    PRIMARY KEY (role_id, scene_id),
    FOREIGN KEY (role_id) REFERENCES role(id) ON DELETE CASCADE,
    FOREIGN KEY (scene_id) REFERENCES scene(id) ON DELETE CASCADE
);

-- ==========================================
-- DISTRIBUTION (CASTING)
-- ==========================================

CREATE TABLE scene_preference (
    user_id INTEGER NOT NULL,
    scene_id INTEGER NOT NULL,
    level TEXT NOT NULL CHECK(level IN ('HIGH', 'MEDIUM', 'LOW', 'NOT_INTERESTED')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, scene_id),
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    FOREIGN KEY (scene_id) REFERENCES scene(id) ON DELETE CASCADE
);

CREATE TABLE role_preference (
    user_id INTEGER NOT NULL,
    scene_id INTEGER NOT NULL,
    role_id INTEGER NOT NULL,
    level TEXT NOT NULL CHECK(level IN ('HIGH', 'MEDIUM', 'LOW', 'NOT_INTERESTED')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, scene_id, role_id),
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    FOREIGN KEY (scene_id) REFERENCES scene(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES role(id) ON DELETE CASCADE
);

CREATE TABLE casting (
    user_id TEXT NOT NULL,
    scene_id TEXT NOT NULL,
    role_id TEXT NOT NULL,
    assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (scene_id, role_id), -- Contrainte métier stricte: un seul comédien par rôle dans une scène
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    FOREIGN KEY (scene_id) REFERENCES scene(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES role(id) ON DELETE CASCADE
);

-- ==========================================
-- AGENDA (ÉVÉNEMENTS)
-- ==========================================

CREATE TABLE event (
    id INTEGER PRIMARY KEY,
    troupe_id INTEGER NOT NULL,
    owner_id INTEGER NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('COURSE', 'REHEARSAL', 'SHOW', 'OTHER')),
    title TEXT NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    location TEXT,
    description TEXT,
    FOREIGN KEY (troupe_id) REFERENCES troupe(id) ON DELETE CASCADE,
    FOREIGN KEY (owner_id) REFERENCES user(id) ON DELETE CASCADE
);

CREATE TABLE event_presence (
    event_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('PRESENT', 'ABSENT')),
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (event_id, user_id),
    FOREIGN KEY (event_id) REFERENCES event(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);
```

### Notes d'implémentation
1. **SQLite Synchrone** : Les booléens sont stockés en `INTEGER` (0 ou 1) de manière native par SQLite (ex: `is_active`).
2. **Pas de mot de passe** : L'authentification par *Magic Link* utilisera un mécanisme de jeton (potentiellement via une table `magic_link_token` externe au modèle métier principal).
3. **Ordre alphabétique des tables de jointure** : Conformément aux bonnes pratiques, les tables d'association pure sont nommées par ordre alphabétique (`role_scene`), à l'exception des entités conceptuelles fortes (`troupe_member`, `play_like`, `event_presence`).
