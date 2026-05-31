import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useStore } from "@/store/useStore";
import {
    LayoutDashboard, Users, MapPin, DollarSign,
    ShieldCheck, Shield, Search, LogOut, ChevronRight, Settings as SettingsIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ToastSystem } from "@/components/ui/toast";
import { motion } from "framer-motion";

export function AppLayout() {
    const { user, logout } = useStore();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const navItems = [
        { to: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { to: "/app/users", label: "Users", icon: Users },
        { to: "/app/turfs", label: "Turfs", icon: MapPin },
        { to: "/app/finance", label: "Finance", icon: DollarSign },
        { to: "/app/audit", label: "Audit Logs", icon: ShieldCheck },
        { to: "/app/security", label: "Security", icon: Shield },
        { to: "/app/settings", label: "Settings", icon: SettingsIcon },
    ];

    const breadcrumbs = location.pathname.split("/").filter(Boolean);

    return (
        <div className="flex h-screen w-full bg-zinc-50 overflow-hidden text-foreground">
            {/* Sidebar */}
            <aside className="w-64 border-r bg-card flex flex-col pt-4 shadow-sm z-10">
                <div className="px-6 pb-6">
                    <h1 className="text-2xl font-bold tracking-tighter text-primary">Kicko Admin</h1>
                </div>
                <nav className="flex-1 px-4 space-y-1">
                    {navItems.map(({ to, label, icon: Icon }) => (
                        <NavLink
                            key={to}
                            to={to}
                            className={({ isActive }) =>
                                cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                                    isActive
                                        ? "bg-primary text-primary-foreground shadow-sm"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                )
                            }
                        >
                            <Icon className="h-5 w-5" />
                            {label}
                        </NavLink>
                    ))}
                </nav>
                <div className="p-4 border-t">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                            {user?.name?.charAt(0) || "A"}
                        </div>
                        <div className="flex flex-col text-sm">
                            <span className="font-semibold">{user?.name}</span>
                            <span className="text-xs text-muted-foreground">{user?.email}</span>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-red-50"
                    >
                        <LogOut className="h-5 w-5" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex flex-col flex-1 overflow-hidden relative">
                {/* Top Navbar */}
                <header className="h-16 border-b bg-card flex items-center justify-between px-6 shadow-sm z-10">
                    {/* Breadcrumbs */}
                    <div className="flex items-center text-sm text-muted-foreground capitalize">
                        {breadcrumbs.map((crumb, idx) => (
                            <div key={crumb} className="flex items-center">
                                {idx > 0 && <ChevronRight className="h-4 w-4 mx-2 opacity-50" />}
                                <span className={idx === breadcrumbs.length - 1 ? "font-semibold text-foreground tracking-tight" : ""}>
                                    {crumb}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Search (Mock) */}
                    <div className="relative w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Global Search..."
                            className="h-9 w-full rounded-full border border-input bg-muted pl-9 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary shadow-inner transition-all"
                        />
                    </div>
                </header>

                {/* Page Container */}
                <main className="flex-1 overflow-auto p-6 relative">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="h-full max-w-7xl mx-auto"
                    >
                        <Outlet />
                    </motion.div>
                </main>
            </div>

            <ToastSystem />
        </div>
    );
}
