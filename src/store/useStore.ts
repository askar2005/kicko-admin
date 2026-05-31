import { create } from 'zustand';
import type {
    User, Turf, Settlement, DeviceSession, AuditLog
} from '@/mock/data';
import {
    mockUsers, mockTurfs, mockSettlements, mockSessions, mockAuditLogs
} from '@/mock/data';

const checkSession = () => {
    const token = localStorage.getItem("admin_token");
    const expiry = localStorage.getItem("admin_session_expiry");
    if (token && expiry && Date.now() < parseInt(expiry)) {
        return true;
    }
    return false;
};

interface AppState {
    // Auth
    user: User | null;
    isAuthenticated: boolean;
    is2faVerified: boolean;
    sessionExpiry: number; // in minutes
    sessions: DeviceSession[];

    login: (email: string) => void;
    verify2fa: (token?: string) => void;
    logout: () => void;
    setSessionExpiry: (minutes: number) => void;
    revokeSession: (id: string) => void;
    revokeAllSessions: () => void;

    // Users
    users: User[];
    suspendUser: (id: string) => void;
    unsuspendUser: (id: string) => void;
    changeUserRole: (id: string, role: User['role']) => void;

    // Turfs
    turfs: Turf[];
    approveTurf: (id: string) => void;
    rejectTurf: (id: string, reason: string) => void;

    // Finance
    settlements: Settlement[];
    triggerRefund: (amount: number, reason: string) => void;

    // Audit Logs
    auditLogs: AuditLog[];
    addAuditLog: (action: string, details: string) => void;

    // Global UI
    toastMessage: string | null;
    showToast: (msg: string) => void;
    hideToast: () => void;
}

export const useStore = create<AppState>((set, get) => ({
    user: checkSession() ? { id: "admin-default", name: "Super Admin", email: localStorage.getItem("admin_email") || "admin@kicko.com", role: "Admin", status: "Active", joinedDate: new Date().toISOString() } as User : null,
    isAuthenticated: checkSession(),
    is2faVerified: checkSession(),
    sessionExpiry: 15,
    sessions: mockSessions,

    users: mockUsers,
    turfs: mockTurfs,
    settlements: mockSettlements,
    auditLogs: mockAuditLogs,

    toastMessage: null,

    login: (email) => {
        let user = get().users.find(u => u.email === email);
        if (!user) {
            user = { id: "u-demo", name: email.split("@")[0], email, role: "Admin", status: "Active", joinedDate: new Date().toISOString() } as User;
        }
        set({ user, isAuthenticated: true, is2faVerified: false });
        localStorage.setItem("admin_email", email);
        get().addAuditLog("Login Attempt", `Login initiated by ${email}`);
    },

    verify2fa: (token?: string) => {
        set({ is2faVerified: true });
        localStorage.setItem("admin_token", token || `demo-token-${Date.now()}`);
        localStorage.setItem("admin_session_expiry", String(Date.now() + get().sessionExpiry * 60 * 1000));
        get().addAuditLog("2FA Verified", `User ${get().user?.email} completed 2FA.`);
        get().showToast("Login successful!");
    },

    logout: () => {
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_session_expiry");
        localStorage.removeItem("admin_email");
        get().addAuditLog("Logout", `User ${get().user?.email} logged out.`);
        set({ user: null, isAuthenticated: false, is2faVerified: false });
    },

    setSessionExpiry: (minutes) => {
        set({ sessionExpiry: minutes });
        get().addAuditLog("Settings Changed", `Session expiry set to ${minutes} mins.`);
        get().showToast(`Session expiry updated to ${minutes}m`);
    },

    revokeSession: (id) => {
        set(state => ({ sessions: state.sessions.filter(s => s.id !== id) }));
        get().addAuditLog("Session Revoked", `Revoked session ${id}`);
        get().showToast("Session revoked.");
    },

    revokeAllSessions: () => {
        set({ sessions: [] });
        get().addAuditLog("Force Logout All", `All devices logged out by ${get().user?.email}`);
        get().showToast("All devices forcefully logged out.");
    },

    suspendUser: (id) => {
        set(state => ({
            users: state.users.map(u => u.id === id ? { ...u, status: 'Suspended' } : u)
        }));
        get().addAuditLog("User Suspended", `Suspended user ID ${id}`);
        get().showToast("User suspended.");
    },

    unsuspendUser: (id) => {
        set(state => ({
            users: state.users.map(u => u.id === id ? { ...u, status: 'Active' } : u)
        }));
        get().addAuditLog("User Unsuspended", `Unsuspended user ID ${id}`);
        get().showToast("User activated.");
    },

    changeUserRole: (id, role) => {
        set(state => ({
            users: state.users.map(u => u.id === id ? { ...u, role } : u)
        }));
        get().addAuditLog("Role Changed", `Changed user ID ${id} role to ${role}`);
        get().showToast("User role updated.");
    },

    approveTurf: (id) => {
        set(state => ({
            turfs: state.turfs.map(t => t.id === id ? { ...t, status: 'approved' } : t)
        }));
        get().addAuditLog("Turf Approved", `Approved turf ID ${id}`);
        get().showToast("Turf approved. Notification sent to owner.");
    },

    rejectTurf: (id, reason) => {
        set(state => ({
            turfs: state.turfs.map(t => t.id === id ? { ...t, status: 'rejected' } : t)
        }));
        get().addAuditLog("Turf Rejected", `Rejected turf ID ${id}. Reason: ${reason}`);
        get().showToast("Turf rejected. Notification sent to owner.");
    },

    triggerRefund: (amount, reason) => {
        get().addAuditLog("Manual Refund", `Refund of $${amount} triggered. Reason: ${reason}`);
        get().showToast(`$${amount} refund processed successfully.`);
    },

    addAuditLog: (action, details) => {
        const adminEmail = get().user?.email || "system";
        const newLog: AuditLog = {
            id: `a${Date.now()}`,
            action,
            adminEmail,
            timestamp: new Date().toISOString(),
            details
        };
        set(state => ({ auditLogs: [newLog, ...state.auditLogs] }));
    },

    showToast: (msg) => {
        set({ toastMessage: msg });
        setTimeout(() => {
            if (get().toastMessage === msg) {
                set({ toastMessage: null });
            }
        }, 3000);
    },

    hideToast: () => set({ toastMessage: null })
}));
