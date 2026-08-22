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

An authenticated user must have a matching document in `users/{uid}` with `role` (`admin` or `salesperson`) and `status` (`active` or `inactive`) fields for the admin app to resolve their profile. Only `role: "admin"` and `status: "active"` accounts can access `/admin/*`.

Security rules live in `firestore.rules` (deploy with `firebase deploy --only firestore:rules` once you've run `firebase init` / set the project with the Firebase CLI). They enforce the same admin-only write access at the database level — the frontend route guard alone is not security.

### Creating the first admin user

Firestore rules require an existing admin `users/{uid}` doc before anyone can create further user docs, so bootstrap the very first admin manually:

1. In the Firebase console, under Authentication, create a user with an email and password.
2. Copy that user's UID.
3. In Firestore, create a document at `users/{uid}` with:
   ```json
   {
     "name": "Your Name",
     "email": "you@example.com",
     "role": "admin",
     "status": "active",
     "lastActivityAt": null,
     "createdAt": 0,
     "updatedAt": 0
   }
   ```
4. Sign in with that email/password from `/login`.

Once you have one admin account, use the in-app Users screen to create the rest.

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
