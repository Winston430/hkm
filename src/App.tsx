import type { ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/dashboard/Dashboard";
import { ComingSoon } from "./pages/ComingSoon";

function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <AppShell>{children}</AppShell>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
      <Route
        path="/admin"
        element={<Navigate to="/admin/dashboard" replace />}
      />
      <Route
        path="/admin/dashboard"
        element={
          <AdminLayout>
            <Dashboard />
          </AdminLayout>
        }
      />
      <Route
        path="/admin/products"
        element={
          <AdminLayout>
            <ComingSoon title="Products" />
          </AdminLayout>
        }
      />
      <Route
        path="/admin/categories"
        element={
          <AdminLayout>
            <ComingSoon title="Categories" />
          </AdminLayout>
        }
      />
      <Route
        path="/admin/inventory"
        element={
          <AdminLayout>
            <ComingSoon title="Inventory" />
          </AdminLayout>
        }
      />
      <Route
        path="/admin/sales"
        element={
          <AdminLayout>
            <ComingSoon title="Sales" />
          </AdminLayout>
        }
      />
      <Route
        path="/admin/users"
        element={
          <AdminLayout>
            <ComingSoon title="Users" />
          </AdminLayout>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <AdminLayout>
            <ComingSoon title="Reports" />
          </AdminLayout>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <AdminLayout>
            <ComingSoon title="Settings" />
          </AdminLayout>
        }
      />

      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
    </Routes>
  );
}
