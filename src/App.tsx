import type { ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { AgentShell } from "./components/layout/AgentShell";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { useAuth } from "./hooks/useAuth";
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
import { RecordSale } from "./pages/agent/RecordSale";

function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute roles={["admin"]}>
      <AppShell>{children}</AppShell>
    </ProtectedRoute>
  );
}

function AgentLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute roles={["admin", "agent"]}>
      <AgentShell>{children}</AgentShell>
    </ProtectedRoute>
  );
}

/** Sends a signed-in user to the home screen for their role. */
function HomeRedirect() {
  const { status, profile } = useAuth();

  if (status === "loading") {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-black" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return <Navigate to="/login" replace />;
  }

  return (
    <Navigate to={profile?.role === "agent" ? "/agent" : "/admin/dashboard"} replace />
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsOfService />} />

      <Route path="/" element={<HomeRedirect />} />
      <Route path="/admin" element={<HomeRedirect />} />

      <Route
        path="/agent"
        element={
          <AgentLayout>
            <RecordSale />
          </AgentLayout>
        }
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

      <Route path="*" element={<HomeRedirect />} />
    </Routes>
  );
}
