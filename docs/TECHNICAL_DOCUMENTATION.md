# GlobalDrop ERP — As-Built Technical Documentation

**System Title:** GlobalDrop Enterprise Resource Planning (ERP) System  
**Document Classification:** Technical As-Built Specification & Architecture Manual  
**Version:** 2.0 (Production Release)  
**Document Status:** Complete & Verified  

---

## 1. Project Overview

### 1.1. Project Name & Commercial Objective
**GlobalDrop ERP** is a multi-branch, multi-tenant enterprise management platform engineered specifically for cross-border e-commerce, retail dropshipping, and global distribution operations.

The system serves as the central operational backbone, orchestrating:
- Global staff management and regional branch oversight.
- Timezone-accurate attendance tracking synchronized with the United Kingdom business clock (**UK London Time / GMT & BST**).
- Dynamic warehouse inventory tracking with automated stock decrements upon order placements.
- Financial bookkeeping featuring **Dual-Currency Localization**: Executive oversight in British Pounds (**GBP £**) for Admin and regional transactions in Indian Rupees (**INR ₹**) for Supervisors and Employees.
- Order processing pipelines with line-item delivery fulfillment tracking persisted across client sessions.
- Formal corporate governance via approval centers for operational funds and stock transfers.
- Customer relationship management (CRM) spanning sales leads and verified buyer records.

### 1.2. Implemented Modules & Capabilities
The existing completed codebase contains **16 fully implemented core functional modules**:

1. **Authentication & Session Management:** JWT bearer token lifecycle, salted bcrypt password hashing, account status guards, and offline mock-token resilience.
2. **Executive & Role Dashboards:** Dedicated role-routed dashboards (`AdminDashboard`, `SupervisorDashboard`, `EmployeeDashboard`) aggregating real-time KPIs, visual chart distributions via Recharts, and quick actions.
3. **Branch Directory:** International facility registry recording physical addresses, contact channels, designated branch directors, and operational states.
4. **Country Governance:** International operating zone definitions maintaining regional ISO codes, standard currencies, and localized timezones.
5. **Staff Directory (Employees):** Personnel management supporting credential provisioning, branch assignments, role designations, and active/inactive status toggling.
6. **Timezone-Aligned Attendance:** Daily clock-in and clock-out logging anchored to **UK London Time (`Europe/London`)**, automated punctuality flagging (`late` if after 09:00 AM UK time), automatic shift duration computation (`Xh Ym`), and manual supervisor entry modals.
7. **Task Allocation Engine:** Project and operational task distribution with priority levels (`low`, `medium`, `high`, `critical`), deadlines, and live completion progress tracking (0–100%).
8. **Inventory & Warehouse Stock:** SKU-level inventory catalog recording cost prices, retail prices, on-hand available quantities, reserved quantities, and automatic stock depletion hooks triggered by orders.
9. **Vendor & Supplier Registry:** Third-party supplier profiles maintaining contact details, supplied product catalogs, and vendor performance star ratings.
10. **Finance & Double-Entry Ledger:** Dual-currency income and expense transaction tracking, fiscal category breakdowns, and exportable ledger audit records.
11. **Order Fulfillment & Checklist:** Customer purchase management with status progression (`created` → `packed` → `dispatched` → `delivered`), printable and downloadable invoices via `InvoiceModal`, and individual product line-item check-off with browser `localStorage` persistence.
12. **Approval Center:** Structured dual-workflow authorization for regional fund allocations and inter-branch inventory transfers.
13. **CRM — Customer Directory:** Client database recording customer names, phone numbers, addresses, and transaction histories linked to active orders.
14. **CRM — Lead Tracking:** Sales pipeline monitoring prospective customer inquiries across multi-channel sources (`website`, `social`, `referral`, `cold-call`, `email`), deal values, and conversion stages.
15. **Notifications Engine:** Role- and user-targeted notifications with read/unread statuses and priority visual badges.
16. **System Settings & Security Audit Logs:** Centralized company profile management, default tax rate configuration, and forensic security logging capturing IP addresses, actors, and operation summaries.

### 1.3. User Roles & Permission Matrix

The application implements a multi-tier Role-Based Access Control (RBAC) model enforced across both the React frontend routing layer and Express backend API middleware:

