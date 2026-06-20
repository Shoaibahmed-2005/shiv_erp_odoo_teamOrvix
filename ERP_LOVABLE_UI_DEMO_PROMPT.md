# SHIV FURNITURE WORKS — MINI ERP (UI-ONLY DEMO PROMPT FOR LOVABLE)

Build a **UI-only, click-through demo** of a Mini ERP system for "Shiv Furniture Works," a furniture manufacturing company. This is a frontend visual/UX preview only — use hardcoded mock data throughout. No real backend, no database, no authentication logic needed — just clean navigation between screens with realistic-looking dummy data so we can evaluate the layout, flow, and design before building the real backend.

---

## BRAND & DESIGN SYSTEM

**App name:** Shiv Furniture Works — ERP
**Tone:** Professional, enterprise, clean — but not boring. Should feel like a modern internal tool a growing manufacturing business would actually use and be proud of.

**Color Palette (use these exact values, do not substitute):**
```
Primary (Charcoal Slate):    #1E293B
Primary Light:                #334155
Secondary (Copper/Amber):     #C2703D
Secondary Light:               #E08E5B
Accent (Success Green):        #16A34A
Warning:                       #D97706
Danger:                        #DC2626
Background:                    #F8FAFC
Surface (cards):               #FFFFFF
Border:                        #E2E8F0
Text Primary:                  #0F172A
Text Secondary:                #64748B
```

**Typography:** Inter font, clean and readable, slightly tighter letter-spacing for a data-dense enterprise feel.

**Visual style:**
- Sidebar navigation (fixed left), not a top navbar — this is an internal business tool, sidebar pattern is more appropriate
- Cards with subtle shadows, 12px border radius
- Status badges with color coding (Draft = gray, Confirmed = amber, Partial = blue, Completed/Fully Received/Delivered = green, Cancelled = red)
- Data tables with sticky headers, alternating subtle row shading
- Use a small amount of warm copper/amber as accent on primary buttons and active nav states — everything else stays in cool slate/gray tones for a professional look

---

## NAVIGATION STRUCTURE (Left Sidebar)

```
🏠 Dashboard
📦 Products
🛒 Sales Orders
📥 Purchase Orders
🏭 Manufacturing Orders
📋 Bill of Materials (BoM)
📊 Inventory / Stock
📜 Audit Logs
👥 Users & Roles
⚙️ Settings
```

Show the currently logged-in user's name and role badge ("Admin" / "Sales User" / "Purchase User" / "Manufacturing User" / "Inventory Manager") at the bottom of the sidebar with an avatar.

---

## SCREENS TO BUILD

### 1. Dashboard
A real-time-feeling overview screen with:
- 6 stat cards in a grid: Total Sales Orders (24), Pending Deliveries (5), Manufacturing Orders (8), Delayed Orders (2, shown in red/warning), Total Purchase Orders (12), Partial Receipts (3)
- A "Low Stock Alerts" panel — list of 3-4 products with a red/amber indicator showing current stock vs reorder threshold (e.g., "Wooden Legs — 18 units left — Reorder at 50")
- A simple bar chart: "Orders This Week" (Sales vs Purchase vs Manufacturing, side by side bars per day, mock data for last 7 days)
- A "Recent Activity" feed showing the last 6 audit-log-style entries (e.g., "Sales Order SO-1042 confirmed by Riya", "Manufacturing Order MO-218 completed", "Purchase Order PO-301 partially received")

### 2. Products
- Table view: Name, Category, Sales Price, Cost Price, On-Hand Qty, Reserved Qty, Free-to-Use Qty (computed visually as On-Hand minus Reserved), Procurement Strategy badge (MTS in blue / MTO in amber)
- Mock products: "Wooden Dining Table", "Office Chair", "Wooden Legs" (raw material), "Wooden Top" (raw material), "Screws Pack", "Bookshelf", "Sofa Set"
- "+ Add Product" button opens a side-drawer form with fields: Name, Category dropdown, Sales Price, Cost Price, Initial Stock, Procurement Strategy toggle (MTS/MTO), if MTO show additional fields: Procure on Demand toggle, Procurement Type (Purchase/Manufacturing) radio, Vendor dropdown (if Purchase) or BoM dropdown (if Manufacturing)
- Clicking a row opens a detail panel showing a small stock breakdown: On Hand / Reserved / Free to Use as three mini stat tiles, plus a "Stock Movement History" mini table (mock entries showing +/- changes with dates and reasons like "Sales Order SO-1040", "Purchase Order PO-298")

