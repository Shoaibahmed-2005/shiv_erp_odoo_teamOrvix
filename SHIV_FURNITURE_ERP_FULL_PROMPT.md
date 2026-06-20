# SHIV FURNITURE WORKS — MINI ERP — FULL PRODUCTION BUILD PROMPT

You are a senior full-stack developer. Build a complete, production-quality **Mini ERP system** for "Shiv Furniture Works," a furniture manufacturing company, for a competitive hackathon judged on: Database Design, Code Quality, Modularity, Frontend Design, Performance, Scalability, Security, Usability, API Design, and correctness of business logic (Sales/Purchase/Manufacturing/Inventory/Procurement).

Do NOT cut corners. Every module must be fully functional with real PostgreSQL persistence, real-time live updates, working role-based access control, a working procurement automation engine, working notifications, and a working payment flow with success/cancel handling.

---

## DEPLOYMENT ARCHITECTURE (IMPORTANT — READ FIRST)

- **Frontend:** Netlify (static React build)
- **Backend:** Render (Node.js web service, native runtime — **no Docker, no Kubernetes**)
- **Database:** Supabase, used **ONLY as a hosted PostgreSQL instance**

Connect to the database using the raw PostgreSQL connection string from Supabase's Database settings page, via the standard `pg` (node-postgres) driver — exactly as you would connect to a local PostgreSQL server. Do **NOT** use the `@supabase/supabase-js` client library, Supabase Auth, Supabase Row Level Security policies, or Supabase Realtime. All authentication, authorization, business logic, and real-time updates must be built entirely in this Express backend. Supabase is purely the Postgres host — nothing more.

**No Docker. No Kubernetes.** Render runs Node.js natively (`npm install` → `npm start`). Do not generate a Dockerfile or any container orchestration config — it adds no value at this scale and is not requested.

---

## TECH STACK

**Frontend:** React.js (Vite), React Router v6, Axios, Socket.io-client, Recharts, React Toastify, React Beautiful DnD (for the Manufacturing Kanban board)

**Backend:** Node.js, Express.js, Socket.io server, PostgreSQL (`pg`), bcryptjs, jsonwebtoken, express-validator, cors, helmet, morgan, compression, express-rate-limit, node-cache, razorpay (Node SDK)

**Database:** PostgreSQL hosted on Supabase (connected via plain connection string, see above)

**Payments:** Razorpay (test mode) — you will receive test `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` to place in `.env`; build the integration to work the moment those are added, with no other code changes needed

---

## PROJECT STRUCTURE

```
shiv-erp/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js
│   │   │   └── socket.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── userController.js
│   │   │   ├── permissionController.js
│   │   │   ├── productController.js
│   │   │   ├── customerController.js
│   │   │   ├── vendorController.js
│   │   │   ├── salesOrderController.js
│   │   │   ├── purchaseOrderController.js
│   │   │   ├── bomController.js
│   │   │   ├── manufacturingOrderController.js
│   │   │   ├── workCenterController.js
│   │   │   ├── inventoryController.js
│   │   │   ├── procurementEngine.js
│   │   │   ├── notificationController.js
│   │   │   ├── paymentController.js
│   │   │   ├── auditController.js
│   │   │   └── dashboardController.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   ├── checkPermission.js
│   │   │   ├── validate.js
│   │   │   └── auditLogger.js
│   │   ├── routes/        (one file per controller)
│   │   ├── sockets/
│   │   │   └── erpEvents.js
│   │   ├── utils/
│   │   │   ├── procurementHelpers.js
│   │   │   ├── stockLedger.js
│   │   │   └── orderNumberGenerator.js
│   │   └── app.js
│   ├── migrations/init.sql
│   ├── seeds/seed.sql
│   ├── .env
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   ├── _redirects        ← Netlify SPA routing: /* /index.html 200
│   │   ├── logo.png
│   │   └── favicon.png
│   ├── src/
│   │   ├── api/              (one file per resource)
│   │   ├── sockets/socketClient.js
│   │   ├── components/
│   │   │   ├── common/ (Sidebar, Topbar, NotificationBell, ProtectedRoute, ErrorBoundary, PermissionGate)
│   │   │   ├── products/
│   │   │   ├── sales/
│   │   │   ├── purchase/
│   │   │   ├── manufacturing/ (KanbanBoard, MOCard, WorkOrderChecklist)
│   │   │   ├── inventory/ (StockTable, StockFlowDiagram)
│   │   │   ├── payments/ (RazorpayCheckoutButton)
│   │   │   └── charts/
│   │   ├── pages/
│   │   │   ├── Auth/ (Login.jsx, Register.jsx, PendingApproval.jsx)
│   │   │   ├── Dashboard/Dashboard.jsx
│   │   │   ├── Products/Products.jsx
│   │   │   ├── Sales/ (SalesOrders.jsx, SalesOrderDetail.jsx, Customers.jsx)
│   │   │   ├── Purchase/ (PurchaseOrders.jsx, PurchaseOrderDetail.jsx, Vendors.jsx)
│   │   │   ├── Manufacturing/ (ManufacturingBoard.jsx, MODetail.jsx, WorkCenters.jsx)
│   │   │   ├── BoM/BillOfMaterials.jsx
│   │   │   ├── Inventory/Inventory.jsx
│   │   │   ├── AuditLogs/AuditLogs.jsx
│   │   │   └── Admin/ (UsersRoles.jsx, Permissions.jsx, Settings.jsx)
│   │   ├── context/ (AuthContext.jsx, NotificationContext.jsx)
│   │   ├── hooks/ (useAuth.js, useSocket.js, usePermission.js, useDebounce.js)
│   │   ├── styles/ (variables.css, global.css)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
│
└── README.md
```

