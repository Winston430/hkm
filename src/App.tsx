// App.tsx
import { lazy, Suspense } from "react";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { AgentShell } from "./components/layout/AgentShell";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { RequirePermission } from "./components/auth/RequirePermission";
import { PageHeaderProvider } from "./context/PageHeaderContext";
import { Bars } from "./components/ui/Bars";
import { useAuth } from "./hooks/useAuth";
import { getRoleHomePath } from "./store/AuthContext";
import { Login } from "./pages/Login";
import { ForgotPassword } from "./pages/ForgotPassword";
import { PrivacyPolicy } from "./pages/legal/PrivacyPolicy";
import { TermsOfService } from "./pages/legal/TermsOfService";
import { NotFound } from "./pages/NotFound";

const Dashboard = lazy(() => import("./pages/dashboard/Dashboard").then((m) => ({ default: m.Dashboard })));
const Categories = lazy(() => import("./pages/categories/Categories").then((m) => ({ default: m.Categories })));
const Products = lazy(() => import("./pages/products/Products").then((m) => ({ default: m.Products })));
const Inventory = lazy(() => import("./pages/inventory/Inventory").then((m) => ({ default: m.Inventory })));
const Sales = lazy(() => import("./pages/sales/Sales").then((m) => ({ default: m.Sales })));
const Users = lazy(() => import("./pages/users/Users").then((m) => ({ default: m.Users })));
const Reports = lazy(() => import("./pages/reports/Reports").then((m) => ({ default: m.Reports })));
const Settings = lazy(() => import("./pages/settings/Settings").then((m) => ({ default: m.Settings })));
const Expenses = lazy(() => import("./pages/expenses/Expenses").then((m) => ({ default: m.Expenses })));
const RecordSale = lazy(() => import("./pages/agent/RecordSale").then((m) => ({ default: m.RecordSale })));

function FullPageLoader() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <Bars bars={4} className="h-8 text-orange" />
    </div>
  );
}

/** Broadened to admin+agent — page-level view access is decided per-route
 *  by RequirePermission, not by role alone. Dashboard has no
 *  RequirePermission wrapper: any signed-in staff member sees it. */
function StaffLayout() {
  return (
    <ProtectedRoute roles={["admin", "agent"]}>
      <AppShell>
        <Outlet />
      </AppShell>
    </ProtectedRoute>
  );
}

/** Strictly admin — Users and Settings are never permission-extendable.
 *  Granting a non-admin control over accounts or permissions would be a
 *  privilege-escalation path, not a feature. */
function AdminOnlyLayout() {
  return (
    <ProtectedRoute roles={["admin"]}>
      <AppShell>
        <Outlet />
      </AppShell>
    </ProtectedRoute>
  );
}

function AgentLayout() {
  return (
    <ProtectedRoute roles={["admin", "agent"]}>
      <AgentShell>
        <Outlet />
      </AgentShell>
    </ProtectedRoute>
  );
}

function HomeRedirect() {
  const { status, profile, isResolvingProfile } = useAuth();

  if (status === "loading" || isResolvingProfile) {
    return <FullPageLoader />;
  }
  if (status === "unauthenticated") {
    return <Navigate to="/login" replace />;
  }
  return <Navigate to={getRoleHomePath(profile)} replace />;
}

export default function App() {
  return (
    <PageHeaderProvider>
      <Suspense fallback={<FullPageLoader />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />

          <Route path="/" element={<HomeRedirect />} />
          <Route path="/admin" element={<HomeRedirect />} />

          <Route element={<AgentLayout />}>
            <Route path="/agent" element={<RecordSale />} />
            <Route
              path="/agent/products"
              element={<RequirePermission anyOf={["products.view"]}><Products /></RequirePermission>}
            />
            <Route
              path="/agent/categories"
              element={<RequirePermission anyOf={["categories.view"]}><Categories /></RequirePermission>}
            />
            <Route
              path="/agent/inventory"
              element={<RequirePermission anyOf={["inventory.view"]}><Inventory /></RequirePermission>}
            />
            <Route
              path="/agent/sales"
              element={<RequirePermission anyOf={["sales.view"]}><Sales /></RequirePermission>}
            />
            <Route
              path="/agent/reports"
              element={<RequirePermission anyOf={["reports.view"]}><Reports /></RequirePermission>}
            />
            <Route
              path="/agent/expenses"
              element={<RequirePermission anyOf={["expenses.view"]}><Expenses /></RequirePermission>}
            />
          </Route>

          <Route element={<StaffLayout />}>
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route
              path="/admin/products"
              element={<RequirePermission anyOf={["products.view"]}><Products /></RequirePermission>}
            />
            <Route
              path="/admin/categories"
              element={<RequirePermission anyOf={["categories.view"]}><Categories /></RequirePermission>}
            />
            <Route
              path="/admin/inventory"
              element={<RequirePermission anyOf={["inventory.view"]}><Inventory /></RequirePermission>}
            />
            <Route
              path="/admin/sales"
              element={<RequirePermission anyOf={["sales.view"]}><Sales /></RequirePermission>}
            />
            <Route
              path="/admin/reports"
              element={<RequirePermission anyOf={["reports.view"]}><Reports /></RequirePermission>}
            />
            <Route
              path="/admin/expenses"
              element={<RequirePermission anyOf={["expenses.view"]}><Expenses /></RequirePermission>}
            />
          </Route>

          <Route element={<AdminOnlyLayout />}>
            <Route path="/admin/users" element={<Users />} />
            <Route path="/admin/settings" element={<Settings />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </PageHeaderProvider>
  );
}