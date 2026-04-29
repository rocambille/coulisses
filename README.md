<div align="right">

[en français ?](./README.fr-FR.md)

</div>

<div align="center">

# StartER 🚀

**The readable Express + React fullstack starter**

[![GitHub tag](https://img.shields.io/github/tag/rocambille/start-express-react?include_prereleases=&sort=semver&color=white)](https://github.com/rocambille/start-express-react/tags/)
[![License](https://img.shields.io/badge/license-MIT-white)](https://github.com/rocambille/start-express-react/blob/main/LICENSE.md)
[![Issues - start-express-react](https://img.shields.io/github/issues/rocambille/start-express-react)](https://github.com/rocambille/start-express-react/issues)
[![GitHub Stars](https://img.shields.io/github/stars/rocambille/start-express-react.svg?style=social)](https://github.com/rocambille/start-express-react)

[![Use this template](https://img.shields.io/badge/Start-Use_this_template-2ea44f?style=for-the-badge)](https://github.com/rocambille/start-express-react/generate)
[![Read the manual](https://img.shields.io/badge/Learn-Read_the_manual-blue?style=for-the-badge)](https://github.com/rocambille/start-express-react/wiki)

<br/>

![](https://raw.githubusercontent.com/rocambille/start-express-react/refs/heads/main/src/react/assets/images/architecture.png)

</div>

## ⚡ Quick Start

```bash
# 1. Clone the project (or use the "Use this template" button)
git clone https://github.com/rocambille/start-express-react.git my-project
cd my-project

# 2. Install dependencies and initialize the database
npm install
cp .env.sample .env
npm run database:sync

# 3. Start the application
npm run dev
```

> The application is available at `http://localhost:5173`

## 🤔 Why StartER?

We designed StartER around a simple philosophy: **zero hidden magic**.
It is a framework built for learning, rapid prototyping, and *hacking*. Heavy solutions tend to hide their complexity. StartER offers a readable and modifiable fullstack architecture (Express + React). You understand every line of code and keep control over your application.

## ✨ Key Features

* **100% readable codebase**: a clear architecture with no black boxes. Use it to learn and master fullstack development.
* **"Magic Link" authentication**: a secure, passwordless login system included out of the box.
* **Minimalist architecture**: the simplicity of Express balanced with the modularity of React.
* **Ready to use**: TypeScript, SQLite, and Docker for a smooth *Developer Experience*.

## 🧬 Don't generate, clone! (`make:clone`)

StartER introduces the `make:clone` command. Unlike a CRUD generator, you **clone your own logic**.

Need a new resource? Clone an existing module, like `item`. The command duplicates the files and renames variables and references. You get complete, immediately functional, and customizable code.

## 🧪 Contract-Based API Testing

StartER simplifies code reliability with an innovative contract-based approach.

Define your API structure once. We use the contracts to **generate API tests**, while **mocking API calls on the React side**. Less *boilerplate*, more reliability.

## 💻 Tech Stack

* **Backend**: Node.js, Express 5, Zod
* **Frontend**: React 19, React Router, Vite, Pico CSS
* **Database**: SQLite
* **Tooling**: TypeScript, Biome, Vitest, Docker

## 📖 Documentation

All documentation, deployment guides, and technical concepts are on the wiki.

👉 **[Read the official Wiki](https://github.com/rocambille/start-express-react/wiki)**

## 📄 License

Distributed under the [MIT](./LICENSE.md) license. You are free to use, modify, and redistribute it for educational or professional purposes.