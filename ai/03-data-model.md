# Modèle de Données - Outil d'organisation de troupe de théâtre

Ce document définit la structure des données de l'application, en s'appuyant sur les User Stories (02-user-stories.md). Le modèle est conçu pour être simple, évolutif et parfaitement adapté à un backend TypeScript (ex: Express avec Prisma ou TypeORM).

## 📊 1. Entités Principales & Relations

### 👤 `User` (Utilisateur)
Représente un membre de l'application (Professeur ou Comédien). L'authentification se fait via "magic link" sur l'email.
- **Relations** : 
  - Peut être membre d'une ou plusieurs pièces (`PlayMember`).
  - Peut avoir plusieurs préférences (`Preference`).
  - Peut être assigné à plusieurs rôles (`Casting`).
  - Peut déclarer des disponibilités (`Availability`).

### 🎭 `Play` (Pièce de théâtre)
Représente une œuvre travaillée par la troupe.
- **Relations** : 
  - Contient plusieurs scènes (`Scene`).
  - Possède plusieurs membres (`PlayMember`).
  - Possède plusieurs événements/calendrier (`Event`).

### 👥 `PlayMember` (Membre de la Troupe)
Table de liaison entre un Utilisateur et une Pièce. Permet de gérer le fait qu'un utilisateur soit "Professeur" pour la pièce A, et "Comédien" pour la pièce B.
- **Champs clés** : `role` (TEACHER, ACTOR)

### 🎬 `Scene` (Scène)
Une subdivision de la pièce.
- **Champs clés** : `order` (pour la conduite), `isActive`.
- **Relations** : Appartient à une `Play`, peut contenir plusieurs `Role` (et inversement), peut recevoir des `Preference`.

### 🎭 `Role` (Rôle / Personnage)
Un rôle de la pièce qui peut apparaître dans plusieurs scènes.
- **Relations** : Appartient à une ou plusieurs `Scene`, peut recevoir un `Casting`.

### ⭐️ `Preference` (Choix de Scène)
L'expression du souhait d'un comédien pour qu'une scène fasse partie de la pièce.
- **Champs clés** : `level` (ex: HIGH, MEDIUM, LOW).
- **Relations** : Lie un `User` et une `Scene`.

### ✅ `Casting` (Distribution Officielle)
L'assignation finale (ou temporaire) d'un comédien à un rôle par le professeur.
- **Relations** : Lie un `User` et un `Role`.

### 📅 `Event` (Événements du planning)
Représente une échéance temporelle (Représentation, Répétition de cours, Répétition autonome).
- **Champs clés** : `type` (SHOW, FIXED_REHEARSAL, AUTO_REHEARSAL), `title` (ou description pour préciser ce qui est travaillé), `startTime`, `endTime`, `location`.
- **Relations** : Appartient à une `Play`.

### ⏱️ `Availability` (Disponibilité) *(Post-MVP)*
Les créneaux où un comédien est disponible (ou indisponible) hors événements fixes.
- **Relations** : Appartient à un `User`.

---

## 💻 2. Schéma TypeScript (Prisma)

Voici une proposition de schéma utilisant la syntaxe **Prisma**. C'est le standard de facto dans l'écosystème Node.js / TypeScript car il génère automatiquement les types TS (idéal pour un backend Express).

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql" // ou sqlite, mysql, etc.
  url      = env("DATABASE_URL")
}

// -- ENUMS --
enum MemberRole {
  TEACHER
  ACTOR
}

enum EventType {
  SHOW              // Représentation
  FIXED_REHEARSAL   // Répétition de cours
  AUTO_REHEARSAL    // Répétition autonome
}

enum PreferenceLevel {
  HIGH
  MEDIUM
  LOW
  NOT_INTERESTED
}

// -- ENTITIES --

model User {
  id            String         @id @default(uuid())
  email         String         @unique
  name          String
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt

  // Relations
  plays         PlayMember[]
  preferences   Preference[]
  castings      Casting[]
  availabilities Availability[]
}

model Play {
  id            String         @id @default(uuid())
  title         String
  description   String?
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt

  // Relations
  members       PlayMember[]
  scenes        Scene[]
  events        Event[]
}

model PlayMember {
  id            String         @id @default(uuid())
  playId        String
  userId        String
  role          MemberRole     @default(ACTOR)
  joinedAt      DateTime       @default(now())

  // Relations
  play          Play           @relation(fields: [playId], references: [id], onDelete: Cascade)
  user          User           @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([playId, userId]) // Un user ne peut être membre qu'une fois par pièce
}

model Scene {
  id            String         @id @default(uuid())
  playId        String
  title         String
  description   String?
  durationEst   Int?           // Durée estimée en minutes
  order         Int            // Ordre dans la conduite (timeline)
  isActive      Boolean        @default(true)
  
  // Relations
  play          Play           @relation(fields: [playId], references: [id], onDelete: Cascade)
  roles         Role[]
  preferences   Preference[]
}

model Role {
  id            String         @id @default(uuid())
  name          String
  description   String?

  // Relations
  scenes        Scene[]
  castings      Casting[]
}

model Preference {
  id            String         @id @default(uuid())
  userId        String
  sceneId       String
  level         PreferenceLevel
  createdAt     DateTime       @default(now())

  // Relations
  user          User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  scene         Scene          @relation(fields: [sceneId], references: [id], onDelete: Cascade)

  @@unique([userId, sceneId])
}

model Casting {
  id            String         @id @default(uuid())
  userId        String
  roleId        String
  assignedAt    DateTime       @default(now())

  // Relations
  user          User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  role          Role           @relation(fields: [roleId], references: [id], onDelete: Cascade)

  @@unique([roleId, userId]) // Optionnel: on peut assigner un seul User à un Role selon les besoins métier
}

model Event {
  id            String         @id @default(uuid())
  playId        String
  type          EventType
  title         String
  description   String?
  location      String?
  startTime     DateTime
  endTime       DateTime
  
  // Relations
  play          Play           @relation(fields: [playId], references: [id], onDelete: Cascade)
}

model Availability {
  id            String         @id @default(uuid())
  userId        String
  startTime     DateTime
  endTime       DateTime
  isAvailable   Boolean        @default(true) // Permet de bloquer ou ouvrir des créneaux

  // Relations
  user          User           @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

---

## 🛠️ 3. Pourquoi ce modèle pour le MVP ?

1. **Flexibilité du statut Professeur/Comédien** : Grâce à `PlayMember`, un acteur d'un groupe peut très bien être le metteur en scène d'une autre pièce dans la même application.
2. **Ordre des scènes natif** : Le champ `order` sur `Scene` permet de gérer la fameuse "*Conduite*" simplement, sans entité supplémentaire. Le drag & drop côté front fera juste une mise à jour de ce champ (Bulk update).
3. **Typage et ORM forts** : En utilisant Prisma avec ce schéma, tous vos Types (`User`, `Play`, `PlayMember`, etc.) seront automatiquement générés et utilisables tels quels dans vos contrôleurs / middlewares Express TypeScript.

*Note : L'entité `Availability` a été ajoutée pour être exhaustif par rapport aux User Stories (Module 5), elle pourra être ignorée lors la phase 1 du MVP si vous souhaitez réduire le scope initial.*
