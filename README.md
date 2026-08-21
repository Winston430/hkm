# Stationery Manager

Admin web application for managing a stationery business: products, categories, inventory, sales, users, and reports.

## Stack

- React + TypeScript (Vite)
- Tailwind CSS v4 (custom design tokens, no default theme)
- Firebase Authentication + Firestore
- React Router

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in your Firebase project config
npm run dev
```

## Firestore

Expected collections: `users`, `products`, `categories`, `sales`, `stock_movements`.

An authenticated user must have a matching document in `users/{uid}` with a `role` field (`admin` or `salesperson`) for the admin app to resolve their profile.

## Project structure

```
src/
├── lib/          # Firebase client setup, formatting helpers
├── services/     # Firestore/Auth data access (no UI code)
├── hooks/        # Data-fetching and auth hooks
├── store/        # App-wide React context
├── types/        # Shared TypeScript types
├── routes/       # Route guards
├── components/
│   ├── ui/       # Reusable design-system primitives
│   └── layout/   # AppShell, Sidebar, TopBar, mobile nav
└── pages/        # Route-level pages
```

## Status

Stage 1 (foundation): authentication, protected admin routes, app shell, and the dashboard are implemented. Products, Categories, Inventory, Sales, Users, and Reports are scaffolded as routes pending implementation.
