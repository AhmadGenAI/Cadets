import { lazy, Suspense } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/lib/auth";
import { ErrorBoundary } from "@/components/error-boundary";
import { PwaInstallPrompt } from "@/components/pwa-install";
import Home from "@/pages/home";
import NotFound from "@/pages/not-found";

const Login = lazy(() => import("@/pages/login"));
const Register = lazy(() => import("@/pages/register"));
const Pricing = lazy(() => import("@/pages/pricing"));
const Blog = lazy(() => import("@/pages/blog"));
const BlogPostPage = lazy(() => import("@/pages/blog-post"));
const StaticPage = lazy(() => import("@/pages/static-page"));
const ProvincesDetail = lazy(() => import("@/pages/provinces-detail"));
const Portal = lazy(() => import("@/pages/portal"));
const PortalPrep = lazy(() => import("@/pages/portal-prep"));
const PortalQuizzes = lazy(() => import("@/pages/portal-quizzes"));
const PortalInterview = lazy(() => import("@/pages/portal-interview"));
const PortalMedical = lazy(() => import("@/pages/portal-medical"));
const PortalProfile = lazy(() => import("@/pages/portal-profile"));
const PortalPdf = lazy(() => import("@/pages/portal-pdf"));
const AdminLogin = lazy(() => import("@/pages/admin-login"));
const Admin = lazy(() => import("@/pages/admin"));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
  </div>
);

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/pricing" component={Pricing} />
        <Route path="/blog" component={Blog} />
        <Route path="/blog/:slug" component={BlogPostPage} />
        <Route path="/page/:slug" component={StaticPage} />
        <Route path="/provinces/:id" component={ProvincesDetail} />
        <Route path="/portal" component={Portal} />
        <Route path="/portal/prep" component={PortalPrep} />
        <Route path="/portal/quizzes" component={PortalQuizzes} />
        <Route path="/portal/interview" component={PortalInterview} />
        <Route path="/portal/medical" component={PortalMedical} />
        <Route path="/portal/profile" component={PortalProfile} />
        <Route path="/portal/pdf" component={PortalPdf} />
        <Route path="/admin-login" component={AdminLogin} />
        <Route path="/admin" component={Admin} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <PwaInstallPrompt />
              <Router />
            </TooltipProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
