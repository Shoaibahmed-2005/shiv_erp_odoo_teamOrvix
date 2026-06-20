import express from "express";
import rateLimit from "express-rate-limit";
import { body } from "express-validator";
import { register, login, me } from "../controllers/authController.js";
import * as erp from "../controllers/erpController.js";
import { requireAuth } from "../middleware/auth.js";
import { checkPermission } from "../middleware/checkPermission.js";

const router = express.Router();
const authLimit = rateLimit({ windowMs: 15 * 60 * 1000, limit: 100 });

router.post("/auth/register", authLimit, body("email").isEmail(), register);
router.post("/auth/login", authLimit, login);
router.get("/auth/me", requireAuth, me);

router.use(requireAuth);
router.get("/users", checkPermission("Users"), erp.getUsers);
router.patch("/users/:id/assign-role", checkPermission("Users", "edit"), erp.assignRole);
router.patch("/users/:id/toggle-active", checkPermission("Users", "edit"), erp.toggleActive);
router.get("/permissions", checkPermission("Users"), erp.getPermissions);
router.patch("/permissions/:id", checkPermission("Users", "edit"), erp.updatePermission);

router.get("/products", checkPermission("Products"), erp.list("products"));
router.post("/products", checkPermission("Products", "create"), erp.createProduct);
router.put("/products/:id", checkPermission("Products", "edit"), erp.updateProduct);
router.delete("/products/:id", checkPermission("Products", "delete"), erp.removeProduct);
router.get("/products/:id/stock-history", checkPermission("Products"), erp.stockHistory);

router.get("/customers", checkPermission("Sales"), erp.list("customers"));
router.post("/customers", checkPermission("Sales", "create"), erp.createSimple("customers", ["name", "email", "phone", "address"]));
router.put("/customers/:id", checkPermission("Sales", "edit"), erp.updateSimple("customers", ["name", "email", "phone", "address"]));
router.delete("/customers/:id", checkPermission("Sales", "delete"), erp.deleteSimple("customers"));

router.get("/vendors", checkPermission("Purchase"), erp.list("vendors"));
router.post("/vendors", checkPermission("Purchase", "create"), erp.createSimple("vendors", ["name", "email", "phone", "address"]));
router.put("/vendors/:id", checkPermission("Purchase", "edit"), erp.updateSimple("vendors", ["name", "email", "phone", "address"]));
router.delete("/vendors/:id", checkPermission("Purchase", "delete"), erp.deleteSimple("vendors"));

router.get("/work-centers", checkPermission("Manufacturing"), erp.list("workCenters"));
router.post("/work-centers", checkPermission("Manufacturing", "create"), erp.createSimple("work_centers", ["name"]));
router.put("/work-centers/:id", checkPermission("Manufacturing", "edit"), erp.updateSimple("work_centers", ["name"]));
router.delete("/work-centers/:id", checkPermission("Manufacturing", "delete"), erp.deleteSimple("work_centers"));

router.get("/boms", checkPermission("BoM"), erp.list("boms"));
router.post("/boms", checkPermission("BoM", "create"), erp.createBom);
router.delete("/boms/:id", checkPermission("BoM", "delete"), erp.deleteSimple("boms"));

router.get("/sales-orders", checkPermission("Sales"), erp.list("salesOrders"));
router.post("/sales-orders", checkPermission("Sales", "create"), erp.createSalesOrder);
router.get("/sales-orders/:id", checkPermission("Sales"), erp.salesOrderDetail);
router.post("/sales-orders/:id/confirm", checkPermission("Sales", "edit"), erp.confirmSalesOrder);
router.post("/sales-orders/:id/deliver", checkPermission("Sales", "edit"), erp.deliverSalesOrder);

router.get("/purchase-orders", checkPermission("Purchase"), erp.list("purchaseOrders"));
router.post("/purchase-orders", checkPermission("Purchase", "create"), erp.createPurchaseOrder);
router.post("/purchase-orders/:id/confirm", checkPermission("Purchase", "edit"), erp.confirmPurchaseOrder);
router.post("/purchase-orders/:id/receive", checkPermission("Purchase", "edit"), erp.receivePurchaseOrder);

router.get("/manufacturing-orders", checkPermission("Manufacturing"), erp.list("manufacturingOrders"));
router.patch("/manufacturing-orders/:id/work-orders/:woId", checkPermission("Manufacturing", "edit"), erp.updateWorkOrder);
router.post("/manufacturing-orders/:id/complete", checkPermission("Manufacturing", "edit"), erp.completeManufacturingOrder);

router.get("/inventory", checkPermission("Inventory"), erp.inventory);
router.post("/inventory/reorder/:id", checkPermission("Inventory", "edit"), erp.quickReorder);
router.get("/inventory/stock-flow", checkPermission("Inventory"), erp.stockFlow);
router.get("/notifications", erp.notifications);
router.patch("/notifications/:id/read", erp.readNotification);
router.patch("/notifications/read-all", erp.readAllNotifications);
router.post("/payments/create-order", checkPermission("Sales", "edit"), erp.createPaymentOrder);
router.post("/payments/verify", checkPermission("Sales", "edit"), erp.verifyPayment);
router.post("/payments/cancel", checkPermission("Sales", "edit"), erp.cancelPayment);
router.post("/payments/simulate", checkPermission("Sales", "edit"), erp.simulatePayment);
router.get("/audit-logs", checkPermission("Audit Logs"), erp.list("auditLogs"));
router.get("/dashboard", erp.dashboard);

export default router;
