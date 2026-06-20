# Shiv Furniture Works Mini ERP

Production-oriented mini ERP for furniture manufacturing with a React frontend, Express backend, Socket.io live updates, and PostgreSQL persistence hosted on Supabase as plain Postgres.

## Stack

- Frontend: React, Vite, React Router, Axios, Socket.io client, Recharts, React Toastify, lucide icons
- Backend: Node.js, Express, Socket.io, pg, bcryptjs, JWT, Helmet, CORS, Razorpay SDK
- Database: Supabase PostgreSQL through `DATABASE_URL` only. No Supabase SDK, Auth, RLS, or Realtime.

## Local Run

1. Create `backend/.env` from `backend/.env.example`.
2. Set `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL=http://localhost:5173`, and Razorpay test keys when available.
3. Install and run backend:

```bash
cd backend
npm install
npm run dev
```

4. Install and run frontend:

```bash
cd frontend
npm install
npm run dev
```

The backend auto-runs `migrations/init.sql` and seeds only when `products` is empty.

## Default Accounts

| Role | Email | Password |
|---|---|---|
| Admin | admin@shivfurniture.com | Admin@123 |
| Sales | sales@shivfurniture.com | Sales@123 |
| Purchase | purchase@shivfurniture.com | Purchase@123 |
| Manufacturing | manufacturing@shivfurniture.com | Manufacturing@123 |
| Inventory | inventory@shivfurniture.com | Inventory@123 |
| Business Owner | owner@shivfurniture.com | Owner@123 |

## Deployment

- Render backend: Node native runtime, build command `npm install`, start command `npm start`, root `backend`.
- Netlify frontend: root `frontend`, build command `npm run build`, publish directory `dist`. `_redirects` is included for SPA routing.
- Supabase: use the raw Postgres connection string in `DATABASE_URL`.

Render free services may sleep after inactivity. Open the deployed app a few minutes before a demo so the first API request can warm up cleanly.

## Notes

- Stock-affecting workflows use database transactions.
- Permissions are read from `role_permissions` through middleware.
- Payment cancellation/failure only updates payment state and never reserves stock or confirms an order.
- Do not add Docker, docker-compose, or Kubernetes files for this deployment target.
