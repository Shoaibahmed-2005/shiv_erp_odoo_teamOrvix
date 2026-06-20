import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/common/ProtectedRoute";
import Layout from "./components/common/Layout";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import PendingApproval from "./pages/Auth/PendingApproval";
import Dashboard from "./pages/Dashboard/Dashboard";
import Products from "./pages/Products/Products";
import SalesOrders from "./pages/Sales/SalesOrders";
import PurchaseOrders from "./pages/Purchase/PurchaseOrders";
import ManufacturingBoard from "./pages/Manufacturing/ManufacturingBoard";
import BillOfMaterials from "./pages/BoM/BillOfMaterials";
import Inventory from "./pages/Inventory/Inventory";
import AuditLogs from "./pages/AuditLogs/AuditLogs";
import UsersRoles from "./pages/Admin/UsersRoles";

export default function App() {
  return <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/pending" element={<PendingApproval />} />
    <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
      <Route index element={<Dashboard />} />
      <Route path="products" element={<Products />} />
      <Route path="sales" element={<SalesOrders />} />
      <Route path="purchase" element={<PurchaseOrders />} />
      <Route path="manufacturing" element={<ManufacturingBoard />} />
      <Route path="boms" element={<BillOfMaterials />} />
      <Route path="inventory" element={<Inventory />} />
      <Route path="audit" element={<AuditLogs />} />
      <Route path="admin" element={<UsersRoles />} />
    </Route>
  </Routes>;
}