### 3. Sales Orders
- Table: Order #, Customer, Date, Items Count, Total Amount, Status badge (Draft/Confirmed/Partially Delivered/Fully Delivered/Cancelled)
- Mock orders: SO-1038 through SO-1045 with varying statuses
- "+ New Sales Order" opens a form: Customer dropdown, then a line-items table where you pick a Product, see its current Free-to-Use stock inline next to the quantity field (e.g., "Wooden Table — Available: 5" — if you type quantity greater than 5, show an inline amber warning: "Shortage of 3 units — will trigger procurement on confirm")
- Order detail view shows: status timeline (Draft → Confirmed → Partially Delivered → Fully Delivered as a horizontal stepper), line items table, a "Confirm Order" button, and once confirmed, a "Mark as Delivered" button with partial delivery support (input how many units delivered per line)

### 4. Purchase Orders
- Same table pattern: Order #, Vendor, Date, Items, Total, Status (Draft/Confirmed/Partially Received/Fully Received)
- Mock vendor names: "Sharma Timber Co.", "BuildRight Hardware", "National Screws Ltd."
- Detail view with a stepper, line items, and a "Receive Goods" action where you input quantity received per line item — show the On-Hand stock number visually ticking up as a small animation/highlight when you simulate receiving

### 5. Manufacturing Orders
- Kanban-style board with 4 columns: Draft, In Progress, Quality Check, Completed
- Each MO card shows: MO number, Finished Product name + quantity (e.g., "MO-218 — Wooden Dining Table x10"), assignee avatar, a small progress bar showing how many of the 3 work orders (Assembly/Painting/Packing) are done
- Clicking a card opens a detail view showing:
  - Components required (pulled from BoM) with quantity needed vs quantity reserved, shown as a simple table
  - Work Orders list: Assembly (60 min), Painting (30 min), Packing (20 min) — each with a status toggle (Pending/In Progress/Done) and a work center tag (Assembly Line / Paint Floor / Packaging Unit)
  - A "Complete Manufacturing Order" button that's disabled until all work orders are marked done

### 6. Bill of Materials (BoM)
- List of BoMs, one per finished product, shown as expandable cards
- Example BoM card: "Wooden Dining Table" expanded showing:
  - Components table: Wooden Legs (Qty: 4), Wooden Top (Qty: 1), Screws (Qty: 12)
  - Operations table: Assembly (60 min), Painting (30 min), Packing (20 min)
- "+ Create New BoM" form: select finished product, then dynamically add component rows (product dropdown + qty) and operation rows (name + duration)

### 7. Inventory / Stock
- A clean table: Product, Category, On Hand, Reserved, Free to Use, Reorder Point, Status indicator (green dot if healthy, amber if approaching reorder point, red if below)
- Above the table: a toggle to switch view between "Table View" and "Stock Flow View"
- Stock Flow View: a simple Sankey-style or flow diagram showing how stock moves — Purchase → Raw Materials → Manufacturing (consumed) → Finished Goods → Sales (delivered) — with mock numbers flowing through (e.g., "+200 Legs from PO-301", "-40 Legs consumed by MO-218", "+10 Tables produced")

### 8. Audit Logs
- Simple filterable table: Timestamp, User, Action, Entity, Old Value → New Value (shown as a small diff chip)
- Mock entries: "Riya confirmed Sales Order SO-1042", "Aman received Purchase Order PO-298 (Partial: 80/100 units)", "System auto-created Purchase Order PO-305 (MTO shortage trigger)"
- Filter chips at top: All / Sales / Purchase / Manufacturing / Inventory

### 9. Users & Roles
- Table of users with Name, Email, Role badge, Status (Active/Inactive)
- Roles shown with distinct colored badges: Admin (charcoal), Sales User (blue), Purchase User (amber), Manufacturing User (copper), Inventory Manager (green), Business Owner (slate outline)
- "+ Invite User" button opens a simple form: Name, Email, Role dropdown

### 10. Settings (light/optional)
- Company info form (mock), Procurement defaults (default lead time, default reorder buffer), Notification preferences toggles

---

## MOCK DATA NOTES FOR THE DEMO

- Make all numbers feel internally consistent — if Wooden Table shows "On Hand: 5" on the Products screen, the same number should appear on the Inventory screen and in the Sales Order shortage-warning example
- Include at least one "MTO shortage triggers automatic Purchase/Manufacturing Order" scenario visible somewhere in the demo flow (e.g., on the Sales Order detail or the Audit Log) since this is the centerpiece concept of the whole problem statement — it should be visually obvious and easy to point to during a walkthrough
- Status badges should use consistent colors across every screen (Draft=gray, Confirmed=amber, In Progress/Partial=blue, Completed/Done=green, Cancelled=red) — this consistency matters more than any individual screen's polish

---

## WHAT THIS DEMO IS FOR

This is purely to validate:
1. Does the sidebar navigation feel right for an enterprise tool?
2. Does the color system (charcoal + copper) feel professional without being boring?
3. Does the Manufacturing Kanban board communicate the work-order flow clearly?
4. Does the MTS/MTO shortage-trigger concept come across visually?
5. Is the overall information density appropriate — not too sparse, not overwhelming?

No backend logic, no real validation, no auth flow needed — just click through screens with mock data and good-looking transitions between states.
