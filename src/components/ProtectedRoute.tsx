import { Navigate, Outlet } from "react-router-dom";
import { useStore } from "@/store/useStore";

export function ProtectedRoute() {
    const { isAuthenticated, is2faVerified } = useStore();

    const hasToken = localStorage.getItem("admin_token");
    const expiryStr = localStorage.getItem("admin_session_expiry");
    const isExpired = expiryStr ? Date.now() > parseInt(expiryStr) : false;

    if (isExpired) {
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_session_expiry");
        return <Navigate to="/login" replace />;
    }

    if (!isAuthenticated && !hasToken) {
        return <Navigate to="/login" replace />;
    }

    if (!is2faVerified && !hasToken) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}
