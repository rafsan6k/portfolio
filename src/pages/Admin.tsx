import { useEffect, useState } from "react";
import { useNavigate, Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { LayoutDashboard, FolderOpen, Wrench, FileText, Share2, LogOut, Inbox, Camera, User, Menu, X } from "lucide-react";

const navItems = [
  { label: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { label: "Submissions", path: "/admin/submissions", icon: Inbox },
  { label: "Content", path: "/admin/content", icon: FileText },
  { label: "About", path: "/admin/about", icon: User },
  { label: "Projects", path: "/admin/projects", icon: FolderOpen },
  { label: "Skills", path: "/admin/skills", icon: Wrench },
  { label: "Social Links", path: "/admin/social", icon: Share2 },
  { label: "Photo", path: "/admin/photos", icon: Camera },
];

const Admin = () => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user || !isAdmin) {
        const timer = setTimeout(() => {
          if (!user || !isAdmin) {
            navigate("/admin/login");
          }
          setChecking(false);
        }, 500);
        return () => clearTimeout(timer);
      }
      setChecking(false);
    }
  }, [user, isAdmin, loading, navigate]);

  // Close sidebar on navigation (mobile)
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  if (loading || checking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user || !isAdmin) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-border bg-card">
        <Link to="/" className="text-xl font-heading font-bold text-gradient">Rafsan.</Link>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 hover:bg-secondary rounded-lg transition-colors"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 w-64 border-r border-border bg-card flex flex-col shrink-0 z-50 transition-transform duration-300 md:static md:translate-x-0
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="p-6 border-b border-border hidden md:block">
          <Link to="/" className="text-xl font-heading font-bold text-gradient">Rafsan.</Link>
          <p className="text-xs text-muted-foreground mt-1">Admin Panel</p>
        </div>
        <div className="p-6 border-b border-border md:hidden flex justify-between items-center">
          <span className="font-heading font-bold text-gradient">Admin Panel</span>
          <button onClick={() => setIsSidebarOpen(false)} className="p-1 hover:bg-secondary rounded-lg">
            <X size={20} />
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-border">
          <button
            onClick={signOut}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-secondary w-full transition-colors"
          >
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-4 md:p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default Admin;
