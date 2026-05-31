import { useState } from "react";
import { useStore } from "@/store/useStore";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Search, MonitorSmartphone, ShieldAlert, UserCheck, UserX } from "lucide-react";
import { format } from "date-fns";

export function Users() {
    const { users, suspendUser, unsuspendUser, changeUserRole, revokeAllSessions } = useStore();
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("All");

    const [deviceModalOpen, setDeviceModalOpen] = useState(false);

    const filteredUsers = users.filter((u) => {
        const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.phone.includes(searchTerm);
        const matchesRole = roleFilter === "All" || u.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const handleToggleStatus = (id: string, currentStatus: string) => {
        if (confirm(`Are you sure you want to ${currentStatus === "Active" ? "suspend" : "activate"} this user?`)) {
            if (currentStatus === "Active") suspendUser(id);
            else unsuspendUser(id);
        }
    };

    const handleRoleChange = (id: string, newRole: any) => {
        changeUserRole(id, newRole);
    };

    const handleForceLogout = () => {
        if (confirm("Are you sure you want to force logout this user from all devices?")) {
            revokeAllSessions();
        }
    };

    return (
        <div className="space-y-6 pb-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
                <p className="text-muted-foreground">Manage user accounts, roles, and device sessions.</p>
            </div>

            <Card>
                <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4">
                    <div className="flex gap-4">
                        <div className="relative w-64">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search name, email, phone..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <div className="w-32">
                            <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                                <option value="All">All Roles</option>
                                <option value="Admin">Admin</option>
                                <option value="Owner">Owner</option>
                                <option value="User">User</option>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User Details</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Joined</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredUsers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                        No users found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredUsers.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-semibold">{user.name}</span>
                                                <span className="text-sm text-muted-foreground">{user.email}</span>
                                                <span className="text-xs text-muted-foreground">{user.phone}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Select
                                                value={user.role}
                                                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                className="h-8 text-xs w-28"
                                            >
                                                <option value="User">User</option>
                                                <option value="Owner">Owner</option>
                                                <option value="Admin">Admin</option>
                                            </Select>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={user.status === "Active" ? "success" : "destructive"}>
                                                {user.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {format(new Date(user.joinedDate), "MMM dd, yyyy")}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2 text-muted-foreground">
                                                <button
                                                    className="p-2 hover:text-primary transition-colors"
                                                    title="View Login Devices"
                                                    onClick={() => {
                                                        setDeviceModalOpen(true);
                                                    }}
                                                >
                                                    <MonitorSmartphone className="h-4 w-4" />
                                                </button>
                                                <button
                                                    className="p-2 hover:text-destructive transition-colors tooltip"
                                                    title="Force Logout"
                                                    onClick={handleForceLogout}
                                                >
                                                    <ShieldAlert className="h-4 w-4" />
                                                </button>
                                                <button
                                                    className={user.status === "Active" ? "p-2 hover:text-destructive transition-colors" : "p-2 hover:text-success transition-colors"}
                                                    title={user.status === "Active" ? "Suspend Use" : "Activate User"}
                                                    onClick={() => handleToggleStatus(user.id, user.status)}
                                                >
                                                    {user.status === "Active" ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                                                </button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Modal
                isOpen={deviceModalOpen}
                onClose={() => setDeviceModalOpen(false)}
                title="Active Login Devices"
                description="List of devices currently logged in for this user."
            >
                <div className="space-y-4 pt-2">
                    {/* Mock devices list */}
                    {[1, 2].map((i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-lg border bg-muted/50">
                            <div className="flex items-center gap-3">
                                <MonitorSmartphone className="h-8 w-8 text-muted-foreground" />
                                <div className="flex flex-col">
                                    <span className="font-semibold text-sm">{i === 1 ? "MacBook Pro - Chrome" : "iPhone 13 - Safari"}</span>
                                    <span className="text-xs text-muted-foreground">
                                        Last active: {i === 1 ? "Just now" : "2 hours ago"} • IP: {i === 1 ? "192.168.1.10" : "172.20.10.4"}
                                    </span>
                                </div>
                            </div>
                            <Button variant="destructive" size="sm" onClick={() => alert("Session revoked")}>Revoke</Button>
                        </div>
                    ))}
                    <div className="pt-4 flex justify-end">
                        <Button variant="outline" onClick={() => setDeviceModalOpen(false)}>Close</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