---

## DATABASE SCHEMA (backend/migrations/init.sql)

```sql
-- USERS
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(30) DEFAULT 'pending' CHECK (role IN (
    'pending','admin','sales_user','purchase_user',
    'manufacturing_user','inventory_manager','business_owner'
  )),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ROLE PERMISSIONS (configurable matrix — satisfies "User Access Rights" module)
CREATE TABLE IF NOT EXISTS role_permissions (
  id SERIAL PRIMARY KEY,
  role VARCHAR(30) NOT NULL,
  module VARCHAR(50) NOT NULL,
  can_view BOOLEAN DEFAULT false,
  can_create BOOLEAN DEFAULT false,
  can_edit BOOLEAN DEFAULT false,
  can_delete BOOLEAN DEFAULT false,
  UNIQUE(role, module)
);

-- CUSTOMERS
CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  address TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- VENDORS
CREATE TABLE IF NOT EXISTS vendors (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  address TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- WORK CENTERS
CREATE TABLE IF NOT EXISTS work_centers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL
);

-- PRODUCTS (central inventory model)
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  category VARCHAR(100),
  sales_price DECIMAL(10,2) DEFAULT 0,
  cost_price DECIMAL(10,2) DEFAULT 0,
  uom VARCHAR(30) DEFAULT 'unit',
  on_hand_qty INTEGER DEFAULT 0,
  reserved_qty INTEGER DEFAULT 0,
  reorder_point INTEGER DEFAULT 10,
  procurement_strategy VARCHAR(10) DEFAULT 'mts' CHECK (procurement_strategy IN ('mts','mto')),
  procure_on_demand BOOLEAN DEFAULT false,
  procurement_type VARCHAR(20) CHECK (procurement_type IN ('purchase','manufacturing')),
  default_vendor_id INTEGER REFERENCES vendors(id),
  default_bom_id INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- BILL OF MATERIALS
CREATE TABLE IF NOT EXISTS boms (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE products ADD CONSTRAINT fk_default_bom
  FOREIGN KEY (default_bom_id) REFERENCES boms(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS bom_components (
  id SERIAL PRIMARY KEY,
  bom_id INTEGER REFERENCES boms(id) ON DELETE CASCADE,
  component_product_id INTEGER REFERENCES products(id),
  quantity DECIMAL(10,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS bom_operations (
  id SERIAL PRIMARY KEY,
  bom_id INTEGER REFERENCES boms(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  duration_minutes INTEGER NOT NULL,
  work_center_id INTEGER REFERENCES work_centers(id),
  sequence INTEGER DEFAULT 0
);

-- SALES ORDERS
CREATE TABLE IF NOT EXISTS sales_orders (
  id SERIAL PRIMARY KEY,
  order_number VARCHAR(30) UNIQUE NOT NULL,
  customer_id INTEGER REFERENCES customers(id),
  sales_user_id INTEGER REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft','confirmed','partially_delivered','fully_delivered','cancelled')),
  payment_required BOOLEAN DEFAULT false,
  payment_status VARCHAR(20) DEFAULT 'not_applicable' CHECK (payment_status IN ('not_applicable','pending','paid','failed','cancelled')),
  subtotal DECIMAL(12,2) DEFAULT 0,
  tax_total DECIMAL(12,2) DEFAULT 0,
  total DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sales_order_items (
  id SERIAL PRIMARY KEY,
  sales_order_id INTEGER REFERENCES sales_orders(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  delivered_qty INTEGER DEFAULT 0,
  line_total DECIMAL(12,2) NOT NULL
);

-- PURCHASE ORDERS
CREATE TABLE IF NOT EXISTS purchase_orders (
  id SERIAL PRIMARY KEY,
  order_number VARCHAR(30) UNIQUE NOT NULL,
  vendor_id INTEGER REFERENCES vendors(id),
  purchase_user_id INTEGER REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft','confirmed','partially_received','fully_received','cancelled')),
  total DECIMAL(12,2) DEFAULT 0,
  auto_generated BOOLEAN DEFAULT false,
  triggered_by_sales_order_id INTEGER REFERENCES sales_orders(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS purchase_order_items (
  id SERIAL PRIMARY KEY,
  purchase_order_id INTEGER REFERENCES purchase_orders(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  received_qty INTEGER DEFAULT 0,
  line_total DECIMAL(12,2) NOT NULL
);

-- MANUFACTURING ORDERS
CREATE TABLE IF NOT EXISTS manufacturing_orders (
  id SERIAL PRIMARY KEY,
  mo_number VARCHAR(30) UNIQUE NOT NULL,
  product_id INTEGER REFERENCES products(id),
  quantity INTEGER NOT NULL,
  bom_id INTEGER REFERENCES boms(id),
  assignee_id INTEGER REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft','in_progress','quality_check','completed','cancelled')),
  auto_generated BOOLEAN DEFAULT false,
  triggered_by_sales_order_id INTEGER REFERENCES sales_orders(id),
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS work_orders (
  id SERIAL PRIMARY KEY,
  manufacturing_order_id INTEGER REFERENCES manufacturing_orders(id) ON DELETE CASCADE,
  operation_name VARCHAR(100) NOT NULL,
  work_center_id INTEGER REFERENCES work_centers(id),
  duration_minutes INTEGER,
  sequence INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','in_progress','done'))
);

-- STOCK LEDGER (every inventory movement, ever)
CREATE TABLE IF NOT EXISTS stock_ledger (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id),
  change_qty INTEGER NOT NULL,
  reason VARCHAR(200),
  reference_type VARCHAR(30) CHECK (reference_type IN ('sales_order','purchase_order','manufacturing_order','manual_adjustment')),
  reference_id INTEGER,
  balance_after INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  action VARCHAR(150) NOT NULL,
  entity VARCHAR(100) NOT NULL,
  entity_id INTEGER,
  old_value JSONB,
  new_value JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  role VARCHAR(30),
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(30) CHECK (type IN ('low_stock','shortage_trigger','order_status','delay','payment','system')),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- PAYMENTS
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  sales_order_id INTEGER REFERENCES sales_orders(id),
  gateway VARCHAR(20) DEFAULT 'razorpay',
  gateway_order_id VARCHAR(150),
  gateway_payment_id VARCHAR(150),
  amount DECIMAL(12,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'created' CHECK (status IN ('created','success','failed','cancelled')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_sales_orders_status ON sales_orders(status);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_mo_status ON manufacturing_orders(status);
CREATE INDEX IF NOT EXISTS idx_stock_ledger_product ON stock_ledger(product_id);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity, entity_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_payments_sales_order ON payments(sales_order_id);
```

