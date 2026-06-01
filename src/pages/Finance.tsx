import { useEffect, useState } from "react";
import { useStore } from "@/store/useStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/input";
import { format } from "date-fns";
import { Download, RefreshCcw } from "lucide-react";

type PaymentRecord = {
    id: string;
    bookingRef: string;
    userName: string;
    userEmail: string;
    turfName: string;
    date: string;
    timeSlot: string;
    amount: number;
    status: string;
    createdAt: string;
};

export function Finance() {
    const { settlements, triggerRefund } = useStore();
    const [payments, setPayments] = useState<PaymentRecord[]>([]);
    const [loadingPayments, setLoadingPayments] = useState(true);
    const [refundModalOpen, setRefundModalOpen] = useState(false);
    const [refundAmount, setRefundAmount] = useState("");
    const [refundReason, setRefundReason] = useState("");
    const [refundError, setRefundError] = useState("");

    useEffect(() => {
        const loadPayments = async () => {
            setLoadingPayments(true);
            try {
                const res = await fetch("http://localhost:5000/api/bookings/admin/payments");
                if (!res.ok) {
                    throw new Error("Failed to load payment records");
                }

                const data = await res.json();
                setPayments(Array.isArray(data) ? data : []);
            } catch {
                setPayments([]);
            } finally {
                setLoadingPayments(false);
            }
        };

        loadPayments();
    }, []);

    const handleDownloadCSV = (type: string) => {
        let data = "id,name,amount\n";
        if (type === "revenue") {
            const total = payments.reduce((sum, payment) => sum + payment.amount, 0);
            data += `1,MonthlyRevenue,${total}\n`;
        } else if (type === "statements") {
            data += payments.map((payment) => `${payment.id},${payment.turfName},${payment.amount}`).join("\n");
            if (payments.length > 0) {
                data += "\n";
            }
        }

        const blob = new Blob([data], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${type}_export.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleRefundSubmit = () => {
        const amt = parseFloat(refundAmount);
        if (isNaN(amt) || amt <= 0) {
            setRefundError("Please enter a valid amount greater than 0.");
            return;
        }
        if (refundReason.trim() === "") {
            setRefundError("Please enter a reason for the refund.");
            return;
        }

        triggerRefund(amt, refundReason);
        setRefundModalOpen(false);
        setRefundAmount("");
        setRefundReason("");
        setRefundError("");
    };

    return (
        <div className="space-y-6 pb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Financial Controls</h2>
                    <p className="text-muted-foreground">Manage settlements, process refunds, and export reports.</p>
                </div>
                <Button disabled className="opacity-50 cursor-not-allowed text-muted-foreground bg-muted border border-border mt-3">
                    <RefreshCcw className="h-4 w-4 mr-2" /> Manual Refund
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg">Monthly Revenue CSV</CardTitle>
                        <CardDescription>Export platform revenue data</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="outline" className="w-full" onClick={() => handleDownloadCSV("revenue")}>
                            <Download className="h-4 w-4 mr-2" /> Download CSV
                        </Button>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg">Owner Statements</CardTitle>
                        <CardDescription>Export settlement data for owners</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="outline" className="w-full" onClick={() => handleDownloadCSV("statements")}>
                            <Download className="h-4 w-4 mr-2" /> Download CSV
                        </Button>
                    </CardContent>
                </Card>
                <Card className="opacity-70 bg-muted/50">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg flex justify-between items-center">
                            GST Reports <Badge variant="secondary">Coming soon</Badge>
                        </CardTitle>
                        <CardDescription>Automated tax reporting tools</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="outline" className="w-full" disabled title="Coming soon">
                            <Download className="h-4 w-4 mr-2" /> Download CSV
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Settlement Status</CardTitle>
                    <CardDescription>Recent payouts to turf owners</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Owner</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Last Updated</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {settlements.map((s) => (
                                <TableRow key={s.id}>
                                    <TableCell className="font-medium">{s.ownerName}</TableCell>
                                    <TableCell>${s.amount.toFixed(2)}</TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                s.status === "Settled" ? "success" :
                                                    s.status === "Processing" ? "warning" : "secondary"
                                            }
                                        >
                                            {s.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {format(new Date(s.updatedDate), "MMM dd, yyyy h:mm a")}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Payment Details</CardTitle>
                    <CardDescription>Recent booking payments</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Booking</TableHead>
                                <TableHead>User</TableHead>
                                <TableHead>Turf</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loadingPayments ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                                        Loading payment records...
                                    </TableCell>
                                </TableRow>
                            ) : payments.length > 0 ? (
                                payments.map((p) => (
                                    <TableRow key={p.id}>
                                        <TableCell className="font-medium">{p.bookingRef}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span>{p.userName}</span>
                                                <span className="text-xs text-muted-foreground">{p.userEmail}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{p.turfName}</TableCell>
                                        <TableCell>₹{p.amount}</TableCell>
                                        <TableCell>
                                            <Badge variant="success">
                                                {p.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setRefundAmount(p.amount.toString());
                                                    setRefundReason(`Refund for ${p.bookingRef} - ${p.turfName}`);
                                                    setRefundModalOpen(true);
                                                }}
                                            >
                                                Refund
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                                        No payment records found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Modal
                isOpen={refundModalOpen}
                onClose={() => setRefundModalOpen(false)}
                title="Manual Refund"
                description="Process a refund to a user's original payment method."
            >
                <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="amount">Refund Amount ($) <span className="text-destructive">*</span></Label>
                        <Input
                            id="amount"
                            type="number"
                            min="0.01"
                            step="0.01"
                            placeholder="0.00"
                            value={refundAmount}
                            onChange={(e) => setRefundAmount(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="reason">Reason for Refund <span className="text-destructive">*</span></Label>
                        <Input
                            id="reason"
                            placeholder="e.g. Booking cancelled by owner"
                            value={refundReason}
                            onChange={(e) => setRefundReason(e.target.value)}
                        />
                    </div>
                    {refundError && <p className="text-xs text-destructive">{refundError}</p>}
                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="outline" onClick={() => setRefundModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleRefundSubmit}>Process Refund</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
