# DonorConnect — Frontend

> A React-based web application for a Blood Bank Management and Appointment System.
> Built on top of the DonorConnect Spring Boot microservices backend.

---

## Table of Contents

- [About the Project](#about-the-project)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Configuration](#environment-configuration)
- [Backend Services Reference](#backend-services-reference)
- [User Roles & Access](#user-roles--access)
- [Available Pages](#available-pages)

---

## About the Project

DonorConnect is a full-stack blood bank management system. This repository contains the **frontend** only.

The application has three distinct zones:

| Zone | Who sees it | Description |

| Public Website | Everyone | Blood donation info, government policies, awareness content. No login needed. |
| Staff Dashboard | Logged-in staff | Role-based dashboards for Reception, Lab Technician, Inventory Controller, Transfusion Officer, Phlebotomist. |
| Super Admin Dashboard | ROLE_ADMIN only | Full access to all services, user management, audit logs, system config, reports, billing. |

---

## Tech Stack

| Tool | Purpose |

| React 18 (Vite) | UI framework |
| React Router v6 | Client-side routing |
| Bootstrap 5 + React Bootstrap | Styling and components |
| Axios | HTTP client |
| jwt-decode | Decoding JWT tokens |
| react-toastify | Toast notifications |

---

## Project Structure

```
src/
├── assets/                        # Images, logos, icons
├── components/
│   └── shared/                    
│       ├── layout/
│       │   ├── PublicLayout.jsx
│       │   ├── DashboardLayout.jsx
│       │   ├── Sidebar.jsx
│       │   └── TopBar.jsx
│       ├── guards/
│       │   ├── ProtectedRoute.jsx
│       │   └── RoleGuard.jsx
│       └── ui/
│           ├── StatCard.jsx
│           ├── DataTable.jsx
│           ├── StatusBadge.jsx
│           ├── PageHeader.jsx
│           ├── LoadingSpinner.jsx
│           ├── EmptyState.jsx
│           ├── ConfirmModal.jsx
│           └── AlertBanner.jsx
│
├── api/
│   ├── axiosInstance.js           # Base Axios — JWT auto-attached
│   └── authUtils.js               # Token helpers: getRole(), getCurrentUser(), logout()
│
├── pages/
│   ├── public/                    # Public website
│   ├── auth/                      # Login, Forgot Password, Reset Password
│   ├── admin/                     # Super Admin Dashboard
│   ├── donor-service/             # Reception & Phlebotomist pages
│   ├── blood-supply/              # Lab Technician pages
│   ├── inventory/                 # Inventory Controller pages
│   ├── transfusion/               # Transfusion Officer pages
│   ├── safety/                    # Safety & Lookback pages
│   ├── billing/                   # Billing pages
│   └── donor-portal/              # Donor self-service pages
│
├── routes/
│   └── AppRouter.jsx              # All routes — OWNED BY TEAM LEAD
│
└── context/
    └── AuthContext.jsx            # Global auth state — OWNED BY TEAM LEAD
```

---

## Getting Started

### Prerequisites

- Node.js v18 or higher
- npm v9 or higher
- The DonorConnect backend must be running (see backend repo)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd donorconnect-frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will run at **http://localhost:5173** by default.

### Build for Production

```bash
npm run build
```

---

## Environment Configuration

Create a `.env` file in the project root:

```env
VITE_API_BASE_URL=http://localhost:8080
```

The `axiosInstance.js` reads this value as the base URL for all API calls. All requests go through the **API Gateway at port 8080** — never call individual microservice ports directly from the frontend.

> If you change the API Gateway port in the backend, update this `.env` value.

---

## Backend Services Reference

All API calls are routed through the API Gateway. The frontend **only** talks to `http://localhost:8080`.

| Service | Port (direct) | Gateway Path |
|---|---|---|
| API Gateway | **8080** | — (all frontend calls go here) |
| Eureka Server | 8761 | — (internal only) |
| Auth Service | 8001 | `/api/auth/**`, `/api/v1/users/**` |
| Donor Service | 8002 | `/api/donors/**`, `/api/appointments/**`, `/api/drives/**`, `/api/deferrals/**`, `/api/screenings/**` |
| Blood Supply Service | 8003 | `/api/donations/**`, `/api/components/**`, `/api/test-results/**`, `/api/recalls/**`, `/api/quarantine/**` |
| Transfusion Service | 8004 | `/api/transfusion/**` |
| Safety Service | 8005 | `/api/safety/reactions/**`, `/api/safety/lookback/**` |
| Billing Service | 8006 | `/api/billing/**` |
| Reporting Service | 8007 | `/api/reports/**` |
| Notification Service | 8008 | `/api/notifications/**` |
| Config Service | 8009 | `/api/config/**` |
Start each Spring Boot service individually via your IDE (IntelliJ recommended). Make sure MySQL and Kafka are running locally before starting the services.

---

## User Roles & Access

After login, the JWT token contains the user's role. The frontend reads this role and renders the appropriate sidebar and routes.

| Role | Dashboard Access |
|---|---|
| `ROLE_ADMIN` | Everything — all services, user management, audit logs, config, reports, billing |
| `ROLE_RECEPTION` | Donor registry, appointments, blood drives, deferrals, screening |
| `ROLE_PHLEBOTOMIST` | Pre-donation screening only |
| `ROLE_LAB_TECHNICIAN` | Donations, blood components, test results, quarantine & recall |
| `ROLE_INVENTORY_CONTROLLER` | Stock overview, stock transactions, expiry watch |
| `ROLE_TRANSFUSION_OFFICER` | Crossmatch requests, issue blood, issued records, adverse reactions |
| `ROLE_DONOR` | Personal dashboard, profile, donation history, notifications |

### Login & Redirect Behaviour

After a successful login:
- `ROLE_DONOR` → `/dashboard/my`
- `ROLE_ADMIN` → `/dashboard/admin`
- All other staff roles → `/dashboard/donors` (or their first available route)

---

## Available Pages

### Public (no login required)

| Route | Page |
|---|---|
| `/` | Home — hero, features, stats |
| `/about` | About the project |
| `/policies` | Government acts & NACO guidelines |
| `/awareness` | Blood donation awareness content |
| `/contact` | Contact information |

### Auth

| Route | Page |
|---|---|
| `/login` | Login |
| `/forgot-password` | Request password reset |
| `/reset-password` | Reset password with token |

### Staff Dashboard (login required)

| Route | Role | Page |
|---|---|---|
| `/dashboard/admin` | Admin | Overview & KPIs |
| `/dashboard/users` | Admin | User management |
| `/dashboard/audit-logs` | Admin | Audit log viewer |
| `/dashboard/config` | Admin | System configuration |
| `/dashboard/reports` | Admin | Reports centre |
| `/dashboard/billing` | Admin | Billing records |
| `/dashboard/donors` | Admin, Reception | Donor registry |
| `/dashboard/donors/register` | Admin, Reception | Register / edit donor |
| `/dashboard/appointments` | Admin, Reception | Appointments |
| `/dashboard/drives` | Admin, Reception | Blood drives |
| `/dashboard/deferrals` | Admin, Reception | Deferrals |
| `/dashboard/screenings` | Admin, Reception, Phlebotomist | Pre-donation screening |
| `/dashboard/donations` | Admin, Lab Tech | Donations log |
| `/dashboard/components` | Admin, Lab Tech | Blood components |
| `/dashboard/test-results` | Admin, Lab Tech | Test results |
| `/dashboard/quarantine` | Admin, Lab Tech | Quarantine & recall |
| `/dashboard/inventory` | Admin, Inventory Ctrl | Stock overview |
| `/dashboard/stock-transactions` | Admin, Inventory Ctrl | Stock transactions |
| `/dashboard/expiry-watch` | Admin, Inventory Ctrl | Expiry watch |
| `/dashboard/crossmatch` | Admin, Transfusion Officer | Crossmatch requests |
| `/dashboard/issue` | Admin, Transfusion Officer | Issue blood |
| `/dashboard/issue-records` | Admin, Transfusion Officer | Issued records |
| `/dashboard/reactions` | Admin, Transfusion Officer | Adverse reactions |
| `/dashboard/lookback` | Admin | Lookback traceability |
| `/dashboard/my` | Donor | Personal dashboard |
| `/dashboard/my/profile` | Donor | My profile |
| `/dashboard/my/history` | Donor | My donation history |
| `/dashboard/my/notifications` | Donor | My notifications |

## Notes

- The backend uses **Kafka** for inter-service events. Some actions on the frontend (like a test result failing) trigger background Kafka events — these are handled entirely by the backend. The frontend only needs to make the initial API call.
- The **Billing Service** creates records automatically via Kafka when blood is issued — the billing page is read-only.
- **Reports** are auto-generated by the reporting scheduler — the reports page is read-only.
- If the backend is not running, the app will still load the public website. Protected routes will redirect to `/login`.