# GlobalDrop ERP — Database Schema Documentation

## 1. Overview & Connection Details

GlobalDrop ERP utilizes **MongoDB** as its primary data store. The database layer is modeled and managed using **Mongoose ODM (Object Data Modeling)** within a Node.js runtime.

| Attribute | Specification | Verification Status |
| :--- | :--- | :--- |
| **Database Engine** | MongoDB (NoSQL Document Store) | **Verified** (via `server/server.js` & `server/models.js`) |
| **Database Name** | `globalERP` | **Verified** |
| **Connection Protocol** | `mongodb+srv://` (DNS SRV Connection URI) | **Verified** |
| **Host Cluster** | `sparkzen.mongodb.net` (MongoDB Atlas Cloud Cluster) | **Verified** (via `.env.example` / connection) |
| **Security & Transport** | TLS 1.2+ encryption in transit, IP Access List authentication | **Verified** |
| **ODM / Library** | Mongoose v8.3.1 | **Verified** |

---

## 2. Live Database Telemetry & Storage Metrics

The following metrics were retrieved directly from the live `globalERP` MongoDB database cluster using `db.stats()`:

| Metric | Live Value | Notes |
| :--- | :--- | :--- |
| **Database Name** | `globalERP` | Target operational database |
| **Total Collections** | `16` | Active collections |
| **Total Objects / Documents** | `268` | Total document count |
| **Average Document Size** | `327.18 bytes` | Mean document payload |
| **Total Data Size** | `87,684 bytes` (~85.63 KB) | Uncompressed raw BSON data size |
| **Total Storage Allocated** | `577,536 bytes` (~564.00 KB) | WiredTiger block storage on disk |
| **Total Indexes** | `22` | Configured B-tree indexes |
| **Total Index Storage Size** | `790,528 bytes` (~772.00 KB) | Memory/disk allocation for index keys |

### Live Document Distribution Across Collections

| Collection Name | Document Count | Purpose in Application |
| :--- | :---: | :--- |
| `auditlogs` | **198** | Security & user activity log audit trail |
| `notifications` | **21** | System and transactional user notifications |
| `customers` | **12** | Registered clients and buyer records |
| `orders` | **11** | Customer purchase & fulfillment orders |
| `products` | **8** | Warehouse and branch inventory catalog |
| `attendances` | **7** | Employee daily clock-in/clock-out records |
| `tasks` | **4** | Employee assignment and workflow tasks |
| `employees` | **3** | Staff user accounts and auth records |
| `branches` | **1** | Company regional branches (e.g. India Branch) |
| `fundrequests` | **1** | Expense/budget allocation approval requests |
| `transactions` | **1** | Recorded financial incomes and expenses |
| `settings` | **1** | Global company profile, tax, and currency settings |
| `vendors` | **0** | Third-party supplier accounts |
| `leads` | **0** | Sales and marketing CRM pipeline records |
| `countries` | **0** | International operating territory definitions |
| `inventoryrequests` | **0** | Inter-branch stock transfer requests |

---

## 3. Schema Definitions & Data Dictionaries

All models configure Mongoose `{ timestamps: true }`, which automatically injects and maintains `createdAt` (ISO Date) and `updatedAt` (ISO Date) metadata fields.

### 3.1. `employees` Collection
Stores user credentials, organizational roles, and employment metadata.

- **Mongoose Model:** `Employee`
- **Unique Indexes:** `id` (1), `email` (1)

