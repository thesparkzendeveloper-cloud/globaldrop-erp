# GlobalDrop ERP — API Documentation

## 1. Architecture & Protocol Standards

The GlobalDrop ERP backend is built as a RESTful HTTP service utilizing **Express 4.19.2** and **Node.js** with ES Module syntax.

| Specification | Implementation |
| :--- | :--- |
| **Base URL (Local)** | `http://localhost:5000/api` |
| **Configurable Env Key** | `VITE_SERVER_API` (Frontend) / `PORT=5000` (Backend) |
| **Data Format** | JSON (`Content-Type: application/json; charset=utf-8`) |
| **Authentication Scheme** | Bearer Token (`Authorization: Bearer <JWT_TOKEN>`) |
| **CORS Policy** | `cors()` enabled for cross-origin browser communication |
| **DNS Optimization** | Enforces public Google/Cloudflare DNS (`8.8.8.8`, `1.1.1.1`) for resilient Atlas SRV resolution |

---

## 2. Authentication & Authorization Middleware

### 2.1. Bearer Token Verification (`authenticateToken`)
All protected endpoints pass through `authenticateToken`.
1. Extracts `Authorization: Bearer <TOKEN>` header.
2. If token starts with `mock_token_`, bypasses cryptographic verification to support local offline demo sessions (`req.user = { role: 'admin', ... }`).
3. Standard JWT tokens are cryptographically verified using `JWT_SECRET` (symmetric key, 7-day expiration).
4. If missing: returns `401 Unauthorized`.
5. If invalid/expired: returns `403 Forbidden`.

### 2.2. Role-Based Access Control (`requireRole`)
Higher-privilege endpoints invoke `requireRole(allowedRoles: string[])`.
- Validates `req.user.role`.
- If the role is not included in `allowedRoles`: returns `403 Forbidden` (`{ message: 'Forbidden: Insufficient permissions' }`).

### 2.3. Audit Logging Pipeline (`logAudit`)
Every significant operation automatically logs an immutable event to the `auditlogs` collection recording:
- `action`: Name of operation
- `user`: Authenticated user email or `'System'`
- `ip`: Client IP address from `x-forwarded-for` or socket
- `details`: Contextual event details

---

## 3. Authentication Endpoints

### 3.1. User Login
- **Endpoint:** `POST /api/auth/login`
- **Access:** Public
- **Request Body:**
  ```json
  {
    "email": "admin@globaldrop.com",
    "password": "securePassword123"
  }
  ```
- **Responses:**
  - `200 OK`:
    ```json
    {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": "EMP001",
        "name": "Admin User",
        "email": "admin@globaldrop.com",
        "role": "admin",
        "branch": "UK Branch",
        "country": "United Kingdom"
      }
    }
    ```
  - `400 Bad Request`: Email and password required.
  - `401 Unauthorized`: Invalid email or incorrect password.
  - `403 Forbidden`: Account status is inactive.

### 3.2. User Logout
- **Endpoint:** `POST /api/auth/logout`
- **Access:** Authenticated (`authenticateToken`)
- **Responses:**
  - `200 OK`: `{ "message": "Logged out successfully" }`

### 3.3. Verify Session (`/me`)
- **Endpoint:** `GET /api/auth/me`
- **Access:** Authenticated (`authenticateToken`)
- **Responses:**
  - `200 OK`: Returns authenticated employee profile payload.
  - `404 Not Found`: User no longer exists in database.

---

## 4. Role-Governed Resource Matrix (`createCrudRoutes`)

The backend implements automated REST generators for core domain resources via `createCrudRoutes`. Each registered resource provides:
1. `GET /api/<resource>` — Retrieve array of records.
2. `POST /api/<resource>` — Create new record (generates unique `id` if not provided).
3. `PUT /api/<resource>/:id` — Update record by custom `id` or MongoDB `_id`.
4. `DELETE /api/<resource>/:id` — Delete record by custom `id` or MongoDB `_id`.

