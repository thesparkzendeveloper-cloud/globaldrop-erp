# GlobalDrop ERP — Comprehensive User Manual & Operations Guide

**Application Name:** GlobalDrop ERP (Enterprise Resource Planning)  
**System Version:** 2.0  
**Target Audience:** System Administrators, Branch Supervisors, and Operations Staff  
**Document Classification:** Standard Operating Procedure (SOP) & User Manual  

---

## Table of Contents

1. [Introduction & System Overview](#1-introduction--system-overview)
2. [Getting Started & Login](#2-getting-started--login)
3. [User Roles & Access Permissions](#3-user-roles--access-permissions)
4. [Navigation & Layout Overview](#4-navigation--layout-overview)
5. [Role-Specific Dashboards](#5-role-specific-dashboards)
6. [Branch & Country Management](#6-branch--country-management)
7. [Employee Directory & User Provisioning](#7-employee-directory--user-provisioning)
8. [Attendance Management (UK London Time)](#8-attendance-management-uk-london-time)
9. [Task Allocation & Workflow Tracking](#9-task-allocation--workflow-tracking)
10. [Inventory & Stock Management](#10-inventory--stock-management)
11. [Vendor Directory](#11-vendor-directory)
12. [Finance & Dual-Currency Bookkeeping](#12-finance--dual-currency-bookkeeping)
13. [Orders, Fulfillment Checklist & Invoicing](#13-orders-fulfillment-checklist--invoicing)
14. [Approval Center (Funds & Stock Transfers)](#14-approval-center-funds--stock-transfers)
15. [CRM: Customer Directory & Lead Pipeline](#15-crm-customer-directory--lead-pipeline)
16. [Reports & Analytics](#16-reports--analytics)
17. [Notifications, Settings & Audit Logs](#17-notifications-settings--audit-logs)
18. [Frequently Asked Questions (FAQ) & Troubleshooting](#18-frequently-asked-questions-faq--troubleshooting)

---

## 1. Introduction & System Overview

Welcome to **GlobalDrop ERP**! GlobalDrop ERP is a complete, multi-branch operations management platform designed specifically for international retail, dropshipping, and cross-border commercial enterprises.

### Key Capabilities:
- **Centralized International Operations:** Manage multiple branches and countries from a single unified portal.
- **UK Time Attendance Synchronization:** All attendance clock-ins and clock-outs operate on **UK London Time (Europe/London, GMT/BST)**, standardizing global staff tracking.
- **Dual-Currency Localization:** Executive managers see corporate financial totals in British Pounds (**GBP £**), while regional branch managers and supervisors see figures in Indian Rupees (**INR ₹**).
- **Automated Inventory Depletion:** Creating customer orders automatically deducts physical stock from inventory, updating stock health indicators in real time.
- **Session-Persistent Delivery Checklists:** Packing and delivery personnel can check off individual order items; ticks remain saved even after page refreshes or device reboots.

---

## 2. Getting Started & Login

### 2.1. Accessing the Portal
1. Open your web browser (Google Chrome, Mozilla Firefox, Brave, or Microsoft Edge).
2. Navigate to your organization's URL:
   - **Local Environment:** `http://localhost:5173`
   - **Production Environment:** Your company domain (e.g. `https://erp.yourdomain.com`).

### 2.2. Logging In
1. On the **Welcome Back** login screen:
   - Enter your corporate **Email Address**.
   - Enter your **Password**. Click the eye icon (`👁`) to show/hide your password.
   - *(Optional)* Check **Remember me** to stay logged in across sessions.
2. Click **Sign In**.
3. Upon successful verification, you will be redirected to your role-specific dashboard.

> [!TIP]
> **Built-in Demonstration Accounts:**  
> If the backend server is operating in fallback/demo mode:
> - **Administrator:** `veloraelise@gmail.com` (Password: `password123`)
> - **Supervisor:** `shalinishalu121997@gmail.com` (Password: `password123`)

### 2.3. Logging Out
To securely exit the system:
1. Click the **Logout** button at the bottom of the left sidebar, or open the user avatar menu in the top-right corner and select **Sign Out**.
2. Your authentication token will be cleared and you will be returned to the login screen.

---

## 3. User Roles & Access Permissions

GlobalDrop ERP enforces a strict three-tier security and access matrix:

| Module / Feature | Administrator (`admin`) | Supervisor (`supervisor`) | Employee (`employee`) |
| :--- | :---: | :---: | :---: |
| **System Dashboard** | Full Corporate KPIs (GBP £) | Branch Operational KPIs (INR ₹) | Personal Tasks & Attendance |
| **Branches** | Full Management | Read Only | No Access |
| **Countries** | Full Management | No Access | No Access |
| **Employees** | Full Management | Branch Staff Management | No Access |
| **Attendance** | Full Audit & Manual Entry | Branch Audit & Clock-In | Personal Clock-In / Out |
| **Tasks** | Assign & Review All | Assign Branch Tasks | View & Update My Tasks |
| **Inventory** | Full Management | Branch Stock Management | No Access |
| **Vendors** | Full Management | No Access | No Access |
| **Finance Ledger** | Full Oversight (GBP £) | Branch Ledger (INR ₹) | No Access |
| **Orders & Invoicing** | Full Management & Pricing | Branch Management | View Assigned & Mark Delivery |
| **Approval Center** | Final Approver (Accept/Reject) | Submitter & Reviewer | No Access |
| **Customers** | Full Management | Branch Customer Management | No Access |
| **Leads (CRM)** | Full Oversight | Branch Sales Oversight | No Access |
| **Reports** | Full Corporate Exports | Branch Reports | No Access |
| **Settings & Audit Logs**| Full Management | No Access | No Access |

---

## 4. Navigation & Layout Overview

### 4.1. The Sidebar Navigation
Located on the left side of your screen:
- **Desktop:** Stays pinned for rapid navigation across all permitted modules.
- **Mobile / Tablet:** Collapses into a slide-out drawer accessible by tapping the hamburger menu icon (`☰`) at the top left.
- Only links permitted for your role are visible in the sidebar.

### 4.2. The Top Navigation Bar
- **Global Search:** Quickly search orders, products, and employees.
- **Live Clock Badge:** Displays live **UK Time (GMT/BST)** for unified time coordination.
- **Notification Bell:** Alerts you to newly assigned tasks, order status changes, and approval decisions. Click to view recent notifications.
- **Profile Pill:** Displays your display name, role badge, and quick account actions.

---

## 5. Role-Specific Dashboards

When you sign in, the system automatically opens your designated dashboard:

### 5.1. Admin Dashboard (Executive View)
- **Currency:** Displayed in British Pounds (**GBP £**).
- **KPI Summary Cards:** Total Countries, Total Branches, Total Employees, Total Orders, Total Inventory Items, and Pending Approval Requests.
- **Financial Balance Widget:** Displays overall Budget, Total Expenses, Total Income, and Net Balance computed in real time.
- **Revenue Performance:** Graphical charts comparing Current Month Revenue vs Previous Month Revenue with percentage growth.
- **Quick Shortcuts:** Instant buttons to create orders, onboard staff, or inspect audit logs.

### 5.2. Supervisor Dashboard (Branch Management View)
- **Currency:** Displayed in Indian Rupees (**INR ₹**).
- **Branch Operational Cards:** Branch Available Budget, Pending Fund Requests, Pending Stock Requisitions, and Assigned Tasks.
- **Branch Performance Score:** Percentage efficiency score calculated from task completion and order fulfillment.
- **Recent Branch Orders & Urgent Tasks:** Direct queue showing items requiring immediate supervisor attention.

### 5.3. Employee Dashboard (Self-Service View)
- **Today's Attendance Status:** Shows whether you are currently clocked in or out, your arrival timestamp, and total hours worked today.
- **Quick Clock-In / Clock-Out:** One-click action button to mark your arrival or departure.
- **My Assigned Tasks:** Interactive list of tasks assigned to you, with status badges and progress sliders.
- **My Assigned Orders:** Delivery orders assigned to your fulfillment queue.

---

## 6. Branch & Country Management

### 6.1. Managing Branches (`/branches`)
*(Administrator Only)*
1. Navigate to **Branches** from the left menu.
2. Click **+ Add Branch**.
3. Enter Branch Name (e.g. `UK Branch`, `India Branch`), sovereign Country, physical address, contact telephone, email, and designated Branch Manager.
4. Click **Save Branch**.
5. To modify or deactivate a branch, click the pencil edit icon next to any entry.

### 6.2. Managing Countries (`/countries`)
*(Administrator Only)*
1. Navigate to **Countries**.
2. Define operating jurisdictions with ISO codes (e.g. `GB` for United Kingdom, `IN` for India), base currency (`GBP`, `INR`), and standard timezone (`Europe/London`).
3. Set status to **Active** to make the territory available in branch dropdowns.

---

## 7. Employee Directory & User Provisioning

*(Admin & Supervisor Access)*

### 7.1. Adding a New Employee
1. Navigate to **Employees**.
2. Click **+ Add Employee**.
3. Complete the employee profile:
   - **Full Name:** Legal staff name.
   - **Email:** Corporate login email (must be unique).
   - **Phone Number:** Mobile contact.
   - **Role:** Select `Admin`, `Supervisor`, or `Employee`.
   - **Branch & Country:** Assign the staff member to a physical facility.
   - **Joining Date:** Onboarding date.
   - **Password:** Initial login password. *(The backend automatically encrypts this password using salted bcrypt encryption)*.
4. Click **Save Employee**.

### 7.2. Deactivating an Employee Account
If an employee departs or is placed on leave:
1. Locate the employee in the directory.
2. Click **Edit**.
3. Change **Status** from `Active` to `Inactive`.
4. Click **Update**. Inactive users are immediately barred from logging in.

---

## 8. Attendance Management (UK London Time)

*(All Roles)*

GlobalDrop ERP synchronizes all employee work hours to the **UK (London / GMT-BST)** business day.

```
       [UK London Live Time]
      /                     \
Clock In                      Clock Out
(Post 09:00 AM = "Late")       (Calculates Total Shift Duration: "8h 15m")
```

### 8.1. Clocking In (Employee Self-Service)
1. Go to **Attendance** (or your Employee Dashboard).
2. Review the live clock badge in the top-right corner: `UK (GMT/BST) [Current Time]`.
3. Click the blue **Check-In** button.
4. **Punctuality Evaluation:**
   - If you check in **at or before 09:00 AM UK Time**, your status is marked **Present** (Green badge).
   - If you check in **after 09:00 AM UK Time**, your status is automatically marked **Late** (Yellow badge).

### 8.2. Clocking Out
1. At the conclusion of your shift, return to **Attendance**.
2. Click the **Check-Out** button.
3. The system records your departure time and automatically computes your total working shift duration (e.g. `8h 24m`), displaying it in the **Hours** column.

### 8.3. Manual Attendance Adjustments
*(Admin & Supervisor Only)*
1. Click **Check-In** or **Check-Out** at the top of the Attendance screen.
2. In the modal dialog, select the **Employee Name** and target date.
3. Review the current UK London time banner.
4. Click **Confirm** to record the manual entry.

---

## 9. Task Allocation & Workflow Tracking

*(All Roles)*

### 9.1. Assigning a New Task
1. Navigate to **Tasks**.
2. Click **+ Create Task**.
3. Specify:
   - **Task Title & Description:** Clear operational instructions.
   - **Priority:** `Low`, `Medium`, `High`, or `Critical`.
   - **Assignee:** Choose an active supervisor or employee.
   - **Due Date:** Target completion deadline.
4. Click **Assign Task**. The assignee receives an immediate notification.

### 9.2. Updating Task Progress (Employee / Assignee)
1. Locate your assigned task in the list.
2. Click the task card to open details.
3. Adjust the **Progress Slider** (0% to 100%).
4. Update the **Status**:
   - `Pending` &rarr; `In-Progress` &rarr; `Completed` (or `On-Hold`).
5. When progress reaches 100%, the status turns green to indicate full completion.

---

## 10. Inventory & Stock Management

*(Admin & Supervisor Access)*

### 10.1. Stock Overview & Health Indicators
The Inventory screen (`/inventory`) categorizes products with automated status badges:
- 🟢 **Available:** Healthy stock levels (> 5 units available).
- 🟡 **Low-Stock:** Stock is critically low (1 to 5 units remaining). Replenishment required.
- 🔴 **Out-of-Stock:** 0 available units. The system will prevent order placement for this item.

### 10.2. Adding a New Product
1. Navigate to **Inventory** and click **+ Add Product**.
2. Provide:
   - **SKU Code:** Unique barcode/identifier (e.g. `SKU-BMB-001`).
   - **Product Name:** Commercial title (e.g. `Brass Masala Box`).
   - **Category:** e.g. Kitchenware, Packaging, Gifts, Apparel.
   - **Cost Price & Selling Price:** Purchase cost vs customer retail price.
   - **Initial Stock Quantity:** Number of units physically on hand.
   - **Warehouse Branch:** The branch holding the physical inventory.
3. Click **Save Product**.

### 10.3. How Orders Affect Inventory
When a sales order is created containing an inventory item:
1. The backend automatically validates that `availableQuantity >= orderedQuantity`.
2. It automatically decrements `availableQuantity` by the ordered count.
3. If stock reaches zero, the product is automatically transitioned to **Out-of-Stock**.

---

## 11. Vendor Directory

*(Administrator Only)*

1. Navigate to **Vendors** (`/vendors`).
2. Click **+ Add Vendor**.
3. Enter Vendor Company Name, Procurement Email, Phone Number, Country, Supplied Products list, and Star Rating (1 to 5 stars).
4. Click **Save Vendor**.
5. Use this directory to review supplier contact channels and reorder raw inventory.

---

## 12. Finance & Dual-Currency Bookkeeping

*(Admin & Supervisor Access)*

### 12.1. Dual-Currency Localization
- **Executive (Admin):** Financial summaries and ledger balances are displayed in British Pounds (**£ GBP**).
- **Regional (Supervisor):** Ledgers are displayed in Indian Rupees (**₹ INR**).

### 12.2. Recording a Transaction
1. Navigate to **Finance** (`/finance`).
2. Click **+ Add Transaction**.
3. Choose Transaction Type:
   - **Income:** Sales revenues, customer payments, cash inflows.
   - **Expense:** Shipping fees, packaging materials, staff wages, utilities.
4. Enter Amount, Ledger Category, Date, Branch, and descriptive remarks.
5. Click **Record Transaction**. The financial dashboard immediately recalculates net balance.

---

## 13. Orders, Fulfillment Checklist & Invoicing

*(All Roles)*

```
[Order Created] ──> [Packed] ──> [Dispatched] ──> [Delivered]
       │
       └──> [Order Products Checklist] (Saved across refresh)
       └──> [Invoice Modal] ─────────> [Print / Save PDF]
```

### 13.1. Creating a Customer Order
1. Navigate to **Orders** (`/orders`).
2. Click **+ Create Order**.
3. Fill out:
   - **Customer Name, Phone & Email.**
   - **Fulfilling Branch.**
   - **Delivery Deadline.**
   - **Order Line Items:** Add product names, unit quantities, and unit prices. (Click `+ Add Item` to add multiple products).
   - **Visibility / Assignment:** Delegate order to `Everyone`, `Supervisor Only`, or an individual staff member.
4. Click **Confirm Order**.

### 13.2. Order Status Progression
Orders move through four distinct milestones using the status selector:
1. `Created` (Blue): Order logged and awaiting warehouse packaging.
2. `Packed` (Yellow): Items gathered and packed in parcels.
3. `Dispatched` (Purple): Parcel handed over to courier / transit carrier.
4. `Delivered` (Green): Parcel successfully delivered to the customer.

### 13.3. Product Line-Item Delivery Checklist
Inside the Order details modal:
1. Scroll to **Order Products & Quantity**.
2. Each item displays an individual checkbox next to the product name and quantity.
3. As items are prepared, packed, or verified, click the checkbox.
4. A green background and bold check mark confirm the item is fulfilled.

> [!IMPORTANT]
> **Persistent State Guarantee:**  
> Checkmarks are stored in browser `localStorage`. When you refresh the webpage, switch tabs, or reopen the modal, your checked products remain saved.

### 13.4. Printing Customer Invoices
1. In the Orders table, click the document invoice icon (`📄`) next to any order.
2. The **Invoice Modal** opens with:
   - Corporate Branding & Address
   - Invoice Reference Number and Issue Date
   - Customer Billed-To Details
   - Itemized Table with quantities, rates, and computed subtotal
   - Applicable VAT / Tax rate
   - Final Total in localized currency (`£` or `₹`)
3. Click the blue **Print Invoice** button to trigger your browser's print dialog (Print to physical printer or **Save as PDF**).

---

## 14. Approval Center (Funds & Stock Transfers)

*(Admin & Supervisor Access)*

The Approval Center (`/approvals`) manages corporate governance requests:

### 14.1. Fund Disbursement Requests
1. **To Request Funds (Supervisor):**
   - Click **Request Funds**.
   - Enter requested amount, operational reason (e.g. "Local warehouse bubble wrap purchase"), and branch.
   - Click **Submit Request**.
2. **To Audit & Decide (Admin):**
   - Review pending requests in the queue.
   - Click **Approve** (green) to authorize funds, or **Reject** (red) with explanatory remarks.

### 14.2. Inter-Branch Inventory Requisitions
1. **To Request Stock Transfer (Supervisor):**
   - Click **Request Inventory**.
   - Select product name, quantity needed, Source Branch (`fromBranch`), and Destination Branch (`toBranch`).
   - Click **Submit Requisition**.
2. **To Authorize (Admin):**
   - Approve the transfer to initiate warehouse logistics dispatch.

---

## 15. CRM: Customer Directory & Lead Pipeline

### 15.1. Customer Directory (`/customers`)
*(Admin & Supervisor)*
- Displays all registered clients, phone numbers, delivery addresses, and order histories.
- Click **+ Add Customer** to register a new commercial buyer.

### 15.2. Lead Pipeline (`/leads`)
*(Admin & Supervisor)*
- Tracks sales leads across acquisition channels: `Website`, `Social Media`, `Referral`, `Cold Call`, `Email`.
- Move leads through pipeline stages:
  - `New` &rarr; `Contacted` &rarr; `Qualified` &rarr; `Converted` (or `Lost`).
- Assign deal values to track projected sales revenue.

---

## 16. Reports & Analytics

*(Admin & Supervisor)*

1. Navigate to **Reports** (`/reports`).
2. Review aggregated financial metrics: Total Sales Incomes, Total Operational Expenses, and Net Gross Margins.
3. Filter reports by date ranges (e.g. Today, This Week, This Month, Custom Date Range).
4. Review branch performance breakdowns and export table views for external bookkeeping audits.

---

## 17. Notifications, Settings & Audit Logs

### 17.1. In-App Notifications (`/notifications`)
- Click the notification bell in the top navbar or select **Notifications** from the menu.
- Notifications alert you to:
  - New orders created
  - Tasks assigned to you
  - Approval decisions on your fund or inventory requests
- Click **Mark all as read** to clear unread badges.

### 17.2. System Settings (`/settings`)
*(Administrator Only)*
- Update Company Legal Name, Official Support Email, Phone, and Corporate Headquarters Address.
- Set the default **VAT / Tax Percentage** (automatically applied to generated customer invoices).
- Set the global primary accounting currency.

### 17.3. Security Audit Logs (`/audit-logs` via Admin Dashboard)
*(Administrator Only)*
- Forensic log capturing system events in real time.
- Records:
  - Event Type (e.g. `Login`, `Check-In`, `Check-Out`, `Order Created`, `Update Settings`)
  - User Email
  - Client IP Address
  - Timestamp & Context Details

---

## 18. Frequently Asked Questions (FAQ) & Troubleshooting

### Q1: Why do some users see £ (GBP) and others see ₹ (INR)?
**Answer:** This is an intentional feature of GlobalDrop ERP's dual-currency architecture. Administrators manage executive corporate finances in British Pounds (`£` GBP), while regional Supervisors and Employees view operations in Indian Rupees (`₹` INR).

### Q2: What timezone does the attendance system follow?
**Answer:** The system follows **UK London Time (`Europe/London`, GMT/BST)**. Regardless of your physical location, your clock-in and clock-out will be recorded against the official UK business calendar. Check-ins after 09:00 AM London time are automatically classified as `Late`.

### Q3: My product checkmarks disappeared when I opened the app on my phone. Why?
**Answer:** The delivery checkmarks are saved locally in your browser's `localStorage` on that specific device. If you switch to another physical device or another browser profile, checkmarks on that new browser will start fresh. On the same device and browser, checkmarks persist permanently across page refreshes.

### Q4: Why did my available product stock decrease automatically?
**Answer:** When an order is created, GlobalDrop ERP automatically decrements the ordered product quantities from your available inventory. If available stock reaches zero, the product status automatically shifts to `Out-of-Stock`.

### Q5: What should I do if the system says "Backend Server Unreachable"?
**Answer:** GlobalDrop ERP features an intelligent offline-fallback mechanism. If the database connection drops temporarily, the frontend switches to local cached mode. To restore full cloud sync:
1. Ensure your network connection is active.
2. Contact your system administrator to ensure the backend Node.js service on port `5000` and MongoDB Atlas connection are operational.

---

*GlobalDrop ERP User Manual — Version 2.0 (November 2026)*