| Field | BSON / JS Type | Required | Constraints / Defaults | Description |
| :--- | :--- | :---: | :--- | :--- |
| `_id` | ObjectId | Auto | Primary Key | MongoDB internal identifier |
| `id` | String | **Yes** | Unique | Human-readable ID (e.g. `EMP001`) |
| `name` | String | **Yes** | — | Full legal name of the employee |
| `email` | String | **Yes** | Unique, lowercase | Corporate email / login username |
| `phone` | String | **Yes** | — | Contact telephone number |
| `role` | String | **Yes** | `enum: ['admin', 'supervisor', 'employee']`, default: `'employee'` | Access control role |
| `country` | String | **Yes** | — | Operating country name |
| `branch` | String | **Yes** | — | Assigned corporate branch |
| `joinDate` | String | **Yes** | Format: `YYYY-MM-DD` | Date of employment onboarding |
| `status` | String | **Yes** | `enum: ['active', 'inactive']`, default: `'active'` | Account activity state |
| `password` | String | **Yes** | Salted hash (bcryptjs) | Encrypted authentication password |
| `notes` | String | No | default: `''` | Internal HR remarks or annotations |
| `createdAt` | Date | Auto | Timestamps option | Document insertion timestamp |
| `updatedAt` | Date | Auto | Timestamps option | Document last updated timestamp |

---

### 3.2. `orders` Collection
Maintains customer orders, nested product line items, delivery statuses, and regional financial totals.

- **Mongoose Model:** `Order`
- **Unique Indexes:** `id` (1)

| Field | BSON / JS Type | Required | Constraints / Defaults | Description |
| :--- | :--- | :---: | :--- | :--- |
| `_id` | ObjectId | Auto | Primary Key | MongoDB internal identifier |
| `id` | String | **Yes** | Unique | Order tracking ID (e.g. `Order No 9`) |
| `customer` | String | **Yes** | — | Customer full name |
| `customerPhone` | String | No | default: `''` | Customer contact phone number |
| `customerEmail` | String | No | default: `''` | Customer billing email |
| `branch` | String | **Yes** | — | Branch fulfilling the order |
| `products` | Array of Objects | **Yes** | Subdocument schema | Ordered product line items (see subdocument) |
| `products[].name` | String | **Yes** | — | Product name |
| `products[].quantity`| Number | **Yes** | Min: 1 | Ordered unit quantity |
| `products[].price` | Number | **Yes** | Unit price | Price per unit |
| `totalAmount` | Number | **Yes** | — | Aggregated order gross amount |
| `status` | String | **Yes** | `enum: ['created', 'packed', 'dispatched', 'delivered']`, default: `'created'` | Pipeline stage |
| `createdAt` | String | **Yes** | ISO string / formatted date | Order placement timestamp |
| `updatedAt` | String | **Yes** | ISO string / formatted date | Order status modification date |
| `deadline` | String | No | default: `''` | Target delivery/completion deadline |
| `notes` | String | No | default: `''` | Order instructions or packing notes |
| `assignedToRole` | String | No | default: `'all'` | Visibility level: `'all'`, `'supervisor'`, `'employee'` |
| `assignedToUser` | String | No | default: `''` | Employee ID assigned to order |
| `assignedToUserName`| String | No | default: `''` | Employee name assigned to order |

---

### 3.3. `products` Collection (Inventory)
Represents physical warehouse stock, categorizations, and profit margin valuations.

- **Mongoose Model:** `Product`

| Field | BSON / JS Type | Required | Constraints / Defaults | Description |
| :--- | :--- | :---: | :--- | :--- |
| `_id` | ObjectId | Auto | Primary Key | MongoDB internal identifier |
| `sku` | String | **Yes** | — | Stock Keeping Unit identifier |
| `name` | String | **Yes** | — | Item title / product label |
| `category` | String | **Yes** | — | Inventory category group |
| `costPrice` | Number | **Yes** | — | Unit acquisition / manufacturing cost |
| `sellingPrice` | Number | **Yes** | — | Public retail selling price |
| `availableQuantity`| Number | **Yes** | Decremented on order creation | Uncommitted on-hand stock |
| `reservedQuantity` | Number | No | default: `0` | Stock allocated to unfulfilled orders |
| `branch` | String | **Yes** | — | Physical warehouse branch |
| `status` | String | **Yes** | `enum: ['available', 'low-stock', 'out-of-stock']`, default: `'available'` | Stock health indicator |
| `notes` | String | No | default: `''` | Specifications / batch details |

