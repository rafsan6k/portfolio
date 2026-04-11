import { useEffect, useState } from "react";
import { useNavigate, Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { LayoutDashboard, FolderOpen, Wrench, FileText, Share2, LogOut, Inbox, Camera, User } from "lucide-react";

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

  useEffect(() => {
    if (!loading) {
      if (!user || !isAdmin) {
        // Give a brief delay for auth context to catch up after login
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

  if (loading || checking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user || !isAdmin) return null;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card flex flex-col shrink-0">
        <div className="p-6 border-b border-border">
          <Link to="/" className="text-xl font-heading font-bold text-gradient">Rafsan.</Link>
          <p className="text-xs text-muted-foreground mt-1">Admin Panel</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
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
      <main className="flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default Admin;
