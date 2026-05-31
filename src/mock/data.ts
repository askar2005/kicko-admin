export type UserRole = "User" | "Owner" | "Admin";

export interface User {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: UserRole;
    status: "Active" | "Suspended";
    joinedDate: string;
}

export interface Turf {
    id: string;
    name: string;
    ownerId: string;
    ownerName: string;
    city: string;
    status: "pending" | "approved" | "rejected";
    submittedDate: string;
    images: string[];
}

export interface Booking {
    id: string;
    turfId: string;
    turfName: string;
    userId: string;
    userName: string;
    date: string;
    amount: number;
    status: "Confirmed" | "Cancelled" | "Completed";
}

export interface Settlement {
    id: string;
    ownerId: string;
    ownerName: string;
    amount: number;
    status: "Pending" | "Processing" | "Settled";
    updatedDate: string;
}

export interface DeviceSession {
    id: string;
    deviceName: string;
    lastActive: string;
    location: string;
    ip: string;
}

export interface AuditLog {
    id: string;
    action: string;
    adminEmail: string;
    timestamp: string;
    details: string;
}

export const mockUsers: User[] = [];

export const mockTurfs: Turf[] = [];

export const mockSettlements: Settlement[] = [];

export const mockAuditLogs: AuditLog[] = [
    { id: "a1", action: "System Initialization", adminEmail: "system", timestamp: new Date().toISOString(), details: "Production environment initialized." },
];

export const mockSessions: DeviceSession[] = [];

export const generateRevenueData = () => {
    return [
        { name: 'Oct', revenue: 0 },
        { name: 'Nov', revenue: 0 },
        { name: 'Dec', revenue: 0 },
        { name: 'Jan', revenue: 0 },
        { name: 'Feb', revenue: 0 },
        { name: 'Mar', revenue: 0 },
    ];
};

export const generateBookingVolume = () => {
    return [
        { name: 'Oct', bookings: 0 },
        { name: 'Nov', bookings: 0 },
        { name: 'Dec', bookings: 0 },
        { name: 'Jan', bookings: 0 },
        { name: 'Feb', bookings: 0 },
        { name: 'Mar', bookings: 0 },
    ];
};
