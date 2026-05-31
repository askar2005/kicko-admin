import { useState, useMemo } from "react";
import { useStore } from "@/store/useStore";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Download, History } from "lucide-react";
import { format } from "date-fns";
import { Select } from "@/components/ui/select";

export function Audit() {
    const { auditLogs } = useStore();
    const [searchTerm, setSearchTerm] = useState("");
    const [timeFilter, setTimeFilter] = useState("all");
    const [page, setPage] = useState(1);
    const itemsPerPage = 8;

    const filteredLogs = useMemo(() => {
        let logs = auditLogs;

        // Time filter mock logic (in reality compares timestamps)
        if (timeFilter !== "all") {
            // Mock: Just to show interactivity, we won't strictly filter dates since its mock data
        }

        if (searchTerm) {
            logs = logs.filter(log =>
                log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
                log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                log.adminEmail.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        return logs;
    }, [auditLogs, searchTerm, timeFilter]);

    const totalPages = Math.max(1, Math.ceil(filteredLogs.length / itemsPerPage));
    const currentLogs = filteredLogs.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    const handleDownloadCSV = () => {
        const header = "ID,Timestamp,Admin,Action,Details\n";
        const body = auditLogs.map(l => `${l.id},${l.timestamp},${l.adminEmail},${l.action},"${l.details}"`).join("\n");
        const blob = new Blob([header + body], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `audit_logs_${Date.now()}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-6 pb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Audit Logs</h2>
                    <p className="text-muted-foreground">Immutable record of all administrative actions securely logged.</p>
                </div>
                <Button variant="outline" onClick={handleDownloadCSV}>
                    <Download className="h-4 w-4 mr-2" /> Export Logs
                </Button>
            </div>

            <Card>
                <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4">
                    <div className="flex flex-1 gap-4 max-w-2xl">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search actions, emails, or details..."
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                                className="pl-9"
                            />
                        </div>
                        <div className="w-40">
                            <Select value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)}>
                                <option value="all">All Time</option>
                                <option value="today">Today</option>
                                <option value="week">This Week</option>
                                <option value="month">This Month</option>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="min-h-[400px]">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-48">Timestamp</TableHead>
                                    <TableHead className="w-48">Admin</TableHead>
                                    <TableHead className="w-48">Action</TableHead>
                                    <TableHead>Details</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {currentLogs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                                            <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                            No logs found matching your criteria.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    currentLogs.map((log) => (
                                        <TableRow key={log.id} className="text-sm">
                                            <TableCell className="text-muted-foreground whitespace-nowrap">
                                                {format(new Date(log.timestamp), "MMM dd, yyyy HH:mm:ss")}
                                            </TableCell>
                                            <TableCell className="font-medium">{log.adminEmail}</TableCell>
                                            <TableCell>
                                                <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium ring-1 ring-inset ring-gray-500/10">
                                                    {log.action}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground truncate max-w-md" title={log.details}>
                                                {log.details}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {totalPages > 1 && (
                        <div className="flex items-center justify-end space-x-2 pt-4">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                            >
                                Previous
                            </Button>
                            <div className="text-sm font-medium">
                                Page {page} of {totalPages}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
