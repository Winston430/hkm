# Stationery Manager

Web application for managing a stationery business: products, categories, inventory, sales, users, and reports.

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

## Roles & permissions

There are two roles:

- **admin** — full access: manage products (including cost/selling price), categories, inventory adjustments, review and refund sales, manage users, view reports and settings. Lands on `/admin/dashboard`.
- **agent** — a single screen at `/agent`: search products and record a sale (quantity, unit price, payment method). Cannot add/edit products, see other agents' sales, view reports, or manage users.

Permissions are enforced twice, independently:

- **In the app** — `ProtectedRoute` checks the signed-in user's role before rendering `/admin/*` or `/agent`, and an admin can also access `/agent` (since admins can do everything an agent can).
- **In Firestore** — `firestore.rules` enforces the same boundaries server-side, since a route guard alone is not security. In particular, a non-admin can only update a product's `stock` field (as a side effect of completing a sale) — never its name, price, or category — and can only read sales they recorded themselves; admins can read and manage everything.

Recording a sale, decrementing stock, and writing the audit-trail `stock_movements` entry all happen in one Firestore transaction (see `createSale` in `src/services/sales.ts`), so a sale can never exist without a matching stock change.

## Firestore

Expected collections: `users`, `products`, `categories`, `sales`, `stock_movements`, `settings`.

An authenticated user must have a matching document in `users/{uid}` with `role` (`admin` or `agent`) and `status` (`active` or `inactive`) fields for the app to resolve their profile.

Security rules live in `firestore.rules` (deploy with `firebase deploy --only firestore:rules` once you've run `firebase init` / set the project with the Firebase CLI).

### Creating the first admin user

Firestore rules require an existing admin `users/{uid}` doc before anyone can create further user docs — including the very first one — so bootstrap it with the Firebase Admin SDK, which bypasses those rules.

```bash
npm install   # installs firebase-admin, used only by this script
```

1. In the Firebase console, go to **Project Settings → Service Accounts → Generate new private key**. Save the downloaded file as `serviceAccountKey.json` in the project root (it's gitignored — never commit it).
2. Run:
   ```bash
   npm run create-admin -- --email you@example.com --password yourpassword --name "Your Name"
   ```
   This creates the Firebase Auth user (or reuses one with that email) and writes their `users/{uid}` doc with `role: "admin"` and `status: "active"`.
3. Sign in with that email/password at `/login`.

Once you have one admin account, use the in-app Users screen to create the rest — admins or agents alike.

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
│   └── layout/   # AppShell/AgentShell, Sidebar, TopBar, mobile nav
└── pages/        # Route-level pages
scripts/
└── create-admin.mjs   # Bootstraps the first admin (Firebase Admin SDK)
```

## Status

All admin sections (Dashboard, Products, Categories, Inventory, Sales, Users, Reports, Settings) and the agent's Record Sale screen are implemented against Firestore.
