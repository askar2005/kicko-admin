import { useState } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useStore } from "@/store/useStore";
import {
    LayoutDashboard, Users, MapPin, DollarSign,
    ShieldCheck, Shield, Search, LogOut, ChevronRight, Settings as SettingsIcon, Menu, X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ToastSystem } from "@/components/ui/toast";
import { motion } from "framer-motion";

export function AppLayout() {
    const { user, logout } = useStore();
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

    const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
        <aside className={cn(
            "w-64 border-r bg-card flex flex-col pt-4 shadow-sm z-20",
            mobile ? "h-full" : "hidden lg:flex"
        )}>
            <div className="px-6 pb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tighter text-primary">Kicko Admin</h1>
                {mobile && (
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="lg:hidden min-h-[44px] min-w-[44px] rounded-lg hover:bg-muted flex items-center justify-center"
                        aria-label="Close menu"
                    >
                        <X className="h-5 w-5" />
                    </button>
                )}
            </div>
            <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                {navItems.map(({ to, label, icon: Icon }) => (
                    <NavLink
                        key={to}
                        to={to}
                        onClick={() => setIsSidebarOpen(false)}
                        className={({ isActive }) =>
                            cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2.5 min-h-[44px] text-sm font-medium transition-all",
                                isActive
                                    ? "bg-primary text-primary-foreground shadow-sm"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )
                        }
                    >
                        <Icon className="h-5 w-5 shrink-0" />
                        <span>{label}</span>
                    </NavLink>
                ))}
            </nav>
            <div className="p-4 border-t">
                <div className="flex items-center gap-3 mb-4 px-2 min-w-0">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex shrink-0 items-center justify-center text-primary font-bold">
                        {user?.name?.charAt(0) || "A"}
                    </div>
                    <div className="flex flex-col text-sm min-w-0">
                        <span className="font-semibold truncate">{user?.name}</span>
                        <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 min-h-[44px] text-sm font-medium text-destructive transition-colors hover:bg-red-50"
                >
                    <LogOut className="h-5 w-5" />
                    Logout
                </button>
            </div>
        </aside>
    );

    return (
        <div className="flex h-screen w-full bg-zinc-50 overflow-hidden text-foreground">
            <Sidebar />

            {isSidebarOpen && (
                <div className="fixed inset-0 z-40 lg:hidden">
                    <button
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={() => setIsSidebarOpen(false)}
                        aria-label="Close navigation menu"
                    />
                    <div className="relative h-full w-64 max-w-[85vw] bg-card shadow-xl">
                        <Sidebar mobile />
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="flex flex-col flex-1 overflow-hidden relative min-w-0">
                {/* Top Navbar */}
                <header className="min-h-16 border-b bg-card flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 sm:px-6 py-3 shadow-sm z-10">
                    <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="lg:hidden min-h-[44px] min-w-[44px] rounded-lg hover:bg-muted flex items-center justify-center"
                            aria-label="Open navigation menu"
                        >
                            <Menu className="h-5 w-5" />
                        </button>
                        {/* Breadcrumbs */}
                        <div className="flex items-center text-sm text-muted-foreground capitalize min-w-0 overflow-x-auto whitespace-nowrap">
                            {breadcrumbs.map((crumb, idx) => (
                                <div key={crumb} className="flex items-center shrink-0">
                                    {idx > 0 && <ChevronRight className="h-4 w-4 mx-2 opacity-50" />}
                                    <span className={idx === breadcrumbs.length - 1 ? "font-semibold text-foreground tracking-tight" : ""}>
                                        {crumb}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Search (Mock) */}
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Global Search..."
                            className="h-11 sm:h-9 w-full rounded-full border border-input bg-muted pl-9 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary shadow-inner transition-all"
                        />
                    </div>
                </header>

                {/* Page Container */}
                <main className="flex-1 overflow-auto p-4 sm:p-6 relative">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="h-full max-w-7xl mx-auto min-w-0"
                    >
                        <Outlet />
                    </motion.div>
                </main>
            </div>

            <ToastSystem />
        </div>
    );
}