---

## SEED DATA (backend/seeds/seed.sql)

- 1 admin: `admin@shivfurniture.com` / `Admin@123`
- 1 each of: sales_user, purchase_user, manufacturing_user, inventory_manager, business_owner — emails like `sales@shivfurniture.com` / `Sales@123` etc.
- Default `role_permissions` matrix seeded per the table below (admin gets full CRUD everywhere; others scoped to their module + read-only on Products/Inventory where relevant)
- Work centers: Assembly Line, Paint Floor, Packaging Unit
- 7 products: Wooden Dining Table (MTO, manufacturing), Office Chair (MTS), Wooden Legs (raw material, MTS, low stock — on_hand near reorder_point to demo the alert), Wooden Top (raw material), Screws Pack (raw material), Bookshelf (MTS), Sofa Set (MTO, manufacturing)
- 1 BoM for Wooden Dining Table: components (Wooden Legs x4, Wooden Top x1, Screws Pack x12), operations (Assembly 60min/Assembly Line, Painting 30min/Paint Floor, Packing 20min/Packaging Unit)
- 3 vendors, 3 customers
- A handful of historical Sales/Purchase/Manufacturing Orders in varying statuses so the dashboard isn't empty on first load
- A few seeded notifications and audit log entries

### Default Role Permissions Matrix (seed exactly this)

