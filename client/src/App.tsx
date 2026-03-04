import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/lib/auth";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Pricing from "@/pages/pricing";
import Blog from "@/pages/blog";
import BlogPostPage from "@/pages/blog-post";
import StaticPage from "@/pages/static-page";
import ProvincesDetail from "@/pages/provinces-detail";
import Portal from "@/pages/portal";
import PortalPrep from "@/pages/portal-prep";
import PortalQuizzes from "@/pages/portal-quizzes";
import PortalInterview from "@/pages/portal-interview";
import PortalMedical from "@/pages/portal-medical";
import PortalProfile from "@/pages/portal-profile";
import PortalPdf from "@/pages/portal-pdf";
import Admin from "@/pages/admin";

function Router() {
  return (
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
      <Route path="/admin" component={Admin} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
