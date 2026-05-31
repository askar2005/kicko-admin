# Kicko Admin Console

This is a complete, production-ready frontend demonstration of the Kicko Admin Console. Built with React (Vite), TypeScript, Tailwind CSS, Zustand, Recharts, and Framer Motion. 

The application utilizes local state management and mock data to simulate real backend interactions for a high-fidelity demo experience.

## Features

- **Authentication Flow:** Secure login with mock credentials and a 2FA OTP simulation.
- **Dashboard:** Interactive charts (Recharts) for Revenue and Bookings, along with KPI cards.
- **User Management:** Searchable and filterable user list with role assignment and device tracking.
- **Turf Approvals:** Multi-tab interface for approving or rejecting turf submissions with reason inputs.
- **Financial Controls:** Settlement tracking, manual refund simulation, and real CSV exports.
- **Audit Logging:** Immutable client-side tracking of every major admin action.
- **Security:** Toggles for 2FA, session expiry time settings, and force-logout features.

## Tech Stack

- **Framework:** React 18 + Vite
- **TypeScript:** Strict type checking
- **Styling:** Tailwind CSS + Radix UI-inspired components
- **State Management:** Zustand
- **Routing:** React Router v6
- **Charts:** Recharts
- **Animations:** Framer Motion
- **Icons:** Lucide React

## Setup & Run

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

### Installation
1. Navigate to the project folder (`kicko-new-admin`).
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open your browser at `http://localhost:5173`.

### Build for Production
To generate a production build:
```bash
npm run build
```
The output will reside in the `dist/` folder.

## Demo Credentials

When logging into the application, use the following credentials:
- **Email:** `admin@kicko.com`
- **Password:** `Admin@123`
- **2FA OTP:** `123456`

## Folder Structure

```
src/
├── components/          // Reusable UI components (Button, Card, Modal, Table, etc.)
│   ├── ProtectedRoute.tsx
│   └── ui/
├── layouts/             // Layout wrappers (Sidebar, Navbar)
│   └── AppLayout.tsx
├── mock/                // Mock data simulating backend database
│   └── data.ts
├── pages/               // Main page views
│   ├── Login.tsx
│   ├── Dashboard.tsx
│   ├── Users.tsx
│   ├── Turfs.tsx
│   ├── Finance.tsx
│   ├── Audit.tsx
│   └── Security.tsx
├── store/               // Zustand global state store
│   └── useStore.ts
├── lib/                 // Utility functions
│   └── utils.ts
├── App.tsx              // Router configuration
├── main.tsx             // React entry point
└── index.css            // Global CSS and Tailwind directives
```
