// App.tsx
import { lazy, Suspense } from "react";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { AgentShell } from "./components/layout/AgentShell";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { PageHeaderProvider } from "./context/PageHeaderContext";
import { useAuth } from "./hooks/useAuth";
import { Login } from "./pages/Login";
import { ForgotPassword } from "./pages/ForgotPassword";
import { Bars } from "./components/ui/Bars";
import { NotFound } from "./pages/NotFound";



const Dashboard = lazy(() =>
  import("./pages/dashboard/Dashboard").then((m) => ({ default: m.Dashboard }))
);
const Categories = lazy(() =>
  import("./pages/categories/Categories").then((m) => ({ default: m.Categories }))
);
const Products = lazy(() =>
  import("./pages/products/Products").then((m) => ({ default: m.Products }))
);
const Inventory = lazy(() =>
  import("./pages/inventory/Inventory").then((m) => ({ default: m.Inventory }))
);
const Sales = lazy(() =>
  import("./pages/sales/Sales").then((m) => ({ default: m.Sales }))
);
const Users = lazy(() =>
  import("./pages/users/Users").then((m) => ({ default: m.Users }))
);
const Reports = lazy(() =>
  import("./pages/reports/Reports").then((m) => ({ default: m.Reports }))
);
const Settings = lazy(() =>
  import("./pages/settings/Settings").then((m) => ({ default: m.Settings }))
);
const RecordSale = lazy(() =>
  import("./pages/agent/RecordSale").then((m) => ({ default: m.RecordSale }))
);
const PrivacyPolicy = lazy(() =>
  import("./pages/legal/PrivacyPolicy").then((m) => ({ default: m.PrivacyPolicy }))
);
const TermsOfService = lazy(() =>
  import("./pages/legal/TermsOfService").then((m) => ({ default: m.TermsOfService }))
);



function FullPageLoader() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <Bars bars={4} className="h-8 text-orange" />
    </div>
  );
}

/** Path-less layout route: gates admin pages and provides the shell,
 *  without owning a URL segment of its own. */
function AdminLayout() {
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

/** Sends a signed-in user to the home screen for their role. */
function HomeRedirect() {
  const { status, profile } = useAuth();

  if (status === "loading") {
    return <FullPageLoader />;
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
    <PageHeaderProvider>
      <Suspense fallback={<FullPageLoader />}>
        <Routes>
          <Route path="*" element={<NotFound />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />

          <Route path="/" element={<HomeRedirect />} />
          <Route path="/admin" element={<HomeRedirect />} />

          <Route element={<AgentLayout />}>
            <Route path="/agent" element={<RecordSale />} />
          </Route>

          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/admin/products" element={<Products />} />
            <Route path="/admin/categories" element={<Categories />} />
            <Route path="/admin/inventory" element={<Inventory />} />
            <Route path="/admin/sales" element={<Sales />} />
            <Route path="/admin/users" element={<Users />} />
            <Route path="/admin/reports" element={<Reports />} />
            <Route path="/admin/settings" element={<Settings />} />
          </Route>

          <Route path="*" element={<HomeRedirect />} />
        </Routes>
      </Suspense>
    </PageHeaderProvider>
  );
}