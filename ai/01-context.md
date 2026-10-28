# Contexte et Objectifs du Projet

Ce document définit le contexte et les objectifs de l'application destinée à l'organisation d'une troupe de théâtre.

Noms envisagés pour l'application :
- Coulisses
- En scène
- Mon petit théâtre
- Le souffleur
- Les trois coups
- La répète

Contexte :
Nous préparons une pièce de théâtre avec plusieurs scènes et rôles.  
Le but est d’aider la troupe et le professeur à organiser la préparation de manière claire et transparente.

Informations clés de la pièce :
- Les dates, heures et lieux de représentation sont fixés et connus
- Les répétitions de cours sont prévues aux créneaux habituels
- Les répétitions autonomes peuvent être organisées par les comédiens
- Les scènes et la distribution peuvent évoluer jusqu’au jour de la représentation

Objectif :
Créer un outil collaboratif qui centralise toutes les informations pour la troupe, de manière **transparente et toujours à jour**, afin d’éviter les échanges inutiles et la perte de temps.

Fonctionnalités principales :

1. **Utilisateurs**
   - Un utilisateur est défini par un nom et un email (connexion par magic link)

2. **Troupes**
   - Une troupe est un ensemble d'utilisateurs
   - Une troupe est définie par un nom, une description et un lien pour rejoindre un groupe de discussion (ex: WhatsApp, Discord, Telegram, etc.) 
   - Un utilisateur peut être membre de plusieurs troupes
   - Chaque utilisateur a un rôle au sein de la troupe (administrateur ou comédien)
   - Une troupe est créée par un utilisateur (qui en devient l'administrateur)
   - Un administrateur peut inviter des utilisateurs soit par email individuel (magic link), soit en partageant un lien d'invitation direct (copier-coller sur un groupe WhatsApp / discussion)
   - Un administrateur peut retirer un membre de la troupe, et un comédien peut quitter la troupe de manière autonome

3. **Pièces et Documents**
   - Une pièce est définie par un titre et une description
   - Une pièce est créée pour une troupe par un administrateur
   - Une troupe peut posséder plusieurs pièces
   - **Documents joints** : dès la création d'une pièce, l'administrateur peut joindre directement un premier document (texte/script au format PDF ou image) pour éviter de créer une pièce "à vide". L'onglet "Documents" dédié permet ensuite à toute la troupe de consulter les fichiers (avec lightbox pour les photos) et d'en ajouter d'autres si nécessaire
   - Pour chaque pièce, un membre peut indiquer son niveau d'envie ("like") pour faciliter la sélection de la pièce finale à monter
   - Un administrateur peut supprimer une pièce du répertoire

4. **Scènes**
   - Un administrateur peut créer, modifier, ordonner, activer ou désactiver des scènes dans une pièce
   - Un administrateur peut noter les coupes ou adaptations de mise en scène dans un champ de notes brut au niveau de la scène
   - Les changements sont visibles par toute la troupe

5. **Préférences des comédiens & Suivi des votes**
   - Chaque comédien indique ses préférences pour les scènes (souhait qu'elle soit intégrée au spectacle final) et pour les rôles (souhait de l'interpréter)
   - Les préférences peuvent être mises à jour si les scènes ou la distribution évoluent
   - **Feedback & Synthèse** :
     - Compteurs de votes visibles par scène (combien de personnes ont choisi ❤️, 👍, 🤏, ou ❌)
     - Visibilité détaillée pour les administrateurs : vue de qui a voté et surtout de qui n'a pas encore voté sur les scènes, afin de faciliter les relances

6. **Distribution (Casting)**
   - Un administrateur assigne les comédiens aux scènes ou rôles (un rôle peut être joué par plusieurs comédiens pour alternance, mais dans une scène donnée, un rôle ne peut être joué que par un seul comédien)
   - La distribution peut être modifiée à tout moment
   - Visible en temps réel par toute la troupe sous forme de matrice

7. **Événements (Agenda)**
   - **Répétitions de cours** : créneaux fixes, présence attendue, visibles par tous
   - **Répétitions autonomes** : créées par n'importe quel membre de la troupe, appartiennent à leur créateur, liées à des scènes, visibles par tous
   - **Représentations** : dates, heures et lieux fixes, visibles par toute la troupe
   - Un utilisateur peut confirmer sa présence ("Présent", "Absent", ou "À confirmer" par défaut) à un événement

8. **Notifications & Alertes**
   - Notifications push (Web Push) pour prévenir les membres lorsqu'un événement clé survient : ajout d'un nouvel événement à l'agenda, mise à jour de la distribution, ajout d'une nouvelle pièce ou relance pour les votes non complétés

Principes importants :
- **Transparence maximale** : toutes les informations visibles par la troupe
- **Dynamique** : toutes les données peuvent évoluer jusqu’au jour de la représentation
- **Simplicité** : interface très facile à utiliser, même pour des non-techniciens


Contraintes :
- Interface très simple et lisible
- Informations toujours à jour
- Éviter toute complexité inutile
