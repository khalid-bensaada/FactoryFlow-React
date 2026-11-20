import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute";
import { useAuth } from "./context/AuthContext";

import Install from "./pages/Install";
import Login from "./pages/Login";

import AdminLayout from "./components/layout/AdminLayout";
import OperatorLayout from "./components/layout/OperatorLayout";

const AccessDenied = () => <h1>ACCESS DENIED PAGE</h1>;
const NotFound = () => <h1>404 - NOT FOUND</h1>;

const AdminDashboard = () => (
  <h1 className="text-2xl font-bold">ADMIN DASHBOARD</h1>
);
const AdminMaterials = () => (
  <h1 className="text-2xl font-bold">ADMIN MATERIALS</h1>
);
const AdminProducts = () => (
  <h1 className="text-2xl font-bold">ADMIN PRODUCTS</h1>
);
const AdminOrders = () => <h1 className="text-2xl font-bold">ADMIN ORDERS</h1>;
const AdminOrderDetails = () => (
  <h1 className="text-2xl font-bold">ADMIN ORDER DETAILS</h1>
);

const OperatorDashboard = () => (
  <h1 className="text-2xl font-bold">OPERATOR DASHBOARD</h1>
);

const RootRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) return <div>LOADING...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "admin") return <Navigate to="/admin" replace />;
  if (user.role === "operator") return <Navigate to="/operator" replace />;

  return <Navigate to="/login" replace />;
};

const App = () => {
  return (
    <Routes>
      <Route path="/install" element={<Install />} />
      <Route path="/login" element={<Login />} />
      <Route path="/access-denied" element={<AccessDenied />} />

      <Route path="/" element={<RootRedirect />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="materials" element={<AdminMaterials />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="orders/:id" element={<AdminOrderDetails />} />
      </Route>

      <Route
        path="/operator"
        element={
          <ProtectedRoute allowedRoles={["operator"]}>
            <OperatorLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<OperatorDashboard />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
