import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/input";
import { Store, MapPin, Check, X, Building2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const getTurfImage = (turf: any) => {
    try {
        if (turf.images) {
            const parsed = typeof turf.images === 'string' ? JSON.parse(turf.images) : turf.images;
            if (Array.isArray(parsed) && parsed.length > 0) {
                const img = parsed[0];
                if (img.startsWith('/uploads')) {
                    return `http://https://aqua-mandrill-716221.hostingersite.com${img}`;
                }
                return img;
            }
        }
    } catch (e) {
        console.error("Failed to parse turf images", e);
    }
    return turf.imageUrl || "https://images.unsplash.com/photo-1529900948633-14664539659a?w=400&auto=format&fit=crop";
};

export function Turfs() {
    const navigate = useNavigate();
    const [turfs, setTurfs] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState("Pending");

    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [selectedTurfId, setSelectedTurfId] = useState<string | null>(null);
    const [rejectReason, setRejectReason] = useState("");
    const [rejectError, setRejectError] = useState("");

    const fetchTurfs = async () => {
        try {
            const res = await fetch("http://localhost:5000/api/turfs");
            if (res.ok) {
                const data = await res.json();
                setTurfs(data);
            }
        } catch (e) {
            console.error("Failed to fetch turfs", e);
        }
    };

    useEffect(() => {
        fetchTurfs();
    }, []);

    const pendingTurfs = turfs.filter(t => t.status === "PENDING");
    const approvedTurfs = turfs.filter(t => t.status === "APPROVED");
    const rejectedTurfs = turfs.filter(t => t.status === "REJECTED");

    const handleApprove = async (id: string) => {
        try {
            const token = localStorage.getItem("admin_token");
            const headers: any = { "Content-Type": "application/json" };
            if (token) {
                headers["Authorization"] = `Bearer ${token}`;
            }
            await fetch(`http://localhost:5000/api/turfs/${id}/status`, {
                method: "PUT",
                headers,
                body: JSON.stringify({ status: "APPROVED" })
            });
            fetchTurfs();
        } catch (e) {
            console.error("Approval failed", e);
        }
    };

    const handleRejectInit = (id: string) => {
        setSelectedTurfId(id);
        setRejectReason("");
        setRejectError("");
        setRejectModalOpen(true);
    };

    const submitReject = async () => {
        if (rejectReason.trim() === "") {
            setRejectError("Rejection reason is required.");
            return;
        }
        if (selectedTurfId) {
            try {
                const token = localStorage.getItem("admin_token");
                const headers: any = { "Content-Type": "application/json" };
                if (token) {
                    headers["Authorization"] = `Bearer ${token}`;
                }
                await fetch(`http://localhost:5000/api/turfs/${selectedTurfId}/status`, {
                    method: "PUT",
                    headers,
                    body: JSON.stringify({ status: "REJECTED" })
                });
                setRejectModalOpen(false);
                fetchTurfs();
            } catch (e) {
                console.error("Rejection failed", e);
            }
        }
    };

    const TurfCard = ({ turf }: { turf: typeof turfs[0] }) => (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
        >
            <Card
                className={`overflow-hidden group ${turf.status === "APPROVED" ? "hover:shadow-md transition-shadow cursor-pointer" : "hover:shadow-md transition-shadow"}`}
                onClick={turf.status === "APPROVED" ? () => navigate(`/app/turfs/${turf.id}`) : undefined}
            >
                <div className="h-40 overflow-hidden relative">
                    <img
                        src={getTurfImage(turf)}
                        alt={turf.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <Badge
                        className="absolute top-3 right-3 shadow-lg"
                        variant={turf.status === "APPROVED" ? "success" : turf.status === "REJECTED" ? "destructive" : "warning"}
                    >
                        {turf.status.charAt(0).toUpperCase() + turf.status.slice(1).toLowerCase()}
                    </Badge>
                    <div className="absolute bottom-3 left-4 text-white">
                        <h3 className="font-bold text-lg">{turf.name}</h3>
                        <div className="flex items-center text-xs opacity-90 mt-1">
                            <MapPin className="h-3 w-3 mr-1" />
                            {turf.location}
                        </div>
                    </div>
                </div>
                <CardContent className="p-4 grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-muted-foreground text-xs flex items-center gap-1 mb-1"><Store className="h-3 w-3" /> Owner</p>
                        <p className="font-medium truncate">{turf.ownerId || "Unknown"}</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground text-xs flex items-center gap-1 mb-1"><Building2 className="h-3 w-3" /> Submitted</p>
                        <p className="font-medium">{format(new Date(turf.createdAt || new Date()), "MMM dd, yyyy")}</p>
                    </div>
                </CardContent>
                {turf.status === "PENDING" && (
                    <CardFooter className="px-4 pb-4 pt-0 gap-3">
                        <Button className="w-full" variant="outline" onClick={(e) => { e.stopPropagation(); handleApprove(turf.id); }}>
                            <Check className="h-4 w-4 mr-2" /> Accept Turf
                        </Button>
                        <Button className="w-full" variant="destructive" onClick={(e) => { e.stopPropagation(); handleRejectInit(turf.id); }}>
                            <X className="h-4 w-4 mr-2" /> Reject Turf
                        </Button>
                    </CardFooter>
                )}
            </Card>
        </motion.div>
    );

    return (
        <div className="space-y-6 pb-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Turf Approvals</h2>
                <p className="text-muted-foreground">Review and manage turf listings.</p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <div className="flex items-center justify-between mb-6">
                    <TabsList>
                        <TabsTrigger value="Pending">Pending ({pendingTurfs.length})</TabsTrigger>
                        <TabsTrigger value="Approved">Approved</TabsTrigger>
                        <TabsTrigger value="Rejected">Rejected</TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="Pending" className="mt-0">
                    {pendingTurfs.length === 0 ? (
                        <div className="text-center py-20 bg-muted/30 rounded-2xl border border-dashed">
                            <Store className="h-10 w-10 text-muted-foreground mx-auto mb-4 opacity-50" />
                            <h3 className="text-lg font-medium">No pending turfs</h3>
                            <p className="text-muted-foreground text-sm">All caught up! There are no turfs waiting for approval.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            <AnimatePresence>
                                {pendingTurfs.map(t => <TurfCard key={t.id} turf={t} />)}
                            </AnimatePresence>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="Approved" className="mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        <AnimatePresence>
                            {approvedTurfs.map(t => <TurfCard key={t.id} turf={t} />)}
                        </AnimatePresence>
                    </div>
                </TabsContent>

                <TabsContent value="Rejected" className="mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        <AnimatePresence>
                            {rejectedTurfs.map(t => <TurfCard key={t.id} turf={t} />)}
                        </AnimatePresence>
                    </div>
                </TabsContent>
            </Tabs>

            <Modal
                isOpen={rejectModalOpen}
                onClose={() => setRejectModalOpen(false)}
                title="Reject Turf"
                description="Please provide a reason for rejecting this turf. This will be sent to the owner."
            >
                <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="reason">Rejection Reason <span className="text-destructive">*</span></Label>
                        <Input
                            id="reason"
                            placeholder="e.g. Incomplete documentation..."
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            autoFocus
                        />
                        {rejectError && <p className="text-xs text-destructive">{rejectError}</p>}
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="outline" onClick={() => setRejectModalOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={submitReject}>Confirm Rejection</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