| Role | Products | Sales | Purchase | Manufacturing | BoM | Inventory | Audit Logs | Users |
|---|---|---|---|---|---|---|---|---|
| admin | Full | Full | Full | Full | Full | Full | Full | Full |
| sales_user | View | Full | None | None | None | View | None | None |
| purchase_user | View | None | Full | None | None | View | None | None |
| manufacturing_user | View | None | None | Full | Full | View | None | None |
| inventory_manager | View+Edit | View | View | View | View | Full | None | None |
| business_owner | Full | View | View | View | View | View | View | None |

---

## AUTH & SIGN-UP FLOW

- **Sign Up:** anyone can self-register with name/email/password, but new accounts get `role = 'pending'` and **zero access**. On login, a pending user sees a "Waiting for Admin Approval" screen — nothing else.
- **Admin approves:** in Users & Roles, Admin assigns a real role to pending users. This is deliberate — it satisfies the "User Access Rights" requirement properly (nobody can self-grant Admin) and is good practice for the Security judging criteria.
- **Login:** standard email+password, returns JWT with `{ id, role }` embedded. Frontend reads role from `/auth/me` and renders the sidebar/routes accordingly via a `PermissionGate` component that checks `role_permissions` (fetched once on login, cached in context).

---

## PROCUREMENT AUTOMATION ENGINE (backend/src/controllers/procurementEngine.js)

This is the centerpiece of the business logic. Implement exactly this flow when a Sales Order is confirmed:

```
FOR each line item in the Sales Order:
  1. Calculate free_to_use = product.on_hand_qty - product.reserved_qty
  2. IF free_to_use >= quantity_ordered:
       - Reserve stock: products.reserved_qty += quantity_ordered
       - Write stock_ledger entry (reference_type='sales_order')
       - No procurement needed
  3. ELSE (shortage exists):
       - shortage = quantity_ordered - free_to_use
       - Reserve whatever IS available: products.reserved_qty += free_to_use
       - IF product.procurement_strategy = 'mto' AND product.procure_on_demand = true:
           - IF product.procurement_type = 'purchase':
               → Auto-create a Purchase Order (status='draft', auto_generated=true,
                 triggered_by_sales_order_id=this order) for `shortage` units
                 from product.default_vendor_id
           - IF product.procurement_type = 'manufacturing':
               → Auto-create a Manufacturing Order (status='draft', auto_generated=true,
                 triggered_by_sales_order_id=this order) for `shortage` units
                 using product.default_bom_id
       - Write an audit_logs entry: action='auto_procurement_triggered'
       - Create a notification for the relevant role (purchase_user or manufacturing_user)
         AND for admin/business_owner: "Shortage of {shortage} units of {product.name} —
         auto-created {PO-xxx / MO-xxx}"
       - Emit socket event `procurement:triggered` so the dashboard updates live
```

**On Purchase Order receive:** increase `on_hand_qty` by received quantity, write `stock_ledger`, update PO item `received_qty`, recompute PO status (partially/fully received).

**On Manufacturing Order completion:**
1. For each BoM component: `on_hand_qty -= (component.quantity × MO.quantity)`, write `stock_ledger` (consumption, negative)
2. Release any `reserved_qty` that was held for this MO's components
3. For the finished product: `on_hand_qty += MO.quantity`, write `stock_ledger` (production, positive)
4. Set MO `status = 'completed'`, `completed_at = NOW()`
5. Emit `stock:updated` for every affected product so all connected dashboards refresh live without a page reload

All of the above must run inside a single PostgreSQL transaction (`BEGIN`/`COMMIT`/`ROLLBACK`) per action — never leave stock in a half-updated state if any step fails.

---

## LIVE UPDATES (Socket.io)