| Module / Route | Admin Role | Supervisor Role | Employee Role |
| :--- | :---: | :---: | :---: |
| **System Dashboard** | Full Corporate KPIs (GBP £) | Branch Operational KPIs (INR ₹) | Personal Work & Attendance KPIs |
| **Country Governance** | Read & Write | No Access | No Access |
| **Branch Directory** | Read & Write | Read Only | Read Only |
| **Employee Directory** | Read & Write | Read & Write | No Access |
| **Attendance Tracking** | Full Audit & Manual Override | Branch Audit & Clock-In | Personal Clock-In / Clock-Out |
| **Task Management** | Assign & Review All | Assign Branch Tasks | View & Update Assigned Tasks |
| **Inventory Catalog** | Full Read & Write | Branch Read & Write | No Access |
| **Vendor Registry** | Full Read & Write | No Access | No Access |
| **Finance Ledger** | Full Read & Write (GBP £) | Branch Ledger (INR ₹) | No Access |
| **Order Processing** | Full Management & Pricing | Branch Management | View Assigned & Mark Delivery |
| **Approval Center** | Final Authorizer (Approve/Reject) | Submitter & Branch Reviewer | No Access |
| **Customer Directory** | Full Management | Branch Customer Management | No Access |
| **Lead Generation (CRM)**| Full Management | Branch Sales Oversight | No Access |
| **Reports & Exports** | Full Analytics & Export | Branch Analytics | No Access |
| **System Settings** | Full Read & Write | No Access | No Access |
| **Audit Logs** | Full Read Only | No Access | No Access |

---

## 2. Technology Stack & Component Inventory

### 2.1. Frontend Architecture
- **Core Framework:** React 18.3.1
- **Language:** TypeScript 5.5.3
- **Build Tooling & Development Server:** Vite 5.4.8
- **Styling Framework:** Tailwind CSS 3.4.1 with PostCSS 8.4.35 and Autoprefixer 10.4.18
- **Routing Engine:** React Router DOM 6.30.4 (Client-side HTML5 History API)
- **Data Visualization & Analytics:** Recharts 2.15.4
- **Iconography:** Lucide React 0.344.0
- **Alerts & Toast Notifications:** React Hot Toast 2.6.0
- **Architecture Pattern:** Provider-Consumer context architecture (`AuthProvider`, `DbContext`, `ThemeContext`) with local caching and optimistic UI updates.

### 2.2. Backend Architecture
- **Runtime Environment:** Node.js (v22.22.2 verified)
- **API Framework:** Express 4.19.2 (ES Module standard: `"type": "module"`)
- **Database Object Data Modeling (ODM):** Mongoose 8.3.1
- **Cryptographic Security:** Bcrypt.js 2.4.3 (salted password hashing)
- **Authentication Token Standard:** JSON Web Token (jsonwebtoken 9.0.2)
- **Cross-Origin Security:** CORS 2.8.5
- **Environment Management:** Dotenv 16.4.5
- **Process & Development Tooling:** Nodemon 3.1.14

---

## 3. Database Architecture & Live Telemetry

### 3.1. Engine & Hosting Topology
- **Database Engine:** MongoDB (Document-oriented NoSQL)
- **Host Location:** MongoDB Atlas Cloud Cluster (`sparkzen.mongodb.net`)
- **Database Name:** `globalERP`
- **Transport Security:** TLS 1.2+ encrypted channel with DNS SRV routing

### 3.2. Live Database Telemetry (Direct Query)
The live telemetry captured directly from the production MongoDB database instance:
- **Total Collections:** 16 active collections
- **Total Documents:** 268 records
- **Data Size:** 87,684 bytes (~85.63 KB uncompressed)
- **Storage Allocated:** 577,536 bytes (~564.00 KB on disk)
- **Average Document Payload:** 327.18 bytes
- **Total B-Tree Indexes:** 22
- **Index Disk Allocation:** 790,528 bytes (~772.00 KB)

### 3.3. Document Collection Overview
1. `employees`: User accounts, hashed credentials, roles, and branch links (3 records).
2. `orders`: Customer sales orders with embedded product arrays and delivery timelines (11 records).
3. `products`: Warehouse inventory items, SKUs, and stock quantities (8 records).
4. `attendances`: Daily staff clock-in/out records synchronized with UK time (7 records).
5. `tasks`: Operational task assignments, deadlines, and progress bars (4 records).
6. `branches`: Physical branch facilities and regional managers (1 record).
7. `customers`: Commercial clients and buyer directories (12 records).
8. `fundrequests`: Budget requisitions awaiting executive signoff (1 record).
9. `transactions`: Corporate income and expense ledger records (1 record).
10. `settings`: Overarching company parameters and tax guidelines (1 record).
11. `notifications`: In-app event alerts (21 records).
12. `auditlogs`: Immutable chronological security logs (198 records).
13. `vendors`: External product suppliers (0 records).
14. `leads`: Prospective sales pipeline leads (0 records).
15. `countries`: Regional sovereign trade locations (0 records).
16. `inventoryrequests`: Inter-branch inventory requisition workflows (0 records).

