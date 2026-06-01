import { useEffect, useMemo, useState } from "react";
import { useStore } from "@/store/useStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { generateRevenueData, generateBookingVolume } from "@/mock/data";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Users, MapIcon, RefreshCw, BarChart3 } from "lucide-react";
import { Select } from "@/components/ui/select";
import { motion } from "framer-motion";

export function Dashboard() {
    const { users, turfs, settlements } = useStore();
    const [dateRange, setDateRange] = useState("30");
    const [analytics, setAnalytics] = useState<{
        revenueData: Array<{ name: string; revenue: number }>;
        bookingData: Array<{ name: string; bookings: number }>;
        summary: {
            activeUsers: number;
            approvedTurfs: number;
            pendingSettlements: number;
            refundRatio: string;
        };
    }>({
        revenueData: generateRevenueData(),
        bookingData: generateBookingVolume(),
        summary: {
            activeUsers: 0,
            approvedTurfs: 0,
            pendingSettlements: 0,
            refundRatio: "0.0%",
        },
    });

    useEffect(() => {
        const loadAnalytics = async () => {
            try {
                const res = await fetch(`http://localhost:5000/api/admin/dashboard-metrics?range=${dateRange}`);
                if (!res.ok) {
                    return;
                }

                const data = await res.json();
                setAnalytics({
                    revenueData: Array.isArray(data.revenueData) ? data.revenueData : generateRevenueData(),
                    bookingData: Array.isArray(data.bookingData) ? data.bookingData : generateBookingVolume(),
                    summary: {
                        activeUsers: Number(data?.summary?.activeUsers || 0),
                        approvedTurfs: Number(data?.summary?.approvedTurfs || 0),
                        pendingSettlements: Number(data?.summary?.pendingSettlements || 0),
                        refundRatio: String(data?.summary?.refundRatio || "0.0%"),
                    },
                });
            } catch {
                setAnalytics({
                    revenueData: generateRevenueData(),
                    bookingData: generateBookingVolume(),
                    summary: {
                        activeUsers: 0,
                        approvedTurfs: 0,
                        pendingSettlements: 0,
                        refundRatio: "0.0%",
                    },
                });
            }
        };

        loadAnalytics();
    }, [dateRange]);

    const revenueData = useMemo(() => analytics.revenueData, [analytics.revenueData]);
    const bookingData = useMemo(() => analytics.bookingData, [analytics.bookingData]);

    const activeUsersCount = analytics.summary.activeUsers || users.filter(u => u.status === "Active").length;
    const pendingSettlements = analytics.summary.pendingSettlements || settlements.filter(s => s.status === "Pending").length;
    const approvedTurfs = analytics.summary.approvedTurfs || turfs.filter(t => t.status === "approved").length;

    const kpis = [
        { title: "Active Users", value: activeUsersCount, icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
        { title: "Approved Turfs", value: approvedTurfs, icon: MapIcon, color: "text-green-500", bg: "bg-green-50" },
        { title: "Pending Settlements", value: pendingSettlements, icon: RefreshCw, color: "text-amber-500", bg: "bg-amber-50" },
        { title: "Refund Ratio", value: analytics.summary.refundRatio, icon: BarChart3, color: "text-purple-500", bg: "bg-purple-50" },
    ];

    return (
        <div className="space-y-6 pb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
                    <p className="text-muted-foreground">Monitor platform metrics, user activity, and financials.</p>
                </div>
                <div className="w-full sm:w-48">
                    <Select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
                        <option value="7">Last 7 Days</option>
                        <option value="30">Last 30 Days</option>
                        <option value="90">Last 90 Days</option>
                    </Select>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {kpis.map((kpi, idx) => (
                    <motion.div
                        key={kpi.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                    >
                        <Card className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">{kpi.title}</p>
                                    <p className="text-3xl font-bold mt-1 max-w-[150px] truncate" title={String(kpi.value)}>{kpi.value}</p>
                                </div>
                                <div className={`p-4 rounded-full ${kpi.bg}`}>
                                    <kpi.icon className={`h-6 w-6 ${kpi.color}`} />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Revenue Trend (Last 6 Months)</CardTitle>
                            <CardDescription>Monthly platform revenue</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={revenueData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#71717a", fontSize: 12 }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: "#71717a", fontSize: 12 }} dx={-10} tickFormatter={(value) => `$${value}`} />
                                        <Tooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 20px -2px rgba(0,0,0,0.1)" }} />
                                        <Line type="monotone" dataKey="revenue" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Booking Volume</CardTitle>
                            <CardDescription>Number of turfs booked</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={bookingData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#71717a", fontSize: 12 }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: "#71717a", fontSize: 12 }} dx={-10} />
                                        <Tooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 20px -2px rgba(0,0,0,0.1)" }} />
                                        <Area type="monotone" dataKey="bookings" stroke="#22c55e" fill="#22c55e" fillOpacity={0.2} strokeWidth={3} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
