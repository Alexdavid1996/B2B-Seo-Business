import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TimezoneProvider } from "@/components/ui/live-clock";
import { useAuth } from "./hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { ADMIN_BASE_PATH, EMPLOYEE_BASE_PATH } from "@/lib/constants";
import AuthPage from "./pages/auth";
import Dashboard from "./pages/dashboard";
import AdminDashboard from "./pages/admin";
import AdminLoginPage from "./pages/admin-login";
import EmployeeDashboard from "./pages/employee";
import Homepage from "./pages/homepage";
import AboutPage from "./pages/about";
import FAQPage from "./pages/faq";
import ContactPage from "./pages/contact";
import BlogPage from "./pages/blog";
import BlogPostPage from "./pages/blog-post";
import TermsPage from "./pages/terms";
import PrivacyPage from "./pages/privacy";
import MaintenancePage from "./pages/maintenance";
import ForgotPasswordPage from "./pages/forgot-password";
import ResetPasswordPage from "./pages/reset-password";
import EmailVerificationLinkPage from "./pages/email-verification-link";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Check maintenance mode settings
  const { data: settings } = useQuery<{
    maintenanceMode: string;
    maintenanceMessage: string;
    platformFee: string;
    platformFeeType: string;
  }>({
    queryKey: ["/api/settings/public"],
  });

  const isMaintenanceMode = settings?.maintenanceMode === "true";

  console.log(
    "Router render - isAuthenticated:",
    isAuthenticated,
    "isLoading:",
    isLoading,
    "user:",
    user,
  );

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      {/* Admin routes - base path configurable via VITE_ADMIN_BASE_PATH */}
      <Route
        path={`${ADMIN_BASE_PATH}/:section?`}
        component={
          isAuthenticated && user?.role === "admin"
            ? AdminDashboard
            : AdminLoginPage
        }
      />
      <Route
        path={ADMIN_BASE_PATH}
        component={
          isAuthenticated && user?.role === "admin"
            ? AdminDashboard
            : AdminLoginPage
        }
      />

      {/* Employee routes - always accessible regardless of maintenance mode */}
      <Route
        path={`${EMPLOYEE_BASE_PATH}/:section?`}
        component={
          isAuthenticated && user?.role === "employee"
            ? EmployeeDashboard
            : AuthPage
        }
      />
      <Route
        path={EMPLOYEE_BASE_PATH}
        component={
          isAuthenticated && user?.role === "employee"
            ? EmployeeDashboard
            : AuthPage
        }
      />

      {/* Show maintenance page to non-admin users for all other routes */}
      <Route
        path="/"
        component={() => {
          if (isMaintenanceMode && (!user || user.role !== "admin")) {
            return <MaintenancePage />;
          }
          if (isAuthenticated) {
            if (user?.role === "admin") return <AdminDashboard />;
            if (user?.role === "employee") return <EmployeeDashboard />;
            return <Dashboard />;
          }
          return <Homepage />;
        }}
      />

      {/* Signup route - smart redirect based on authentication status */}
      <Route
        path="/signup"
        component={() => {
          const searchParams = new URLSearchParams(window.location.search);
          const ref = searchParams.get('ref');
          
          // Store referral code if present
          if (ref) {
            localStorage.setItem('pendingReferralCode', ref);
          }
          
          // If user is already logged in, redirect to dashboard
          if (isAuthenticated && user) {
            window.location.href = '/dashboard';
          } else {
            // If not logged in, redirect to auth page for registration
            const redirectUrl = ref ? `/auth?ref=${ref}` : '/auth';
            window.location.href = redirectUrl;
          }
          return null;
        }}
      />

      {/* Register route - smart redirect based on authentication status */}
      <Route
        path="/register"
        component={() => {
          const searchParams = new URLSearchParams(window.location.search);
          const ref = searchParams.get('ref');
          
          // Store referral code if present
          if (ref) {
            localStorage.setItem('pendingReferralCode', ref);
          }
          
          // If user is already logged in, redirect to dashboard
          if (isAuthenticated && user) {
            window.location.href = '/dashboard';
          } else {
            // If not logged in, redirect to auth page for registration
            const redirectUrl = ref ? `/auth?ref=${ref}` : '/auth';
            window.location.href = redirectUrl;
          }
          return null;
        }}
      />

      {/* Public routes - show maintenance page if not admin */}
      <Route
        path="/auth"
        component={() =>
          isMaintenanceMode && (!user || user.role !== "admin") ? (
            <MaintenancePage />
          ) : (
            <AuthPage />
          )
        }
      />
      <Route
        path="/auth/forgot-password"
        component={() =>
          isMaintenanceMode && (!user || user.role !== "admin") ? (
            <MaintenancePage />
          ) : (
            <ForgotPasswordPage />
          )
        }
      />
      <Route
        path="/auth/reset-password"
        component={() =>
          isMaintenanceMode && (!user || user.role !== "admin") ? (
            <MaintenancePage />
          ) : (
            <ResetPasswordPage />
          )
        }
      />
      <Route
        path="/verify-email"
        component={() =>
          isMaintenanceMode && (!user || user.role !== "admin") ? (
            <MaintenancePage />
          ) : (
            <EmailVerificationLinkPage />
          )
        }
      />
      <Route
        path="/about"
        component={() =>
          isMaintenanceMode && (!user || user.role !== "admin") ? (
            <MaintenancePage />
          ) : (
            <AboutPage />
          )
        }
      />
      <Route
        path="/faq"
        component={() =>
          isMaintenanceMode && (!user || user.role !== "admin") ? (
            <MaintenancePage />
          ) : (
            <FAQPage />
          )
        }
      />
      <Route
        path="/contact"
        component={() =>
          isMaintenanceMode && (!user || user.role !== "admin") ? (
            <MaintenancePage />
          ) : (
            <ContactPage />
          )
        }
      />
      <Route
        path="/blog"
        component={() =>
          isMaintenanceMode && (!user || user.role !== "admin") ? (
            <MaintenancePage />
          ) : (
            <BlogPage />
          )
        }
      />
      <Route
        path="/blog/:slug"
        component={() =>
          isMaintenanceMode && (!user || user.role !== "admin") ? (
            <MaintenancePage />
          ) : (
            <BlogPostPage />
          )
        }
      />
      <Route
        path="/terms"
        component={() =>
          isMaintenanceMode && (!user || user.role !== "admin") ? (
            <MaintenancePage />
          ) : (
            <TermsPage />
          )
        }
      />
      <Route
        path="/privacy"
        component={() =>
          isMaintenanceMode && (!user || user.role !== "admin") ? (
            <MaintenancePage />
          ) : (
            <PrivacyPage />
          )
        }
      />

      {/* Protected user routes - show maintenance page if not admin */}
      <Route
        path="/dashboard/:section?"
        component={() => {
          if (isMaintenanceMode && (!user || user.role !== "admin")) {
            return <MaintenancePage />;
          }
          return isAuthenticated && user?.role === "user" ? (
            <Dashboard />
          ) : (
            <AuthPage />
          );
        }}
      />
      <Route
        path="/sites"
        component={() => {
          if (isMaintenanceMode && (!user || user.role !== "admin")) {
            return <MaintenancePage />;
          }
          return isAuthenticated && user?.role === "user" ? (
            <Dashboard />
          ) : (
            <AuthPage />
          );
        }}
      />
      <Route
        path="/directory"
        component={() => {
          if (isMaintenanceMode && (!user || user.role !== "admin")) {
            return <MaintenancePage />;
          }
          return isAuthenticated && user?.role === "user" ? (
            <Dashboard />
          ) : (
            <AuthPage />
          );
        }}
      />
      <Route
        path="/wallet"
        component={() => {
          if (isMaintenanceMode && (!user || user.role !== "admin")) {
            return <MaintenancePage />;
          }
          return isAuthenticated && user?.role === "user" ? (
            <Dashboard />
          ) : (
            <AuthPage />
          );
        }}
      />
      <Route
        path="/orders"
        component={() => {
          if (isMaintenanceMode && (!user || user.role !== "admin")) {
            return <MaintenancePage />;
          }
          return isAuthenticated && user?.role === "user" ? (
            <Dashboard />
          ) : (
            <AuthPage />
          );
        }}
      />
      <Route
        path="/chat"
        component={() => {
          if (isMaintenanceMode && (!user || user.role !== "admin")) {
            return <MaintenancePage />;
          }
          return isAuthenticated && user?.role === "user" ? (
            <Dashboard />
          ) : (
            <AuthPage />
          );
        }}
      />
      <Route
        path="/profile"
        component={() => {
          if (isMaintenanceMode && (!user || user.role !== "admin")) {
            return <MaintenancePage />;
          }
          return isAuthenticated && user?.role === "user" ? (
            <Dashboard />
          ) : (
            <AuthPage />
          );
        }}
      />
      <Route
        path="/referral"
        component={() => {
          if (isMaintenanceMode && (!user || user.role !== "admin")) {
            return <MaintenancePage />;
          }
          return isAuthenticated && user?.role === "user" ? (
            <Dashboard />
          ) : (
            <AuthPage />
          );
        }}
      />
      <Route
        path="/support"
        component={() => {
          if (isMaintenanceMode && (!user || user.role !== "admin")) {
            return <MaintenancePage />;
          }
          return isAuthenticated && user?.role === "user" ? (
            <Dashboard />
          ) : (
            <AuthPage />
          );
        }}
      />

      {/* Default 404 handling */}
      <Route
        component={() =>
          isMaintenanceMode && (!user || user.role !== "admin") ? (
            <MaintenancePage />
          ) : (
            <Homepage />
          )
        }
      />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TimezoneProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </TimezoneProvider>
    </QueryClientProvider>
  );
}

export default App;