| Event | Trigger | Received by |
|---|---|---|
| `stock:updated` | Any stock-affecting action | Inventory page, Product list, Dashboard |
| `procurement:triggered` | Shortage auto-creates PO/MO | Dashboard, Purchase/Manufacturing pages |
| `order:status_changed` | Any SO/PO/MO status change | Relevant list pages, Dashboard |
| `notification:new` | Any notification created | NotificationBell (all connected clients matching user/role) |
| `payment:status_changed` | Payment success/cancel/fail | Sales Order detail page |

**Render free-tier note to handle gracefully:** free web services sleep after ~15 minutes of inactivity and take 30-60 seconds to wake on the first request. Implement a small frontend "Connecting to server..." loading state for the first API call so this doesn't look broken during a demo — and remind the team to open the deployed app a few minutes before presenting to "warm it up."

---

## PAYMENT MODULE (Razorpay test mode)

This is an addition beyond the core spec — used on the Sales Order detail page when `payment_required = true`.

**.env additions:**
```
RAZORPAY_KEY_ID=your_test_key_id_here
RAZORPAY_KEY_SECRET=your_test_key_secret_here
```

**Flow:**
1. On Sales Order detail, if payment is required and not yet paid, show "Pay Now" button
2. Backend `POST /api/v1/payments/create-order` → calls Razorpay SDK to create a Razorpay order for the SO total, inserts a `payments` row with `status='created'`, returns `gateway_order_id` to frontend
3. Frontend opens Razorpay Checkout (test mode) using the returned order id and the public key
4. **On success:** Razorpay returns a payment id + signature → frontend calls `POST /api/v1/payments/verify` → backend verifies the signature using `RAZORPAY_KEY_SECRET` → on valid signature: `payments.status='success'`, `sales_orders.payment_status='paid'`, proceed to run the procurement engine reservation logic (order effectively becomes Confirmed)
5. **On user cancellation** (closes the checkout modal): frontend calls `POST /api/v1/payments/cancel` with the `gateway_order_id` → backend sets that `payments.status='cancelled'` → **the Sales Order status remains `draft`/`payment_status='pending'`, no stock is reserved, no procurement is triggered.** This is critical — a cancelled payment must never result in a booked order.
6. **On failure** (card declined etc.): Razorpay's failure callback → same as cancel: `payments.status='failed'`, order stays unconfirmed.

---

## NOTIFICATIONS SYSTEM

- Bell icon in the Topbar, real unread count badge (not decorative — must reflect actual unread rows from `notifications` table for the logged-in user/role)
- Clicking opens a dropdown list of recent notifications, click-to-mark-read, "Mark all as read" action
- Notifications are created server-side at these trigger points: low stock crossing `reorder_point` (checked after every stock-affecting action), shortage-triggered auto-procurement, order status changes, payment status changes, manufacturing order delays (if `created_at` is more than X days past expected completion — flag as `type='delay'`)
- Delivered to the frontend via Socket.io in real time AND persisted in the DB so they survive a refresh

---

## ALL API ROUTES (summary — implement full CRUD + these specific actions)

- `/api/v1/auth/` — register, login, me
- `/api/v1/users/` — admin: list, assign-role, toggle-active
- `/api/v1/permissions/` — admin: view/edit the role_permissions matrix
- `/api/v1/products/` — CRUD, GET /:id/stock-history (stock_ledger for this product)
- `/api/v1/customers/`, `/api/v1/vendors/` — CRUD
- `/api/v1/work-centers/` — CRUD
- `/api/v1/boms/` — CRUD with nested components + operations
- `/api/v1/sales-orders/` — CRUD, POST /:id/confirm (runs procurement engine), POST /:id/deliver (partial/full)
- `/api/v1/purchase-orders/` — CRUD, POST /:id/confirm, POST /:id/receive (partial/full)
- `/api/v1/manufacturing-orders/` — CRUD, PATCH /:id/work-orders/:woId (advance status), POST /:id/complete (runs stock consumption/production logic)
- `/api/v1/inventory/` — GET / (full stock table), GET /stock-flow (aggregate movement summary for the flow diagram)
- `/api/v1/notifications/` — GET /, PATCH /:id/read, PATCH /read-all
- `/api/v1/payments/` — create-order, verify, cancel
- `/api/v1/audit-logs/` — admin/business_owner only, filterable
- `/api/v1/dashboard/` — aggregate stats for the dashboard cards and charts