*(Refer to `docs/DATABASE_SCHEMA.md` for complete field-by-field schema definitions).*

---

## 4. Backend API & Business Logic Specifications

The backend service runs on port `5000` (or `PORT` from `.env`). It handles incoming HTTP traffic with Express middleware:
- **DNS Server Fallback:** Automatically sets fallback DNS servers (`8.8.8.8`, `1.1.1.1`) to ensure reliable resolution of MongoDB Atlas SRV connection strings.
- **JSON Body Parsing:** Handled via `express.json()`.
- **Cross-Origin Access:** Handled via `cors()`.

### 4.1. Key Specialized Business Logic

#### Automated Inventory Stock Depletion (`POST /api/orders`)
When an order is created, the backend executes an inventory decrement routine:
1. Validates requested quantities against available stock in the `products` collection.
2. If stock is insufficient, rejects the order with an explicit error response.
3. Automatically deducts the ordered unit count from `availableQuantity`.
4. Re-evaluates item stock health, switching status to `low-stock` (<= 5 units) or `out-of-stock` (0 units).

#### UK Time-Synchronized Attendance (`POST /api/attendance/check-in`)
Attendance timestamps are calculated using the `Europe/London` timezone:
1. Resolves date (`YYYY-MM-DD`) and time (`HH:MM`) against the UK calendar.
2. Validates that the employee has not already submitted an attendance record for the date.
3. Evaluates punctuality: If time exceeds `09:00`, assigns `status: 'late'`; otherwise assigns `status: 'present'`.
4. On checkout (`POST /api/attendance/check-out`), computes exact elapsed minutes and records formatted `workingHours` (e.g. `8h 15m`).

#### Dynamic Role-Based KPIs (`GET /api/dashboard/stats`)
Calculates real-time aggregation metrics for the three roles:
- **Admin:** System-wide counts, complete ledger balance, and revenue month-over-month growth calculations.
- **Supervisor:** Branch-filtered available budget, task queues, and performance metrics.
- **Employee:** Personal daily attendance verification, active task lists, and pending requests.

*(Refer to `docs/API_DOCUMENTATION.md` for the complete HTTP endpoint specifications).*

---

## 5. Frontend Architecture & User Interface

### 5.1. Context & Global State Management
- **`AuthContext.tsx`:** Manages user authentication, token storage in `localStorage`, session restoration on application boot via `GET /api/auth/me`, and fallback authentication utilizing built-in offline credentials if the backend server is unreachable.
- **`DbContext.tsx`:** Coordinates all CRUD communications with the backend API. Implements request timeout guards (3,000ms), optimistic UI updates, and error handling.
- **`ThemeContext.tsx`:** Coordinates UI theming preferences.

### 5.2. Local Delivery Indication Persistence
The Order fulfillment checklist (`src/pages/OrdersPage.tsx`) allows delivery personnel to check off individual items inside an order. To ensure uninterrupted workflows across browser refreshes, the state is persisted to `localStorage` under `globaldrop_order_checked_products`. When users reload the page or reopen modal dialogs, item check marks are immediately restored without modifying underlying database records.

### 5.3. Currency & Localization
Implemented in `src/utils/currency.ts`:
- **Admin View:** Displays all financial amounts formatted in British Pounds (`£` GBP, e.g. `£1,250.00`).
- **Supervisor & Employee Views:** Displays financial amounts formatted in Indian Rupees (`₹` INR, e.g. `₹1,25,000`).

---

## 6. Hosting, Infrastructure & Cost Analysis

### 6.1. Deployment Strategy
- **Frontend SPA:** Packaged via `npm run build` into `dist/`. Configured with `vercel.json` rewrite rules (`source: /(.*)` -> `destination: /index.html`) for deployment on Vercel or any static cloud hosting platform.
- **Backend Service:** Standalone Node.js Express server running `node server.js` on port `5000` under process managers (PM2 / systemd / Docker).
- **Database:** Hosted on MongoDB Atlas Cloud.

