import { useStore } from "@/store/useStore";
import { Mail, Phone, FileText, Shield, Settings as SettingsIcon } from "lucide-react";
import { motion } from "framer-motion";

export function Settings() {
    const { user } = useStore();

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
        </div>
    );
}
