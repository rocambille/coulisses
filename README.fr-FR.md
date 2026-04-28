<div align="right">

[in english?](./README.md)

</div>

<div align="center">

# StartER 🚀

**Le starter fullstack Express + React qu'on peut vraiment lire**

[![GitHub tag](https://img.shields.io/github/tag/rocambille/start-express-react?include_prereleases=&sort=semver&color=white)](https://github.com/rocambille/start-express-react/tags/)
[![License](https://img.shields.io/badge/license-MIT-white)](https://github.com/rocambille/start-express-react/blob/main/LICENSE.md)
[![Issues - start-express-react](https://img.shields.io/github/issues/rocambille/start-express-react)](https://github.com/rocambille/start-express-react/issues)
[![GitHub Stars](https://img.shields.io/github/stars/rocambille/start-express-react.svg?style=social)](https://github.com/rocambille/start-express-react)

[![Use this template](https://img.shields.io/badge/Démarrer-Use_this_template-2ea44f?style=for-the-badge)](https://github.com/rocambille/start-express-react/generate)
[![Read the manual](https://img.shields.io/badge/Apprendre-Read_the_manual-blue?style=for-the-badge)](https://github.com/rocambille/start-express-react/wiki/home-fr-FR)

<br/>

![](https://raw.githubusercontent.com/rocambille/start-express-react/refs/heads/main/src/react/assets/images/architecture.png)

</div>

## ⚡ Démarrage Rapide

```bash
# 1. Cloner le projet (ou utiliser le bouton "Use this template")
git clone https://github.com/rocambille/start-express-react.git mon-projet
cd mon-projet

# 2. Installer les dépendances et initialiser la base de données
npm install
cp .env.sample .env
npm run database:sync

# 3. Lancer l'application
npm run dev
```
> L'application est disponible sur `http://localhost:5173`

## 🤔 Pourquoi StartER ?

Nous avons conçu StartER avec une philosophie simple : **zéro magie cachée**. 
C'est un framework pensé pour l'apprentissage, le prototypage rapide et le *hacking*. Les frameworks lourds tendent à dissimuler leur complexité. StartER offre une architecture fullstack (Express + React) totalement lisible et modifiable. Vous comprenez chaque ligne de code et gardez le contrôle total sur votre application.

## ✨ Fonctionnalités Clés

* **Codebase 100% lisible** : une architecture claire, sans boîte noire. Votre outil pour apprendre et maîtriser le développement fullstack.
* **Authentification "Magic Link"** : système de connexion sécurisé et sans mot de passe inclus nativement.
* **Architecture minimaliste** : la simplicité d'Express alliée à la modularité de React.
* **Prêt à l'emploi** : TypeScript, SQLite et Docker pour une expérience de développement fluide.

## 🧬 Ne générez pas, clonez ! (`make:clone`)

StartER introduit la commande `make:clone`. Contrairement à un générateur CRUD, vous **clonez votre logique**.

Besoin d'une nouvelle ressource ? Clonez un module existant, comme `item`. La commande duplique les fichiers et renomme toutes les variables et références. Vous obtenez un code source complet, immédiatement fonctionnel et entièrement personnalisable.

## 🧪 Tests d'API par Contrats

StartER simplifie la fiabilité de votre code avec une approche innovante basée sur des contrats.

Définissez la structure de votre API une seule fois. Nous utilisons vos contrats pour **générer les tests de l'API** et pour **simuler vos appels API côté React**. Moins de code répétitif, plus de fiabilité.

## 💻 Stack Technique

* **Backend** : Node.js, Express 5, Zod
* **Frontend** : React 19, React Router, Vite, Pico CSS
* **Database** : SQLite
* **Tooling** : TypeScript, Biome, Vitest, Docker

## 📖 Documentation

L'ensemble de la documentation, des guides de déploiement et des concepts techniques est sur notre wiki.

👉 **[Consulter le Wiki officiel](https://github.com/rocambille/start-express-react/wiki/home-fr-FR)**

## 📄 Licence

Distribué sous licence [MIT](./LICENSE.md). Vous êtes libre de l'utiliser, de le modifier et de le redistribuer à des fins éducatives ou professionnelles.