### 6.2. Verified vs Confirmation Required Costs
- **MongoDB Atlas Storage:** Current database size is ~0.56 MB. Operates within the MongoDB Atlas M0 Sandbox Tier (**$0.00/mo**). Customer confirmation required if running on paid dedicated M2/M5 tiers.
- **Frontend Vercel Hosting:** Standard SPA runs on Vercel Hobby (**$0.00/mo**) or Pro (**$20.00/mo**).
- **Backend Node.js VPS:** Recommended 1 vCPU / 1-2 GB RAM cloud instance (**~$5.00 – $12.00/mo**).
- **Domain & SSL:** SSL is free via Let's Encrypt / Vercel SSL. Custom domain renewal is typically **$12.00 – $15.00/year**.

*(Refer to `docs/INFRASTRUCTURE_AND_COST_SUMMARY.md` for the complete cost ledger).*

---

## 7. Security Documentation

1. **Password Encryption:** User passwords are encrypted using `bcryptjs` with 10 salt rounds before storage in the `employees` collection. Plaintext passwords are never stored in the database.
2. **Session Security:** State updates use signed JSON Web Tokens (JWT) containing user ID, role, branch, and email, with a 7-day expiration.
3. **Database Network Isolation:** Database connectivity is restricted via MongoDB Atlas IP Access Lists and uses encrypted TLS connections.
4. **Audit Trail:** Critical operations (logins, logouts, order creations, attendance clock-ins, setting updates) trigger automatic entries in the `auditlogs` collection recording IP address, actor, and action details.

---

## 8. Existing Technical Limitations

To ensure absolute accuracy, the following boundaries of the current implementation are documented:
1. **Binary Asset & File Storage:** Product images and profile pictures are stored as string URLs. Direct binary file upload to cloud object storage (e.g. AWS S3, Cloudinary) is not currently implemented.
2. **Email Notification Dispatch:** Notifications are stored in MongoDB and rendered in-app. External transactional email delivery (SMTP/SendGrid/SES) is not currently wired up.
3. **Multi-Tenant Data Segregation:** The system operates on a shared database schema where branches are identified via document fields rather than separate database schemas per branch.
4. **Unrouted Page Templates:** Three page templates exist in `src/pages/` (`LocationsPage.tsx`, `RegisterPage.tsx`, `WalletPage.tsx`) that are not currently mounted in `src/App.tsx` routing.

---

## 9. Project Handover & Operational Runbook

### 9.1. Project Directory Structure
```
globaldrop-erp-main/
├── docs/                               # Technical Documentation Artifacts
│   ├── TECHNICAL_DOCUMENTATION.md      # Master Technical Manual
│   ├── DATABASE_SCHEMA.md              # Database Schema & Telemetry
│   ├── API_DOCUMENTATION.md            # REST API Specification
│   ├── INFRASTRUCTURE_AND_COST_SUMMARY.md # Sizing & Cost Analysis
│   └── GlobalDrop_ERP_Technical_Documentation.pdf # Compiled Executive PDF
├── server/                             # Express REST API Backend
│   ├── .env.example                    # Backend Environment Template
│   ├── models.js                       # Mongoose Database Schemas
│   ├── server.js                       # Express Application Entry Point
│   └── package.json                    # Backend Dependencies
├── src/                                # React TypeScript Frontend
│   ├── components/                     # Layout, TopNav, Sidebar, InvoiceModal
│   ├── context/                        # AuthContext, DbContext, ThemeContext
│   ├── data/                           # Fallback Offline Dummy Data
│   ├── pages/                          # Application Pages & Dashboards
│   ├── types/                          # TypeScript Interfaces
│   └── utils/                          # Currency & Formatting Utilities
├── index.html                          # Application HTML5 Entry Point
├── package.json                        # Frontend Dependencies & Scripts
├── tailwind.config.js                  # Tailwind Design System Configuration
├── vercel.json                         # Vercel Deployment Configuration
└── vite.config.ts                      # Vite Build Configuration
```

### 9.2. Installation & Startup Instructions

#### Step 1: Backend Setup
```bash
cd server
npm install
cp .env.example .env
# Configure MONGO_URI, PORT=5000, and JWT_SECRET in server/.env
npm start
```

#### Step 2: Frontend Setup
```bash
# In the project root directory:
npm install
npm run dev
```

The frontend web application will become available at `http://localhost:5173`.

