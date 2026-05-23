# 📋 Kanban Board

A fully functional Kanban Board web app for managing tasks and workflows.

**Developed by [Huncho.dev](https://huncho.dev)**

---

## ✨ Features

- **Drag & Drop** — Move cards between columns with smooth interactions
- **State Management** — Zustand for clean, reactive state
- **LocalStorage Persistence** — Your board survives page refreshes
- **Smooth Animations** — Framer Motion transitions throughout
- **Dark / Light Mode** — Toggle switch with system preference detection
- **Search** — Global search bar highlights matching cards instantly
- **Inline Editing** — Click column titles and cards to edit in place
- **Priority System** — Color-coded Low (green) / Medium (amber) / High (red)
- **Responsive** — Works on desktop and mobile
- **Confirmation Dialogs** — No accidental deletions

## 🛠 Tech Stack

| Technology | Purpose |
|---|---|
| React + Vite | Framework & build tool |
| Tailwind CSS | Utility-first styling |
| @dnd-kit/core | Drag and drop |
| Zustand | State management |
| Framer Motion | Animations |
| LocalStorage | Data persistence |

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## 📦 Production Build

```bash
npm run build
npm run preview
```

## 🌐 Deploy to Vercel

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/kanban-board.git
git push -u origin main
```

Then import the repo at [vercel.com](https://vercel.com) and deploy.

## 📁 Project Structure

```
src/
├── components/
│   ├── Board.jsx
│   ├── Column.jsx
│   ├── Card.jsx
│   └── AddCardForm.jsx
├── store/
│   └── useBoardStore.js
├── hooks/
│   └── useLocalStorage.js
├── utils/
│   └── helpers.js
├── assets/
│   └── logo.png
├── App.jsx
├── main.jsx
└── index.css
```

---

**© 2025 Huncho.dev — All rights reserved.**
