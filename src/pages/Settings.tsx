import { useEffect, useState } from "react";
import { useStore } from "@/store/useStore";
import { Mail, Phone, FileText, Shield, Settings as SettingsIcon, Trash2, MapPin } from "lucide-react";
import { motion } from "framer-motion";

export function Settings() {
    const { user } = useStore();
    const [turfs, setTurfs] = useState<any[]>([]);
    const [loadingTurfs, setLoadingTurfs] = useState(false);
    const [deletingTurfId, setDeletingTurfId] = useState<string | null>(null);
    const [turfError, setTurfError] = useState<string>("");

    useEffect(() => {
        const fetchApprovedTurfs = async () => {
            try {
                setLoadingTurfs(true);
                setTurfError("");
                const res = await fetch("http://localhost:5000/api/turfs?status=APPROVED");
                if (!res.ok) {
                    throw new Error("Failed to load approved turfs");
                }

                const data = await res.json();
                setTurfs(Array.isArray(data) ? data : []);
            } catch (error: any) {
                setTurfError(error?.message || "Failed to load approved turfs");
            } finally {
                setLoadingTurfs(false);
            }
        };

        fetchApprovedTurfs();
    }, []);

    const handleDeleteTurf = async (id: string) => {
        const confirmDelete = window.confirm(
            "Remove this turf from the platform? This will delete its bookings and reviews too."
        );

        if (!confirmDelete) return;

        try {
            setDeletingTurfId(id);
            setTurfError("");

            const token = localStorage.getItem("admin_token");
            const headers: Record<string, string> = {};
            if (token) {
                headers.Authorization = `Bearer ${token}`;
            }

            const res = await fetch(`http://localhost:5000/api/turfs/${id}`, {
                method: "DELETE",
                headers,
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || "Failed to delete turf");
            }

            setTurfs((prev) => prev.filter((turf) => turf.id !== id));
        } catch (error: any) {
            setTurfError(error?.message || "Failed to delete turf");
        } finally {
            setDeletingTurfId(null);
        }
    };

    if (!user) return null;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <SettingsIcon className="h-5 w-5 text-primary" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Admin Settings</h1>
                    <p className="text-muted-foreground">Manage your profile and review system policies.</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Profile Card */}
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border bg-card text-card-foreground shadow-sm"
                >
                    <div className="flex flex-col space-y-1.5 p-6 border-b">
                        <h3 className="font-semibold leading-none tracking-tight">Admin Profile</h3>
                        <p className="text-sm text-muted-foreground">Your account details.</p>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center text-2xl font-bold text-primary-foreground shadow-sm">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h4 className="text-lg font-semibold">{user.name}</h4>
                                <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-primary/10 text-primary">
                                    Super Admin
                                </span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                <Mail className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email Address</p>
                                    <p className="text-sm font-medium">{user.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                <Phone className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Mobile Number</p>
                                    <p className="text-sm font-medium">{user.phone || "Not provided"}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Policies Card */}
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="rounded-xl border bg-card text-card-foreground shadow-sm"
                >
                    <div className="flex flex-col space-y-1.5 p-6 border-b">
                        <h3 className="font-semibold leading-none tracking-tight">System Policies</h3>
                        <p className="text-sm text-muted-foreground">Governance and administrative rules.</p>
                    </div>
                    <div className="p-6 space-y-4">
                        <details className="group rounded-lg border bg-muted/30 [&_summary::-webkit-details-marker]:hidden cursor-pointer">
                            <summary className="flex items-center justify-between p-4 font-medium">
                                <div className="flex items-center gap-3">
                                    <Shield className="h-5 w-5 text-primary" />
                                    Admin Code of Conduct
                                </div>
                            </summary>
                            <div className="px-4 pb-4 text-sm text-muted-foreground border-t pt-3 bg-card">
                                As a Super Admin, you hold full privileges over the Kicko platform. You must ensure that all turf approvals meet quality guidelines and that user data is handled securely. Unauthorized data modification is strictly prohibited and logged.
                            </div>
                        </details>
                        
                        <details className="group rounded-lg border bg-muted/30 [&_summary::-webkit-details-marker]:hidden cursor-pointer">
                            <summary className="flex items-center justify-between p-4 font-medium">
                                <div className="flex items-center gap-3">
                                    <FileText className="h-5 w-5 text-primary" />
                                    Data Retention Policy
                                </div>
                            </summary>
                            <div className="px-4 pb-4 text-sm text-muted-foreground border-t pt-3 bg-card">
                                Booking records must be retained for a minimum of 2 years for financial auditing purposes. Cancelled bookings and refunded transactions must be explicitly marked and never hard-deleted from the database.
                            </div>
                        </details>
                    </div>
                </motion.div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-xl border bg-card text-card-foreground shadow-sm"
            >
                <div className="flex flex-col space-y-1.5 p-6 border-b">
                    <h3 className="font-semibold leading-none tracking-tight">Remove Approved Turfs</h3>
                    <p className="text-sm text-muted-foreground">These are the turfs currently shown to users on the customer app.</p>
                </div>

                <div className="p-6 space-y-4">
                    {turfError && (
                        <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                            {turfError}
                        </div>
                    )}

                    {loadingTurfs ? (
                        <div className="text-sm text-muted-foreground">Loading approved turfs...</div>
                    ) : turfs.length === 0 ? (
                        <div className="text-sm text-muted-foreground">No approved turfs available to remove.</div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {turfs.map((turf) => (
                                <div key={turf.id} className="rounded-xl border bg-muted/20 p-4 space-y-3">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <h4 className="font-semibold leading-tight">{turf.name}</h4>
                                            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                                                <MapPin className="h-4 w-4" />
                                                <span>{turf.location}</span>
                                            </div>
                                        </div>
                                        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-700">
                                            Approved
                                        </span>
                                    </div>

                                    <div className="text-sm text-muted-foreground">
                                        Turf ID: <span className="font-medium text-foreground break-all">{turf.id}</span>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => void handleDeleteTurf(turf.id)}
                                        disabled={deletingTurfId === turf.id}
                                        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-destructive px-4 py-2.5 text-sm font-semibold text-destructive-foreground transition-colors hover:opacity-90 disabled:opacity-60"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        {deletingTurfId === turf.id ? "Removing..." : "Remove Turf"}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