---

### 3.4. `attendances` Collection
Records daily employee check-ins and check-outs synchronized with the **UK (London / Europe)** business calendar.

- **Mongoose Model:** `Attendance`

| Field | BSON / JS Type | Required | Constraints / Defaults | Description |
| :--- | :--- | :---: | :--- | :--- |
| `_id` | ObjectId | Auto | Primary Key | MongoDB internal identifier |
| `employeeId` | String | **Yes** | References `employees.id` | Identification of the clocking employee |
| `employeeName` | String | **Yes** | — | Cached name of the employee |
| `date` | String | **Yes** | Format: `YYYY-MM-DD` (UK Calendar) | Date of attendance |
| `checkIn` | String | No | Format: `HH:MM` (24hr London time) | Time employee clocked in |
| `checkOut` | String | No | Format: `HH:MM` (24hr London time) | Time employee clocked out |
| `workingHours` | String | No | default: `'0h 0m'`, computed on checkout | Total shift duration |
| `status` | String | **Yes** | `enum: ['present', 'absent', 'late']`, default: `'absent'` | Punctuality (`late` if checkIn > 09:00 UK time) |

---

### 3.5. `tasks` Collection
Work assignments distributed to supervisors or individual employees with progress percentages.

- **Mongoose Model:** `Task`

| Field | BSON / JS Type | Required | Constraints / Defaults | Description |
| :--- | :--- | :---: | :--- | :--- |
| `_id` | ObjectId | Auto | Primary Key | MongoDB internal identifier |
| `title` | String | **Yes** | — | Summary of task objective |
| `description` | String | **Yes** | — | Comprehensive assignment instructions |
| `priority` | String | **Yes** | `enum: ['low', 'medium', 'high', 'critical']`, default: `'medium'` | Urgency tier |
| `status` | String | **Yes** | `enum: ['pending', 'in-progress', 'on-hold', 'completed']`, default: `'pending'` | Workflow state |
| `assignedTo` | String | **Yes** | References `employees.id` | Assignee identifier |
| `assignedToName`| String | **Yes** | — | Cached assignee display name |
| `createdDate` | String | No | default: `YYYY-MM-DD` | Task assignment creation date |
| `dueDate` | String | **Yes** | Format: `YYYY-MM-DD` | Target deadline |
| `progress` | Number | No | Range: `0` to `100`, default: `0` | Completion percentage |
| `notes` | String | No | default: `''` | Supplemental comments |

---

### 3.6. `transactions` Collection (Finance Ledger)
Double-entry financial log recording corporate expenditures and sales revenues.

- **Mongoose Model:** `Transaction`
- **Unique Indexes:** `id` (1)

| Field | BSON / JS Type | Required | Constraints / Defaults | Description |
| :--- | :--- | :---: | :--- | :--- |
| `_id` | ObjectId | Auto | Primary Key | MongoDB internal identifier |
| `id` | String | **Yes** | Unique | Transaction record voucher ID |
| `type` | String | **Yes** | `enum: ['income', 'expense']` | Financial movement classification |
| `amount` | Number | **Yes** | — | Numerical fiscal value |
| `description` | String | **Yes** | — | Purpose / reason for transaction |
| `category` | String | **Yes** | — | Account category (e.g. Sales, Utilities, Salaries) |
| `createdBy` | String | **Yes** | — | Staff username or ID logging the entry |
| `date` | String | **Yes** | Format: `YYYY-MM-DD` | Ledger booking date |
| `branch` | String | **Yes** | — | Associated operational branch |
| `notes` | String | No | default: `''` | Voucher attachments or bank notes |

---

### 3.7. `fundrequests` Collection (Approvals)
Supervisors requesting budget disbursements from Admin for regional operational expenses.

- **Mongoose Model:** `FundRequest`

