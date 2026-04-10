import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import AdminLogin from "./pages/AdminLogin.tsx";
import Admin from "./pages/Admin.tsx";
import AdminDashboard from "./pages/admin/AdminDashboard.tsx";
import AdminContent from "./pages/admin/AdminContent.tsx";
import AdminProjects from "./pages/admin/AdminProjects.tsx";
import AdminSkills from "./pages/admin/AdminSkills.tsx";
import AdminSocial from "./pages/admin/AdminSocial.tsx";
import AdminSubmissions from "./pages/admin/AdminSubmissions.tsx";
import AdminPhotos from "./pages/admin/AdminPhotos.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<Admin />}>
              <Route index element={<AdminDashboard />} />
              <Route path="content" element={<AdminContent />} />
              <Route path="projects" element={<AdminProjects />} />
              <Route path="skills" element={<AdminSkills />} />
              <Route path="social" element={<AdminSocial />} />
              <Route path="submissions" element={<AdminSubmissions />} />
              <Route path="photos" element={<AdminPhotos />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
