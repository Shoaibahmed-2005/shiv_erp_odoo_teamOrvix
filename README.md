<div align="center">
  <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/factory.svg" width="80" alt="Logo" />
  <h1>Shiv Furniture Works ERP</h1>
  <p><strong>A Modern, Production-Oriented Mini ERP with Real-Time Capabilities</strong></p>

  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/Express.js-404D59?style=for-the-badge" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101" />
</div>

<br />

Shiv Furniture Works ERP is a comprehensive, full-stack application built to manage end-to-end manufacturing and sales workflows. It is designed around a **Procurement on Demand** engine that automatically triggers manufacturing and purchasing based on real-time sales and inventory levels.

---

## ✨ Key Features

### 🛒 Sales & Order Management
- **Draft to Deliver Pipeline:** Complete lifecycle tracking from draft to partial/full delivery.
- **Payment Integration:** Embedded Razorpay integration for secure payment processing.
- **Auto-Procurement:** Instantly generates Purchase or Manufacturing orders if sales demand exceeds available stock.

### 📦 Inventory & Procurement
- **Real-Time Stock Ledger:** WebSockets provide live updates on `On Hand`, `Reserved`, and `Free to Use` quantities across all connected clients.
- **Low Stock Alerts:** Automated warnings and 1-click "Quick Reorder" capabilities when items fall below their minimum reorder point.
- **MTO & MTS Strategies:** Supports both Make-to-Order (build on demand) and Make-to-Stock (build to minimums) strategies.

### 🏭 Manufacturing
- **Bills of Materials (BoM):** Define exact raw material requirements and multi-step manufacturing operations.
- **Live Consumption:** Completing a manufacturing order instantly consumes raw materials and adds finished goods to the warehouse.

### 🔐 Security & Administration
- **Role-Based Access Control (RBAC):** Strict boundaries for Sales, Purchase, Manufacturing, Inventory, and Admin roles.
- **Undeletable Audit Logs:** Every critical action (create, update, confirm, deliver) is cryptographically stamped and visible in the real-time activity feed.
- **Stateless Auth:** Secure JWT-based authentication.

---

## 🔄 System Workflow (How It Works)

To understand the core engine of this ERP, here is the standard lifecycle of an order:

1. **Demand Generation (Sales):** A Sales User creates a Sales Order for a product. At this stage, it is a draft.
2. **Stock Reservation & Calculation:** When the Sales Order is **Confirmed**, the backend intercepts the request and calculates shortages:
   - *If `On Hand` stock exists:* It instantly marks the stock as `Reserved`.
   - *If there is a shortage:* The **Procurement Engine** checks the product's `Procurement on Demand` flag.
3. **Automated Procurement:** If the flag is true, the system automatically dispatches a fulfillment order:
   - For `Purchased` products, it generates a **Purchase Order** to the default vendor.
   - For `Manufactured` products, it generates a **Manufacturing Order** and duplicates the required Bill of Materials (BoM) operations.
4. **Fulfillment (Inventory Sync):** Once the Purchase Order is received or the Manufacturing Order is completed, raw materials are consumed, and finished goods are added to `On Hand` inventory. 
5. **Real-Time Broadcast:** Throughout this entire process, PostgreSQL triggers and Express WebSockets (`socket.io`) broadcast `stock:updated` and `order:status_changed` events, instantly updating the dashboards of every connected user without page reloads.

---

## 🏗️ Architecture & Tech Stack

The application is split into a separated client-server architecture:

* **Frontend:** React, Vite, React Router, Recharts, Lucide Icons, Axios.
* **Backend:** Node.js, Express, Socket.io (for live events), `pg` (for raw PostgreSQL queries), bcryptjs, JWT, Helmet.
* **Database:** PostgreSQL (hosted on Supabase) utilizing strict relational constraints, foreign keys, and atomic transactions. *Note: No Supabase proprietary SDKs, RLS, or Realtime APIs are used—it runs as a pure Postgres instance.*

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- A PostgreSQL Database (Local or Supabase)

### 1. Database Setup
Create a `.env` file in the `backend/` directory based on the provided `.env.example`:
```env
DATABASE_URL=postgresql://user:password@host:port/dbname
JWT_SECRET=your_super_secret_key
FRONTEND_URL=http://localhost:5173
RAZORPAY_KEY_ID=your_test_key_id_here
RAZORPAY_KEY_SECRET=your_test_key_secret_here
```
*Note: The backend automatically runs `migrations/init.sql` and seeds the database with initial users and products when the server starts and the `products` table is empty.*

### 2. Run Backend
```bash
cd backend
npm install
npm run dev
```
*The backend will run on `http://localhost:5000`.*

### 3. Run Frontend
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
*The frontend will run on `http://localhost:5173`.*

---

## 🔑 Demo Credentials

Use the following accounts to explore the RBAC capabilities:

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@shivfurniture.com` | `Admin@123` |
| **Sales** | `sales@shivfurniture.com` | `Sales@123` |
| **Purchase** | `purchase@shivfurniture.com` | `Purchase@123` |
| **Manufacturing** | `manufacturing@shivfurniture.com` | `Manufacturing@123` |
| **Inventory** | `inventory@shivfurniture.com` | `Inventory@123` |
| **Business Owner** | `owner@shivfurniture.com` | `Owner@123` |

---

## ☁️ Deployment Guide

This project is built to be deployed easily on modern PaaS providers:

* **Backend (Render / Railway):** 
  - Build command: `npm install`
  - Start command: `npm start`
  - Root directory: `backend`
* **Frontend (Netlify / Vercel):** 
  - Build command: `npm run build`
  - Publish directory: `dist`
  - Root directory: `frontend`
  - *Note: `_redirects` is included for SPA routing.*
* **Database (Supabase / Neon):** 
  - Ensure the raw Postgres connection string is placed in the backend's `DATABASE_URL`.

---

<div align="center">
  <i>Engineered for Reliability, Built for Scale.</i>
</div>
