import type { ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/dashboard/Dashboard";
import { Categories } from "./pages/categories/Categories";
import { Products } from "./pages/products/Products";
import { Inventory } from "./pages/inventory/Inventory";
import { Sales } from "./pages/sales/Sales";
import { Users } from "./pages/users/Users";
import { Reports } from "./pages/reports/Reports";
import { Settings } from "./pages/settings/Settings";
import { PrivacyPolicy } from "./pages/legal/PrivacyPolicy";
import { TermsOfService } from "./pages/legal/TermsOfService";

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
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsOfService />} />

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
            <Products />
          </AdminLayout>
        }
      />
      <Route
        path="/admin/categories"
        element={
          <AdminLayout>
            <Categories />
          </AdminLayout>
        }
      />
      <Route
        path="/admin/inventory"
        element={
          <AdminLayout>
            <Inventory />
          </AdminLayout>
        }
      />
      <Route
        path="/admin/sales"
        element={
          <AdminLayout>
            <Sales />
          </AdminLayout>
        }
      />
      <Route
        path="/admin/users"
        element={
          <AdminLayout>
            <Users />
          </AdminLayout>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <AdminLayout>
            <Reports />
          </AdminLayout>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <AdminLayout>
            <Settings />
          </AdminLayout>
        }
      />

      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
    </Routes>
  );
}