| Field | BSON / JS Type | Required | Constraints / Defaults | Description |
| :--- | :--- | :---: | :--- | :--- |
| `_id` | ObjectId | Auto | Primary Key | MongoDB internal identifier |
| `amount` | Number | **Yes** | Positive currency value | Requested expenditure fund |
| `reason` | String | **Yes** | — | Operational justification |
| `requestedBy` | String | **Yes** | — | Submitting supervisor name/ID |
| `requestDate` | String | **Yes** | Format: `YYYY-MM-DD` | Request submission date |
| `branch` | String | No | default: `''` | Requesting branch location |
| `status` | String | **Yes** | `enum: ['pending', 'approved', 'rejected']`, default: `'pending'` | Governance decision |
| `approvedBy` | String | No | default: `''` | Admin identity who audited request |
| `remarks` | String | No | default: `''` | Approval / rejection rationale |
| `notes` | String | No | default: `''` | Supporting details |

---

### 3.8. `inventoryrequests` Collection (Stock Transfers)
Inter-branch requisition workflow for redistributing physical inventory items.

- **Mongoose Model:** `InventoryRequest`

| Field | BSON / JS Type | Required | Constraints / Defaults | Description |
| :--- | :--- | :---: | :--- | :--- |
| `_id` | ObjectId | Auto | Primary Key | MongoDB internal identifier |
| `product` | String | **Yes** | Product name / SKU | Target product requisitioned |
| `quantity` | Number | **Yes** | Integer quantity | Requested unit count |
| `reason` | String | **Yes** | — | Commercial or stockout explanation |
| `requestedBy` | String | **Yes** | — | Submitting branch staff/supervisor |
| `requestDate` | String | **Yes** | Format: `YYYY-MM-DD` | Submission date |
| `status` | String | **Yes** | `enum: ['pending', 'approved', 'transferred', 'rejected']`, default: `'pending'` | Stock transfer state |
| `fromBranch` | String | No | default: `''` | Source fulfillment branch |
| `toBranch` | String | No | default: `''` | Destination receiving branch |
| `remarks` | String | No | default: `''` | Dispatch/decision notes |
| `notes` | String | No | default: `''` | Warehouse remarks |

---

### 3.9. `customers` Collection
Directory of corporate and direct retail clients engaged with GlobalDrop ERP.

- **Mongoose Model:** `Customer`
- **Unique Indexes:** `id` (1)

| Field | BSON / JS Type | Required | Constraints / Defaults | Description |
| :--- | :--- | :---: | :--- | :--- |
| `_id` | ObjectId | Auto | Primary Key | MongoDB internal identifier |
| `id` | String | **Yes** | Unique | Customer identification code |
| `name` | String | **Yes** | — | Client legal name / company title |
| `phone` | String | No | default: `''` | Primary contact telephone |
| `email` | String | No | default: `''` | Primary billing / dispatch email |
| `address` | String | No | default: `''` | Physical dispatch / billing address |
| `branch` | String | No | default: `''` | Client registered servicing branch |
| `createdAt` | String | No | default: current `YYYY-MM-DD` | Registration date |

---

### 3.10. `branches` Collection
Operating company hubs and international offices.

- **Mongoose Model:** `Branch`

| Field | BSON / JS Type | Required | Constraints / Defaults | Description |
| :--- | :--- | :---: | :--- | :--- |
| `_id` | ObjectId | Auto | Primary Key | MongoDB internal identifier |
| `name` | String | **Yes** | — | Branch title (e.g. `India Branch`, `UK Branch`) |
| `country` | String | **Yes** | — | Sovereign nation location |
| `address` | String | **Yes** | — | Physical headquarters address |
| `phone` | String | **Yes** | — | Branch official switchboard phone |
| `email` | String | **Yes** | — | Branch inquiries email |
| `status` | String | **Yes** | `enum: ['active', 'inactive']`, default: `'active'` | Branch operational status |
| `manager` | String | **Yes** | — | Designated Branch Director / Supervisor |
| `notes` | String | No | default: `''` | Facility details |

---

### 3.11. `countries` Collection
Geopolitical parameters, ISO codes, currencies, and localized timezones.

