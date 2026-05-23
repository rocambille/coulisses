# Contexte et Objectifs du Projet

Ce document définit le contexte et les objectifs de l'application destinée à l'organisation de la troupe de théâtre.
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
   - Une troupe est définie par un nom et une description
   - Un utilisateur peut être membre de plusieurs troupes
   - Chaque utilisateur a un rôle unique au sein de la troupe (administrateur ou comédien)
   - Une troupe est créée par un utilisateur (qui en devient l'administrateur)
   - Un administrateur peut inviter d'autres utilisateurs à rejoindre la troupe (email, avec envoi d'un magic link)

3. **Pièces**
   - Une pièce est définie par un nom et une description
   - Une pièce est créée pour une troupe par un administrateur
   - Une troupe peut posséder plusieurs pièces
   - Pour chaque pièce, un administrateur peut prendre des photos de la pièce (couverture, pages clés, etc.)
   - Pour chaque pièce, un membre peut indiquer son niveau de "like" (pour faciliter la sélection d'une pièce à monter)

4. **Scènes**
   - Un administrateur peut créer, modifier, activer ou désactiver des scènes dans une pièce
   - Un administrateur peut noter les coupes ou adaptations de mise en scène dans un champ de notes brut au niveau de la pièce ou de la scène
   - Les changements sont visibles par toute la troupe

5. **Préférences des comédiens**
   - Chaque comédien indique ses préférences pour les scènes (souhait qu'elle soit intégrée au spectacle final) et pour les rôles (souhait de l'interpréter)
   - Les préférences peuvent être mises à jour si les scènes changent
   - Une synthèse est visible par tous (ex : combien de personnes ont choisi chaque scène)

6. **Distribution**
   - Un administrateur assigne les comédiens aux scènes ou rôles (un rôle peut être joué par plusieurs comédiens, mais un rôle dans une scène ne peut être joué que par un seul comédien)
   - La distribution peut être modifiée
   - Visible par toute la troupe

7. **Events**
   - **Répétitions de cours** : créneaux fixes, présence attendue, visibles par tous
   - **Répétitions autonomes** : créées par n'importe quel membre de la troupe, appartiennent à leur créateur, liées à des scènes, visibles par tous
   - **Représentations** : dates, heures et lieux fixes, visibles par toute la troupe
   - Un utilisateur peut confirmer sa présence ("Présent", "Absent", ou "À confirmer" par défaut) à un event (sauf répétitions de cours)

Principes importants :
- **Transparence maximale** : toutes les informations visibles par la troupe
- **Dynamique** : toutes les données peuvent évoluer jusqu’au jour de la représentation
- **Simplicité** : interface très facile à utiliser, même pour des non-techniciens


Contraintes :
- Interface très simple et lisible
- Informations toujours à jour
- Éviter toute complexité inutile
