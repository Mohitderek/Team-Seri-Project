import { useAuth } from "@/contexts/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, Upload, Briefcase, FileText, 
  Shield, Users, AlertTriangle, LogOut, Eye
} from "lucide-react";

interface NavItem {
  label: string;
  icon: React.ElementType;
  path: string;
  roles: ("admin" | "recruiter")[];
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard", roles: ["admin", "recruiter"] },
  { label: "Jobs", icon: Briefcase, path: "/jobs", roles: ["admin"] },
  { label: "Upload Resumes", icon: Upload, path: "/upload", roles: ["admin"] },
  { label: "Candidates", icon: Users, path: "/candidates", roles: ["admin", "recruiter"] },
  { label: "Interviews", icon: Eye, path: "/interviews", roles: ["admin", "recruiter"] },
  { label: "Audit Log", icon: FileText, path: "/audit", roles: ["admin"] },
  { label: "Compliance", icon: Shield, path: "/compliance", roles: ["admin"] },
  { label: "Overrides", icon: AlertTriangle, path: "/overrides", roles: ["admin"] },
];

const AppSidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const filteredItems = NAV_ITEMS.filter(item => user && item.roles.includes(user.role));

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-sidebar border-r border-sidebar-border flex flex-col z-50">
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <Eye className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-lg font-bold text-sidebar-accent-foreground tracking-tight">HireBlind</h1>
            <p className="text-xs text-sidebar-foreground">Bias-free screening</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {filteredItems.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground glow-primary"
                  : "text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent/50"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-sidebar-border">
        <div className="px-3 py-2 mb-2">
          <p className="text-sm font-medium text-sidebar-accent-foreground truncate">{user?.name}</p>
          <p className="text-xs text-sidebar-foreground">{user?.role === "admin" ? "Admin" : "Recruiter"}</p>
        </div>
        <button
          onClick={() => { logout(); navigate("/login"); }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
};

export default AppSidebar;