| Resource Path | Target Model | Read Access Roles | Write / Delete Roles |
| :--- | :--- | :--- | :--- |
| `/api/countries` | `Country` | `['admin']` | `['admin']` |
| `/api/branches` | `Branch` | `['admin', 'supervisor', 'employee']` | `['admin']` |
| `/api/employees` | `Employee` | `['admin', 'supervisor']` | `['admin', 'supervisor']` |
| `/api/attendance` | `Attendance` | `['admin', 'supervisor', 'employee']` | `['admin', 'supervisor', 'employee']` |
| `/api/tasks` | `Task` | `['admin', 'supervisor', 'employee']` | `['admin', 'supervisor', 'employee']` |
| `/api/inventory` | `Product` | `['admin', 'supervisor']` | `['admin', 'supervisor']` |
| `/api/vendors` | `Vendor` | `['admin']` | `['admin']` |
| `/api/transactions`| `Transaction`| `['admin']` | `['admin']` |
| `/api/fund-requests`| `FundRequest`| `['admin', 'supervisor']` | `['admin', 'supervisor']` |
| `/api/inventory-requests`| `InventoryRequest`| `['admin', 'supervisor']` | `['admin', 'supervisor']` |
| `/api/orders` | `Order` | `['admin', 'supervisor']` | `['admin', 'supervisor']` |
| `/api/notifications`| `Notification`| `['admin', 'supervisor', 'employee']` | `['admin', 'supervisor', 'employee']` |
| `/api/leads` | `Lead` | `['admin', 'supervisor']` | `['admin', 'supervisor']` |

---

## 5. Specialized Business Logic Endpoints

### 5.1. Secure Employee Onboarding
- **Endpoint:** `POST /api/employees/secure`
- **Access:** `admin`, `supervisor`
- **Business Logic:**
  - Validates uniqueness of both `id` and `email`.
  - Automatically salts and hashes incoming plaintext password using `bcrypt.genSalt(10)` and `bcrypt.hash()`.
  - Strips plaintext password from memory before persistence.
  - Automatically logs audit record.

### 5.2. Transactional Order Placement & Stock Decrement
- **Endpoint:** `POST /api/orders`
- **Access:** `admin`, `supervisor`
- **Business Logic:**
  1. Accepts order payload with `products` array: `[{ name, quantity, price }]`.
  2. For every item, searches the `products` (inventory) collection by name (case-insensitive) or SKU.
  3. Validates stock availability. If available quantity is insufficient, aborts and returns `400 Bad Request`.
  4. Automatically decrements `availableQuantity` on the matching inventory document.
  5. Updates inventory `status` (`out-of-stock` if 0, `low-stock` if <= 5, else `available`).
  6. Saves order record and records audit event.

### 5.3. Punctuality & Timezone-Aware Attendance Clock-In
- **Endpoint:** `POST /api/attendance/check-in`
- **Access:** Authenticated
- **Business Logic:**
  - Evaluates timestamp against **UK Time (`Europe/London`, GMT/BST)**.
  - Formats date (`YYYY-MM-DD`) and 24-hr time (`HH:MM`).
  - Enforces single check-in rule per employee per day.
  - **Punctuality Rule:** Evaluates `checkIn > "09:00"`. If true, marks status as `'late'`; otherwise marks `'present'`.
  - Persists record and creates audit entry.

### 5.4. Attendance Clock-Out & Shift Duration Calculation
- **Endpoint:** `POST /api/attendance/check-out`
- **Access:** Authenticated
- **Business Logic:**
  - Locates existing attendance document for today (UK Calendar).
  - Verifies employee has not already clocked out.
  - Sets `checkOut` time in UK format.
  - Computes exact duration: `(outMinutes - inMinutes)` converted to human-readable string: `Xh Ym` (e.g. `8h 15m`).
  - Persists total working hours.

### 5.5. Real-Time Dashboard KPI Aggregation
- **Endpoint:** `GET /api/dashboard/stats`
- **Access:** Authenticated
- **Business Logic:**
  Executes high-performance concurrent database queries to supply KPI metrics tailored to user roles:
  - **Admin KPIs:** Total countries, total branches, total employees, total orders count, inventory unit sum, pending fund/inventory requests, financial ledger summary (budget, income, expenses, balance calculated from `transactions`), revenue comparison (current month vs previous month).
  - **Supervisor KPIs:** Branch available budget, pending fund requests, pending inventory transfers, assigned active tasks, branch performance score.
  - **Employee KPIs:** Daily attendance summary (present, absent, late, total), personal assigned tasks count, pending requests.

### 5.6. Audit Log Retrieval
- **Endpoint:** `GET /api/audit-logs`
- **Access:** `admin` only
- **Query Parameters:** `?limit=100` (optional)
- **Responses:** Returns chronological array of system audit trails sorted by `createdAt: -1`.

### 5.7. System Configuration Management
- **Endpoint:** `GET /api/settings`
  - **Access:** Authenticated
  - **Response:** Returns corporate profile, default VAT/tax rate, and master base currency (`GBP`).
- **Endpoint:** `PUT /api/settings`
  - **Access:** `admin` only
  - **Response:** Updates master corporate parameters and records audit log.

### 5.8. Customer Directory Management
- **Endpoints:**
  - `GET /api/customers` — List all customers
  - `POST /api/customers` — Register new customer record
  - `PUT /api/customers/:id` — Update existing customer profile
  - `DELETE /api/customers/:id` — Remove customer record

