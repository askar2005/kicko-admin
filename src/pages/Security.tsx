import { useState } from "react";
import { useStore } from "@/store/useStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { ShieldCheck, MonitorSmartphone, KeySquare, LogOut, Clock, AlertTriangle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function Security() {
    const {
        sessionExpiry, setSessionExpiry,
        sessions, revokeSession, revokeAllSessions
    } = useStore();

    const [tfaEnabled, setTfaEnabled] = useState(true);

    const handleExpiryChange = (val: string) => {
        setSessionExpiry(parseInt(val, 10));
    };

    return (
        <div className="space-y-6 pb-8 max-w-4xl">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Security Settings</h2>
                <p className="text-muted-foreground">Manage administrative access, authentication limits, and hardware sessions.</p>
            </div>

            <div className="grid gap-6">
                {/* 2FA Section */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-4">
                        <div className="space-y-1">
                            <CardTitle className="text-xl flex items-center gap-2">
                                <ShieldCheck className="h-5 w-5 text-green-500" /> Two-Factor Authentication
                            </CardTitle>
                            <CardDescription>Multi-factor authentication adds an extra layer of security to your account.</CardDescription>
                        </div>
                        <div className="flex items-center h-full">
                            <Button
                                variant={tfaEnabled ? "outline" : "default"}
                                onClick={() => setTfaEnabled(!tfaEnabled)}
                                className={tfaEnabled ? "text-green-600 border-green-200 bg-green-50" : ""}
                            >
                                {tfaEnabled ? "Enabled" : "Enable 2FA"}
                            </Button>
                        </div>
                    </CardHeader>
                    {tfaEnabled && (
                        <CardContent className="border-t pt-6 bg-muted/10">
                            <div className="flex flex-col md:flex-row gap-8 items-start">
                                <div className="flex-shrink-0 p-4 bg-white rounded-xl border shadow-sm">
                                    <div className="w-32 h-32 bg-zinc-100 flex items-center justify-center rounded">
                                        <KeySquare className="h-10 w-10 text-muted-foreground/50" />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="font-semibold text-sm mb-1">Authenticator App</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Use an app like Google Authenticator or Authy to scan this QR code.
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-sm mb-1">Secret Key</h4>
                                        <div className="flex items-center gap-2">
                                            <code className="bg-muted px-2 py-1 rounded text-sm text-primary font-mono select-all">
                                                JBSWY3DPEHPK3PXP
                                            </code>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    )}
                </Card>

                {/* Session Limits */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl flex items-center gap-2">
                            <Clock className="h-5 w-5 text-primary" /> Session Limits
                        </CardTitle>
                        <CardDescription>Automatically log out inactive administrative accounts.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between max-w-sm">
                            <span className="text-sm font-medium">Idle Timeout Expiry</span>
                            <Select value={String(sessionExpiry)} onChange={(e) => handleExpiryChange(e.target.value)} className="w-32">
                                <option value="10">10 Minutes</option>
                                <option value="15">15 Minutes</option>
                                <option value="30">30 Minutes</option>
                                <option value="60">1 Hour</option>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Device Tracking */}
                <Card className="border-destructive/20 shadow-sm">
                    <CardHeader className="bg-destructive/5 rounded-t-2xl border-b border-destructive/10 pb-4">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <CardTitle className="text-xl flex items-center gap-2 text-destructive">
                                    <MonitorSmartphone className="h-5 w-5" /> Active Sessions
                                </CardTitle>
                                <CardDescription className="text-destructive/80">Track and manage devices logged into your admin account.</CardDescription>
                            </div>
                            <Button variant="destructive" size="sm" onClick={() => {
                                if (confirm("Force logout EVERY device globally? You will be logged out too.")) {
                                    revokeAllSessions();
                                }
                            }}>
                                <AlertTriangle className="h-4 w-4 mr-2" /> Revoke All
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y">
                            {sessions.length === 0 ? (
                                <div className="p-6 text-center text-muted-foreground">No active sessions found.</div>
                            ) : (
                                sessions.map((session) => (
                                    <div key={session.id} className="flex items-center justify-between p-6 hover:bg-muted/50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 bg-background rounded-full border flex items-center justify-center shadow-sm">
                                                <MonitorSmartphone className="h-5 w-5 text-foreground" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-sm">{session.deviceName}</span>
                                                <div className="text-xs text-muted-foreground flex gap-2 mt-0.5">
                                                    <span>{session.ip}</span>
                                                    <span>•</span>
                                                    <span>{session.location}</span>
                                                    <span>•</span>
                                                    <span>Last active {formatDistanceToNow(new Date(session.lastActive), { addSuffix: true })}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <Button variant="outline" size="sm" onClick={() => revokeSession(session.id)} className="text-destructive hover:bg-destructive hover:text-white">
                                            <LogOut className="h-3 w-3 mr-2" /> Revoke
                                        </Button>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}