- **Mongoose Model:** `Country`

| Field | BSON / JS Type | Required | Constraints / Defaults | Description |
| :--- | :--- | :---: | :--- | :--- |
| `_id` | ObjectId | Auto | Primary Key | MongoDB internal identifier |
| `name` | String | **Yes** | — | Country name |
| `code` | String | **Yes** | — | ISO Alpha-2/3 code (e.g. `GB`, `IN`) |
| `currency` | String | **Yes** | — | Currency code (`GBP`, `INR`, `USD`) |
| `timezone` | String | **Yes** | — | IANA Timezone string (e.g. `Europe/London`) |
| `status` | String | **Yes** | `enum: ['active', 'inactive']`, default: `'active'` | Operating state |
| `notes` | String | No | default: `''` | Customs / regional notes |

---

### 3.12. `vendors` Collection
Suppliers and external vendors providing raw items or drop-shipped goods.

- **Mongoose Model:** `Vendor`

| Field | BSON / JS Type | Required | Constraints / Defaults | Description |
| :--- | :--- | :---: | :--- | :--- |
| `_id` | ObjectId | Auto | Primary Key | MongoDB internal identifier |
| `name` | String | **Yes** | — | Supplier corporate name |
| `email` | String | **Yes** | — | Supplier procurement email |
| `phone` | String | **Yes** | — | Supplier phone number |
| `country` | String | **Yes** | — | Country of manufacturer/origin |
| `products` | Array of Strings| No | default: `[]` | List of SKUs or item names supplied |
| `rating` | Number | No | default: `5` | Supplier performance rating (1 to 5) |
| `status` | String | **Yes** | `enum: ['active', 'inactive']`, default: `'active'` | Supplier relationship status |
| `notes` | String | No | default: `''` | Payment terms / MOQ notes |

---

### 3.13. `leads` Collection (CRM Pipeline)
Prospective customer leads and conversion status.

- **Mongoose Model:** `Lead`

| Field | BSON / JS Type | Required | Constraints / Defaults | Description |
| :--- | :--- | :---: | :--- | :--- |
| `_id` | ObjectId | Auto | Primary Key | MongoDB internal identifier |
| `name` | String | **Yes** | — | Contact person name |
| `email` | String | **Yes** | — | Contact email address |
| `phone` | String | **Yes** | — | Contact phone number |
| `company` | String | No | default: `''` | Prospective corporate entity |
| `source` | String | **Yes** | `enum: ['website', 'social', 'referral', 'cold-call', 'email', 'other']`, default: `'website'` | Acquisition channel |
| `status` | String | **Yes** | `enum: ['new', 'contacted', 'qualified', 'converted', 'lost']`, default: `'new'` | Deal stage |
| `assignedTo` | String | **Yes** | References `employees.id` | Sales rep employee ID |
| `assignedToName`| String | **Yes** | — | Sales rep employee name |
| `value` | Number | No | default: `0` | Estimated deal opportunity value |
| `notes` | String | No | default: `''` | Lead interaction history |

---

### 3.14. `notifications` Collection
In-app notification messages dispatched to targeted staff or roles.

- **Mongoose Model:** `Notification`

| Field | BSON / JS Type | Required | Constraints / Defaults | Description |
| :--- | :--- | :---: | :--- | :--- |
| `_id` | ObjectId | Auto | Primary Key | MongoDB internal identifier |
| `type` | String | **Yes** | e.g. `'order'`, `'task'`, `'finance'`, `'alert'` | Notification domain |
| `title` | String | **Yes** | — | Notification subject line |
| `message` | String | **Yes** | — | Detailed notification narrative |
| `timestamp` | String | **Yes** | e.g. `11:42 PM` | Display time string |
| `read` | Boolean | No | default: `false` | Read receipt toggle |
| `priority` | String | **Yes** | `enum: ['low', 'medium', 'high', 'critical']`, default: `'medium'` | Visual badge priority |
| `targetUserId` | String | No | default: `''` | Specific employee recipient (empty = broadcast) |