Every mutating route must be wrapped by `checkPermission(module, action)` middleware that reads the `role_permissions` table for `req.user.role` — **not** hardcoded if/else role checks, so Admin can actually reconfigure access from the UI and have it take effect immediately.

---

## SECURITY

- bcrypt saltRounds 12, JWT 7-day expiry
- Parameterized SQL exclusively, everywhere, no exceptions
- `checkPermission` middleware on every mutating route, driven by the DB-backed permission matrix
- Pending-role users get zero route access until approved
- Helmet, CORS restricted to the Netlify domain only
- Rate limiting on auth routes (100 req/15min/IP)
- Razorpay signature verification on every payment confirmation — never trust the frontend's claim of payment success
- All financial/stock-mutating actions wrapped in DB transactions
- password_hash never returned in any API response

---

## FRONTEND — DESIGN SYSTEM

Reuse the Charcoal Slate + Copper/Amber palette from the earlier UI exploration:

```css
:root {
  --color-primary: #1E293B;
  --color-primary-light: #334155;
  --color-secondary: #C2703D;
  --color-secondary-light: #E08E5B;
  --color-success: #16A34A;
  --color-warning: #D97706;
  --color-danger: #DC2626;
  --color-bg: #F8FAFC;
  --color-surface: #FFFFFF;
  --color-border: #E2E8F0;
  --color-text-primary: #0F172A;
  --color-text-secondary: #64748B;
  --font-family: 'Inter', sans-serif;
}
```

Sidebar navigation (fixed left, filtered per `role_permissions`), top bar with NotificationBell + user avatar/role badge. All icons in tables (edit/delete/view) must be wired to real handlers — no decorative icons anywhere.

---

## FINAL CHECKLIST

- [ ] Full schema (18 tables) with FKs, indexes, CHECK constraints
- [ ] Auto-migration + auto-seed on backend startup (only seeds if `products` is empty)
- [ ] Sign up → pending role → Admin approval → role assignment flow
- [ ] DB-backed configurable role_permissions matrix, enforced via middleware (not hardcoded)
- [ ] All 5 core modules: Products, Sales, Purchase, Manufacturing, BoM — full CRUD + workflows
- [ ] Procurement engine: MTS direct-reserve path AND MTO shortage→auto-PO/MO path, both working and visibly triggering
- [ ] Stock ledger recording every single inventory movement with correct running balance
- [ ] Manufacturing: BoM-driven component consumption + finished goods production, wrapped in a transaction
- [ ] Real-time live updates via Socket.io across Dashboard/Inventory/Orders — verified by opening two browser tabs and watching one update from an action in the other
- [ ] Notifications: real DB-backed, real unread count, real triggers (low stock, shortage, status change, delay, payment)
- [ ] Payment module: Razorpay test mode, success → confirms order, cancel/fail → order stays unconfirmed with zero stock impact
- [ ] Audit logs capturing every mutating action with old/new value diffs
- [ ] Dashboard with live stats + low-stock alerts + stock-flow visualization
- [ ] Responsive design, consistent CSS variables, all icons functional
- [ ] Deployment-ready: Netlify `_redirects` file present, Render start command documented, Supabase connection string usage documented (as plain Postgres, not BaaS)
- [ ] No Docker, no Kubernetes files anywhere in the repo
- [ ] Complete README with default accounts table and deployment steps for all three platforms

---

## CRITICAL INSTRUCTIONS

1. Build order: schema → seed → auth/RBAC → Products → Sales/Purchase → Manufacturing/BoM → procurement engine → stock ledger → notifications → Socket.io wiring → payments → dashboard → audit logs
2. ALL SQL parameterized, zero exceptions
3. Every stock-mutating sequence (SO confirm, PO receive, MO complete) runs inside a single DB transaction — roll back entirely on any failure
4. Permission checks are DB-driven via `role_permissions`, never hardcoded role string comparisons scattered through controllers
5. Payment cancellation/failure must NEVER confirm an order or touch stock — verify this explicitly during testing
6. Do not generate Dockerfile, docker-compose.yml, or any Kubernetes manifests
7. Use the Supabase connection string exactly as you would a local Postgres URL — no Supabase SDK imports anywhere in the codebase
8. App starts locally with: `cd backend && npm run dev` + `cd frontend && npm run dev`
9. Git commit convention: `feat: add procurement engine MTO path`, `fix: prevent stock reservation on cancelled payment`, `chore: add stock ledger indexes`