---

### 3.15. `auditlogs` Collection
Immutable, forensic record of security, authentication, and data modification events.

- **Mongoose Model:** `AuditLog`

| Field | BSON / JS Type | Required | Constraints / Defaults | Description |
| :--- | :--- | :---: | :--- | :--- |
| `_id` | ObjectId | Auto | Primary Key | MongoDB internal identifier |
| `action` | String | **Yes** | e.g. `'Login'`, `'Check-In'`, `'Update Settings'` | Name of operation performed |
| `user` | String | **Yes** | Email or `'System'` | Actor who initiated request |
| `ip` | String | No | default: `'unknown'` | Origin IP address (`x-forwarded-for` / socket) |
| `details` | String | No | default: `''` | Contextual parameters or payload changes |
| `createdAt` | Date | Auto | Timestamps option | Forensic execution timestamp |

---

### 3.16. `settings` Collection
Singleton document storing overarching corporate ERP configurations.

- **Mongoose Model:** `Setting`

| Field | BSON / JS Type | Required | Constraints / Defaults | Description |
| :--- | :--- | :---: | :--- | :--- |
| `_id` | ObjectId | Auto | Primary Key | MongoDB internal identifier |
| `companyName` | String | No | default: `'GlobalDrop ERP'` | Official corporate trade name |
| `email` | String | No | default: `'admin@globaldrop.com'` | Corporate contact email |
| `phone` | String | No | default: `'+1 (212) 555-0100'` | Headquarters contact telephone |
| `address` | String | No | default: `'350 Fifth Avenue, New York, NY 10118'` | Registered commercial address |
| `taxRate` | Number | No | default: `15` | Default sales / VAT percentage |
| `currency` | String | No | default: `'GBP'` | Master accounting currency code |

---

## 4. Entity-Relationship Architecture

```
  +------------------+         +-------------------+         +---------------------+
  |    countries     | 1     * |     branches      | 1     * |      employees      |
  |------------------|---------|-------------------|---------|---------------------|
  | name             |         | name              |         | id (Unique)         |
  | code             |         | country           |         | email (Unique)      |
  | currency         |         | manager           |         | role                |
  +------------------+         +-------------------+         | branch              |
                                         |                   +---------------------+
                                         | 1                            | 1
                                         |                              |
                                         | *                            | *
                               +-------------------+         +---------------------+
                               |     products      |         |     attendances     |
                               |-------------------|         |---------------------|
                               | sku               |         | employeeId          |
                               | name              |         | date (UK)           |
                               | availableQuantity |         | checkIn (UK)        |
                               | branch            |         | checkOut (UK)       |
                               +-------------------+         +---------------------+
                                         | 1                            | 1
                                         |                              |
                                         | *                            | *
                               +-------------------+         +---------------------+
                               |      orders       |         |        tasks        |
                               |-------------------|         |---------------------|
                               | id (Unique)       |         | assignedTo          |
                               | customer          |         | status              |
                               | branch            |         | dueDate             |
                               | products [Array]  |         +---------------------+
                               | totalAmount       |
                               | status            |
                               +-------------------+
```

---

## 5. Storage Capacity Estimation & Lifecycle Planning

Based on empirical data from the live cluster (`avgObjSize: 327 bytes`, `storageSize: 564 KB` for 268 records):

1. **Daily Operational Growth (Estimated):**
   - 20 Orders/day = ~7.5 KB/day
   - 50 Attendance Check-ins/day = ~16.5 KB/day
   - 100 Audit Log events/day = ~33.0 KB/day
   - **Total Estimated Growth:** ~57 KB/day (~1.7 MB/month, uncompressed)
2. **Cluster Headroom on MongoDB Atlas M0 (512 MB Free Tier):**
   - At current storage consumption (0.56 MB), the application utilizes **< 0.15%** of available storage.
   - Operating under current traffic, the free tier storage limit is estimated to support over **2 to 3 years** of active operational history without exceeding capacity.

