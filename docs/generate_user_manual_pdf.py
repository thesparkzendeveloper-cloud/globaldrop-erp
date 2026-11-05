import os
import weasyprint

html_content = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>GlobalDrop ERP — User Manual &amp; Operations Guide</title>
<style>
  @page {
    size: A4;
    margin: 20mm 15mm 20mm 15mm;
    @top-right {
      content: "GlobalDrop ERP — User Manual & Operations Guide";
      font-size: 8pt;
      color: #64748b;
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    }
    @bottom-left {
      content: "STANDARD OPERATING PROCEDURE — GLOBALDROP ERP";
      font-size: 8pt;
      color: #94a3b8;
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    }
    @bottom-right {
      content: "Page " counter(page) " of " counter(pages);
      font-size: 8pt;
      color: #64748b;
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    }
  }

  @page:first {
    margin: 0;
    @top-right { content: normal; }
    @bottom-left { content: normal; }
    @bottom-right { content: normal; }
  }

  body {
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    color: #1e293b;
    line-height: 1.55;
    font-size: 9.5pt;
  }

  .cover-page {
    page-break-after: always;
    height: 100vh;
    box-sizing: border-box;
    padding: 70mm 25mm 25mm 25mm;
    background: linear-gradient(145deg, #064e3b 0%, #0f172a 50%, #1e3a8a 100%);
    color: #ffffff;
  }

  .cover-badge {
    display: inline-block;
    background: rgba(255, 255, 255, 0.15);
    border: 1px solid rgba(255, 255, 255, 0.3);
    padding: 4px 14px;
    border-radius: 20px;
    font-size: 9pt;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    margin-bottom: 25px;
  }

  .cover-title {
    font-size: 34pt;
    font-weight: 800;
    line-height: 1.15;
    margin: 0 0 15px 0;
    letter-spacing: -0.5px;
  }

  .cover-subtitle {
    font-size: 15pt;
    font-weight: 300;
    color: #cbd5e1;
    margin: 0 0 50px 0;
    line-height: 1.4;
  }

  .cover-divider {
    width: 80px;
    height: 4px;
    background: #10b981;
    margin-bottom: 40px;
    border-radius: 2px;
  }

  .cover-meta {
    font-size: 10pt;
    color: #94a3b8;
    line-height: 1.8;
  }

  .cover-meta strong {
    color: #ffffff;
  }

  .page-break {
    page-break-after: always;
  }

  h1 {
    font-size: 17pt;
    font-weight: 700;
    color: #0f172a;
    border-bottom: 2px solid #e2e8f0;
    padding-bottom: 5px;
    margin-top: 22pt;
    margin-bottom: 10pt;
  }

  h2 {
    font-size: 12pt;
    font-weight: 600;
    color: #047857;
    margin-top: 14pt;
    margin-bottom: 6pt;
  }

  h3 {
    font-size: 10pt;
    font-weight: 600;
    color: #334155;
    margin-top: 10pt;
    margin-bottom: 4pt;
  }

  p {
    margin-top: 0;
    margin-bottom: 7pt;
    text-align: justify;
  }

  ul, ol {
    margin-top: 0;
    margin-bottom: 7pt;
    padding-left: 18px;
  }

  li {
    margin-bottom: 3pt;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin: 8pt 0 12pt 0;
    font-size: 8.5pt;
  }

  th, td {
    padding: 5pt 7pt;
    border: 1px solid #cbd5e1;
    text-align: left;
  }

  th {
    background-color: #f1f5f9;
    color: #0f172a;
    font-weight: 600;
  }

  tr:nth-child(even) {
    background-color: #f8fafc;
  }

  .step-box {
    background-color: #ffffff;
    border: 1px solid #e2e8f0;
    border-left: 4px solid #059669;
    padding: 8pt 12pt;
    margin: 8pt 0;
    border-radius: 0 6px 6px 0;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  }

  .step-title {
    font-weight: 700;
    color: #065f46;
    font-size: 9.5pt;
    margin-bottom: 3pt;
  }

  .badge {
    display: inline-block;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 7.5pt;
    font-weight: 600;
  }

  .badge-admin {
    background-color: #fee2e2;
    color: #991b1b;
    border: 1px solid #fecaca;
  }

  .badge-supervisor {
    background-color: #fef3c7;
    color: #92400e;
    border: 1px solid #fde68a;
  }

  .badge-employee {
    background-color: #dbeafe;
    color: #1e40af;
    border: 1px solid #bfdbfe;
  }

  .callout-tip {
    background-color: #f0fdf4;
    border-left: 4px solid #16a34a;
    padding: 7pt 10pt;
    margin: 8pt 0;
    border-radius: 0 4px 4px 0;
    font-size: 9pt;
  }

  .callout-info {
    background-color: #eff6ff;
    border-left: 4px solid #2563eb;
    padding: 7pt 10pt;
    margin: 8pt 0;
    border-radius: 0 4px 4px 0;
    font-size: 9pt;
  }

  .callout-warn {
    background-color: #fffbeb;
    border-left: 4px solid #d97706;
    padding: 7pt 10pt;
    margin: 8pt 0;
    border-radius: 0 4px 4px 0;
    font-size: 9pt;
  }

  code {
    font-family: 'Courier New', Courier, monospace;
    background-color: #f1f5f9;
    padding: 1px 4px;
    border-radius: 3px;
    font-size: 8.5pt;
  }

  .toc-item {
    display: flex;
    justify-content: space-between;
    padding: 3.5pt 0;
    border-bottom: 1px dotted #cbd5e1;
    font-size: 9pt;
  }
</style>
</head>
<body>

<!-- COVER PAGE -->
<div class="cover-page">
  <div class="cover-badge">Official Standard Operating Procedure</div>
  <div class="cover-title">GlobalDrop ERP</div>
  <div class="cover-subtitle">Complete End-User Operations Manual &amp; Role-Based System Handbook</div>
  <div class="cover-divider"></div>
  <div class="cover-meta">
    <strong>Document Scope:</strong> End-User Guide &amp; Daily Operational Procedures<br>
    <strong>Audience:</strong> Administrators, Branch Supervisors &amp; Operations Staff<br>
    <strong>System Release:</strong> Version 2.0 (Production Live)<br>
    <strong>Business Timezone:</strong> UK London Time (<code>Europe/London</code>, GMT/BST)<br>
    <strong>Accounting Currencies:</strong> Executive (GBP &pound;) / Regional Operations (INR &#8377;)<br>
    <strong>Release Date:</strong> November 2026
  </div>
</div>

<!-- TABLE OF CONTENTS -->
<h1 style="margin-top: 0;">Table of Contents</h1>
<div style="margin-top: 10pt;">
  <div class="toc-item"><span><strong>1. Introduction &amp; Core Concepts</strong></span><span>Page 2</span></div>
  <div class="toc-item"><span><strong>2. System Access &amp; Authentication Procedures</strong></span><span>Page 3</span></div>
  <div class="toc-item"><span><strong>3. Role-Based Permission Matrix</strong></span><span>Page 4</span></div>
  <div class="toc-item"><span><strong>4. Navigation, Layout &amp; Header Controls</strong></span><span>Page 5</span></div>
  <div class="toc-item"><span><strong>5. Role-Specific Dashboards (Admin, Supervisor, Staff)</strong></span><span>Page 6</span></div>
  <div class="toc-item"><span><strong>6. Branch &amp; International Country Setup</strong></span><span>Page 7</span></div>
  <div class="toc-item"><span><strong>7. Staff Directory &amp; User Account Provisioning</strong></span><span>Page 8</span></div>
  <div class="toc-item"><span><strong>8. Attendance Management (UK London Business Time)</strong></span><span>Page 9</span></div>
  <div class="toc-item"><span><strong>9. Task Allocation &amp; Progress Tracking</strong></span><span>Page 10</span></div>
  <div class="toc-item"><span><strong>10. Warehouse Inventory &amp; Stock Depletion Rules</strong></span><span>Page 11</span></div>
  <div class="toc-item"><span><strong>11. Vendor &amp; Supplier Directory</strong></span><span>Page 12</span></div>
  <div class="toc-item"><span><strong>12. Finance &amp; Dual-Currency Bookkeeping</strong></span><span>Page 13</span></div>
  <div class="toc-item"><span><strong>13. Orders, Delivery Checklist &amp; Invoicing</strong></span><span>Page 14</span></div>
  <div class="toc-item"><span><strong>14. Approval Center (Fund Requests &amp; Stock Transfers)</strong></span><span>Page 16</span></div>
  <div class="toc-item"><span><strong>15. CRM: Customers &amp; Sales Pipeline Leads</strong></span><span>Page 17</span></div>
  <div class="toc-item"><span><strong>16. Reporting, Notifications, Settings &amp; Security Audits</strong></span><span>Page 18</span></div>
  <div class="toc-item"><span><strong>17. Frequently Asked Questions (FAQ) &amp; Troubleshooting</strong></span><span>Page 19</span></div>
</div>

<div class="page-break"></div>

<!-- SECTION 1 -->
<h1 style="margin-top: 0;">1. Introduction &amp; Core Concepts</h1>
<p>
  <strong>GlobalDrop ERP</strong> is a comprehensive, multi-tenant enterprise resource planning portal engineered specifically for international e-commerce, warehousing, and cross-border retail dropshipping networks.
</p>

<h2>1.1. Key Operating Principles</h2>
<ul>
  <li><strong>Timezone Synchronization:</strong> The business calendar is strictly linked to <strong>UK London Time (<code>Europe/London</code>, GMT/BST)</strong>. Punctuality, check-ins, and shift durations are evaluated uniformly against the UK business day.</li>
  <li><strong>Dual-Currency Accounting:</strong> Executive leadership views financial data in British Pounds (<strong>GBP &pound;</strong>), while branch supervisors and operations personnel operate in Indian Rupees (<strong>INR &#8377;</strong>).</li>
  <li><strong>Automated Stock Depletion:</strong> When customer orders are submitted, inventory items are checked for stock availability and quantities are immediately deducted from on-hand warehouse inventory.</li>
  <li><strong>Persistent Fulfillment Checklists:</strong> Warehouse and courier personnel can check off individual order line items as fulfilled. The checkmarks are saved locally in the browser so that refreshing the page or switching tabs does not erase packing progress.</li>
</ul>

<div class="page-break"></div>

<!-- SECTION 2 -->
<h1 style="margin-top: 0;">2. System Access &amp; Authentication Procedures</h1>

<h2>2.1. Accessing the System</h2>
<ol>
  <li>Open Google Chrome, Mozilla Firefox, or Microsoft Edge.</li>
  <li>Navigate to your ERP portal address (e.g. <code>http://localhost:5173</code> or your production domain).</li>
</ol>

<h2>2.2. Logging In</h2>
<div class="step-box">
  <div class="step-title">Step 1: Enter Credentials</div>
  Enter your corporate email address and assigned password. Click the eye icon (<code>👁</code>) to verify typed characters.
</div>
<div class="step-box">
  <div class="step-title">Step 2: Session Persistence</div>
  Check the <strong>Remember me</strong> box if you are on a private, secure computer.
</div>
<div class="step-box">
  <div class="step-title">Step 3: Verification &amp; Dashboard Redirection</div>
  Click <strong>Sign In</strong>. The system authenticates your credentials via a 7-day cryptographic JSON Web Token and opens your role dashboard.
</div>

<div class="callout-info">
  <strong>Built-in Offline Accounts (Testing &amp; Demo Mode):</strong><br>
  - Administrator: <code>veloraelise@gmail.com</code> (Password: <code>password123</code>)<br>
  - Supervisor: <code>shalinishalu121997@gmail.com</code> (Password: <code>password123</code>)
</div>

<h2>2.3. Secure Logout</h2>
<p>
  Always log out when completing your shift by clicking <strong>Logout</strong> at the bottom of the left sidebar or through the profile avatar dropdown. This clears your session token and triggers a secure logout entry in the system audit logs.
</p>

<div class="page-break"></div>

<!-- SECTION 3 -->
<h1 style="margin-top: 0;">3. Role-Based Permission Matrix</h1>
<p>
  Your access permissions determine which screens and actions are available:
</p>

<table>
  <thead>
    <tr>
      <th>Module</th>
      <th><span class="badge badge-admin">Admin</span></th>
      <th><span class="badge badge-supervisor">Supervisor</span></th>
      <th><span class="badge badge-employee">Employee</span></th>
      <th>Functional Summary</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Dashboard</strong></td>
      <td>Full Corporate (GBP &pound;)</td>
      <td>Branch Level (INR &#8377;)</td>
      <td>Personal Work &amp; Attendance</td>
      <td>Role-tailored KPI widgets and graphs</td>
    </tr>
    <tr>
      <td><strong>Branches</strong></td>
      <td>Full Control</td>
      <td>Read Only</td>
      <td>No Access</td>
      <td>Branch facilities and manager directory</td>
    </tr>
    <tr>
      <td><strong>Countries</strong></td>
      <td>Full Control</td>
      <td>No Access</td>
      <td>No Access</td>
      <td>Sovereign operating territory parameters</td>
    </tr>
    <tr>
      <td><strong>Employees</strong></td>
      <td>Full Control</td>
      <td>Branch Staff</td>
      <td>No Access</td>
      <td>Workforce directory and user creation</td>
    </tr>
    <tr>
      <td><strong>Attendance</strong></td>
      <td>Full Audit &amp; Edit</td>
      <td>Branch Audit &amp; Clock-In</td>
      <td>Personal Clock-In/Out</td>
      <td>UK London time attendance tracking</td>
    </tr>
    <tr>
      <td><strong>Tasks</strong></td>
      <td>Assign &amp; Review All</td>
      <td>Assign Branch Tasks</td>
      <td>View &amp; Update My Tasks</td>
      <td>Task assignments and progress sliders</td>
    </tr>
    <tr>
      <td><strong>Inventory</strong></td>
      <td>Full Control</td>
      <td>Branch Stock</td>
      <td>No Access</td>
      <td>Warehouse catalog and automated stock deduction</td>
    </tr>
    <tr>
      <td><strong>Vendors</strong></td>
      <td>Full Control</td>
      <td>No Access</td>
      <td>No Access</td>
      <td>Supplier directory and contact records</td>
    </tr>
    <tr>
      <td><strong>Finance</strong></td>
      <td>Full Control (GBP &pound;)</td>
      <td>Branch Ledger (INR &#8377;)</td>
      <td>No Access</td>
      <td>Income and expense double-entry ledger</td>
    </tr>
    <tr>
      <td><strong>Orders</strong></td>
      <td>Full Management</td>
      <td>Branch Management</td>
      <td>Assigned Orders &amp; Delivery</td>
      <td>Order pipeline, checklists, and invoices</td>
    </tr>
    <tr>
      <td><strong>Approval Center</strong></td>
      <td>Final Approver</td>
      <td>Submitter &amp; Reviewer</td>
      <td>No Access</td>
      <td>Fund requests and stock transfers</td>
    </tr>
    <tr>
      <td><strong>Customers</strong></td>
      <td>Full Control</td>
      <td>Branch Customers</td>
      <td>No Access</td>
      <td>Customer contact directory</td>
    </tr>
    <tr>
      <td><strong>Leads (CRM)</strong></td>
      <td>Full Control</td>
      <td>Branch Oversight</td>
      <td>No Access</td>
      <td>Inbound inquiries and deal pipeline</td>
    </tr>
    <tr>
      <td><strong>Settings / Audit</strong></td>
      <td>Full Control</td>
      <td>No Access</td>
      <td>No Access</td>
      <td>Company profile and security audit logs</td>
    </tr>
  </tbody>
</table>

<div class="page-break"></div>

<!-- SECTION 4 -->
<h1 style="margin-top: 0;">4. Navigation, Layout &amp; Header Controls</h1>

<h2>4.1. The Sidebar Navigation</h2>
<ul>
  <li><strong>Desktop Screens:</strong> The left sidebar remains visible for one-click access between modules. Active sections are highlighted with a blue indicator.</li>
  <li><strong>Mobile &amp; Tablet Screens:</strong> The sidebar slides out on demand by clicking the menu button (<code>☰</code>) in the top-left corner.</li>
  <li><strong>Role Filtering:</strong> Links for modules outside your security tier are automatically omitted from view.</li>
</ul>

<h2>4.2. Top Navigation Bar Features</h2>
<ul>
  <li><strong>Global Search:</strong> Instantly filters through orders, SKU products, and staff records.</li>
  <li><strong>Live UK Clock Pill:</strong> Displays the live clock synchronized to <strong>UK London Time (GMT/BST)</strong>.</li>
  <li><strong>Notification Bell:</strong> Displays an unread badge counter for alerts regarding assigned tasks, order status changes, and fund approvals.</li>
  <li><strong>Profile Avatar Menu:</strong> Displays your active user name, role badge, and the sign-out trigger.</li>
</ul>

<div class="page-break"></div>

<!-- SECTION 5 -->
<h1 style="margin-top: 0;">5. Role-Specific Dashboards</h1>

<h2>5.1. Admin Executive Dashboard</h2>
<ul>
  <li><strong>Accounting Currency:</strong> Displayed in British Pounds (<strong>GBP &pound;</strong>).</li>
  <li><strong>Executive KPI Cards:</strong> Real-time counts of Total Countries, Active Branches, Total Personnel, Total Orders, Total Inventory Items, and Pending Authorizations.</li>
  <li><strong>Financial Balance Widget:</strong> Live ledger reconciliation displaying Allocated Budget, Operating Expenses, Total Incomes, and Net Operating Balance.</li>
  <li><strong>Revenue Trajectory Graph:</strong> Graphical month-over-month sales performance comparison.</li>
</ul>

<h2>5.2. Supervisor Branch Dashboard</h2>
<ul>
  <li><strong>Accounting Currency:</strong> Displayed in Indian Rupees (<strong>INR &#8377;</strong>).</li>
  <li><strong>Branch Control Metrics:</strong> Available Branch Operating Budget, Pending Expense Requisitions, Stock Requisitions, and Open Branch Tasks.</li>
  <li><strong>Efficiency Scorecard:</strong> Branch task completion and order fulfillment percentage.</li>
</ul>

<h2>5.3. Employee Personal Dashboard</h2>
<ul>
  <li><strong>Daily Work Card:</strong> Shows today's clock-in status, clock-in timestamp (UK Time), and total elapsed shift duration.</li>
  <li><strong>One-Click Clock-In / Out:</strong> Direct button to clock in upon arrival or clock out upon shift completion.</li>
  <li><strong>Active Tasks:</strong> Personal queue of tasks with completion progress sliders.</li>
</ul>

<div class="page-break"></div>

<!-- SECTION 6 -->
<h1 style="margin-top: 0;">6. Branch &amp; International Country Setup</h1>

<h2>6.1. Managing Corporate Branches</h2>
<div class="step-box">
  <div class="step-title">To Register a New Branch (Admin Only):</div>
  1. Navigate to <strong>Branches</strong> from the sidebar.<br>
  2. Click <strong>+ Add Branch</strong>.<br>
  3. Enter Branch Title (e.g. <code>UK Distribution Hub</code>, <code>India Branch</code>).<br>
  4. Specify Country, Physical Street Address, Corporate Telephone, Email, and designated Branch Director.<br>
  5. Click <strong>Save Branch</strong>.
</div>

<h2>6.2. Setting Up Operating Countries</h2>
<p>
  In the <strong>Countries</strong> module, Administrators establish regional definitions:
</p>
<ul>
  <li><strong>Country Name &amp; Code:</strong> Official name and ISO Alpha code (e.g. <code>United Kingdom / GB</code>, <code>India / IN</code>).</li>
  <li><strong>Regional Currency:</strong> Official currency code (e.g. <code>GBP</code>, <code>INR</code>).</li>
  <li><strong>Timezone:</strong> Standard IANA timezone string (e.g. <code>Europe/London</code>).</li>
</ul>

<div class="page-break"></div>

<!-- SECTION 7 -->
<h1 style="margin-top: 0;">7. Staff Directory &amp; User Account Provisioning</h1>

<h2>7.1. Onboarding a New Employee</h2>
<div class="step-box">
  <div class="step-title">Step-by-Step Onboarding (Admin &amp; Supervisor):</div>
  1. Open <strong>Employees</strong> from the sidebar menu.<br>
  2. Click the <strong>+ Add Employee</strong> button.<br>
  3. Enter the employee's Full Name, Corporate Email (used as the login username), and Mobile Phone.<br>
  4. Select the security Role: <code>Admin</code>, <code>Supervisor</code>, or <code>Employee</code>.<br>
  5. Assign their physical Branch and Country location.<br>
  6. Set their Onboarding Date.<br>
  7. Enter their initial login password.<br>
  8. Click <strong>Save Employee</strong>.
</div>

<div class="callout-tip">
  <strong>Automatic Password Encryption:</strong> Passwords are encrypted before storage in the database using 10 rounds of salted bcrypt hashing. Plaintext passwords are never saved in the database.
</div>

<h2>7.2. Deactivating a Staff Member</h2>
<p>
  If a staff member departs or is placed on leave, click the edit icon next to their profile, toggle their status to <strong>Inactive</strong>, and save. Inactive accounts are immediately prevented from logging into the portal.
</p>

<div class="page-break"></div>

<!-- SECTION 8 -->
<h1 style="margin-top: 0;">8. Attendance Management (UK London Business Time)</h1>
<p>
  All staff attendance is synchronized to the <strong>United Kingdom (London / GMT-BST)</strong> time standard, regardless of where staff are physically based.
</p>

<h2>8.1. Employee Daily Clock-In</h2>
<div class="step-box">
  <div class="step-title">Daily Clock-In Procedure:</div>
  1. Open <strong>Attendance</strong> or view the Clock-In card on the Employee Dashboard.<br>
  2. Review the live <strong>UK (GMT/BST)</strong> clock badge in the top bar.<br>
  3. Click the blue <strong>Check-In</strong> button.<br>
  4. <strong>Punctuality Rule:</strong>
  <ul>
    <li>Clocking in <strong>at or before 09:00 AM UK Time</strong> registers as <strong>Present</strong> (Green badge).</li>
    <li>Clocking in <strong>after 09:00 AM UK Time</strong> automatically registers as <strong>Late</strong> (Yellow badge).</li>
  </ul>
</div>

<h2>8.2. Daily Clock-Out &amp; Hours Calculation</h2>
<div class="step-box">
  <div class="step-title">Shift Completion Procedure:</div>
  1. At the conclusion of your shift, return to <strong>Attendance</strong>.<br>
  2. Click <strong>Check-Out</strong>.<br>
  3. The system captures your UK departure time and automatically calculates your exact shift duration (e.g. <code>8h 15m</code>), displaying it in the <strong>Hours</strong> column.
</div>

<h2>8.3. Manual Supervisor Entries</h2>
<p>
  Supervisors and Administrators can record attendance on behalf of employees by clicking the manual Check-In/Check-Out buttons, selecting the staff member from the dropdown, choosing the date, and confirming.
</p>

<div class="page-break"></div>

<!-- SECTION 9 -->
<h1 style="margin-top: 0;">9. Task Allocation &amp; Progress Tracking</h1>

<h2>9.1. Assigning Tasks</h2>
<div class="step-box">
  <div class="step-title">Creating a Work Assignment:</div>
  1. Navigate to <strong>Tasks</strong>.<br>
  2. Click <strong>+ Create Task</strong>.<br>
  3. Specify Title, detailed assignment instructions, target Due Date, and Priority tier (<code>Low</code>, <code>Medium</code>, <code>High</code>, <code>Critical</code>).<br>
  4. Choose the assignee from active staff.<br>
  5. Click <strong>Assign Task</strong>. The assigned employee receives an immediate notification.
</div>

<h2>9.2. Updating Progress &amp; Completion</h2>
<p>
  Assigned staff can open any task and adjust the <strong>Progress Slider</strong> from 0% to 100%. Moving progress to 100% updates the task status to <strong>Completed</strong>, notifying the assigning supervisor.
</p>

<div class="page-break"></div>

<!-- SECTION 10 -->
<h1 style="margin-top: 0;">10. Warehouse Inventory &amp; Stock Depletion Rules</h1>

<h2>10.1. Product Health Indicators</h2>
<ul>
  <li>🟢 <strong>Available:</strong> Healthy inventory levels (&gt; 5 units on hand).</li>
  <li>🟡 <strong>Low Stock:</strong> Critically low inventory (1 to 5 units). Requires reordering.</li>
  <li>🔴 <strong>Out of Stock:</strong> 0 units on hand. Order creation for this item is blocked.</li>
</ul>

<h2>10.2. Adding a New Inventory Item</h2>
<div class="step-box">
  <div class="step-title">Adding Product Items:</div>
  1. Navigate to <strong>Inventory</strong> and click <strong>+ Add Product</strong>.<br>
  2. Enter SKU (e.g. <code>SKU-BMB-001</code>), Product Name, Category, Acquisition Cost Price, and Selling Retail Price.<br>
  3. Specify on-hand Available Quantity and the designated Warehouse Branch.<br>
  4. Click <strong>Save Product</strong>.
</div>

<h2>10.3. Automated Stock Depletion Mechanism</h2>
<div class="callout-warn">
  <strong>Automated Stock Decrement:</strong> Whenever an order containing inventory items is submitted, the backend verifies stock availability and immediately deducts the ordered unit counts from <code>availableQuantity</code>.
</div>

<div class="page-break"></div>

<!-- SECTION 11 -->
<h1 style="margin-top: 0;">11. Vendor &amp; Supplier Directory</h1>
<p>
  Available to Administrators under <strong>Vendors</strong>:
</p>
<ol>
  <li>Click <strong>+ Add Vendor</strong>.</li>
  <li>Enter Supplier Corporate Name, Procurement Email, Telephone, Country of Operation, and Supplied Product SKUs.</li>
  <li>Assign an initial Supplier Performance Rating (1 to 5 Stars).</li>
  <li>Click <strong>Save Vendor</strong>.</li>
</ol>
<p>
  Use this directory to quickly retrieve merchant contact channels for warehouse restocks.
</p>

<div class="page-break"></div>

<!-- SECTION 12 -->
<h1 style="margin-top: 0;">12. Finance &amp; Dual-Currency Bookkeeping</h1>

<h2>12.1. Dual-Currency Display</h2>
<ul>
  <li><strong>Executive Mode (Admin):</strong> Financial balances and ledgers are displayed in British Pounds (<strong>GBP &pound;</strong>).</li>
  <li><strong>Regional Mode (Supervisor):</strong> Financial entries are displayed in Indian Rupees (<strong>INR &#8377;</strong>).</li>
</ul>

<h2>12.2. Recording Incomes &amp; Expenses</h2>
<div class="step-box">
  <div class="step-title">Posting a Transaction:</div>
  1. Open <strong>Finance</strong> from the sidebar.<br>
  2. Click <strong>+ Add Transaction</strong>.<br>
  3. Select Entry Type:
     <ul>
       <li><strong>Income:</strong> Customer payments, order deposits, wholesale receivables.</li>
       <li><strong>Expense:</strong> Courier postage, packing materials, utilities, staff wages.</li>
     </ul>
  4. Enter Amount, Account Category, Booking Date, Branch, and descriptive remarks.<br>
  5. Click <strong>Record Transaction</strong>. The dashboard immediately updates net profit margins.
</div>

<div class="page-break"></div>

<!-- SECTION 13 -->
<h1 style="margin-top: 0;">13. Orders, Delivery Checklist &amp; Invoicing</h1>

<h2>13.1. Order Processing Pipeline</h2>
<p>
  Orders progress through four milestone stages:
</p>
<ul>
  <li><code>Created</code> (Blue): Order logged and awaiting warehouse packaging.</li>
  <li><code>Packed</code> (Yellow): Line items packed and boxed.</li>
  <li><code>Dispatched</code> (Purple): Consignment handed over to courier.</li>
  <li><code>Delivered</code> (Green): Order successfully received by the client.</li>
</ul>

<h2>13.2. Order Fulfillment Checklist (Item-by-Item Tracking)</h2>
<div class="step-box">
  <div class="step-title">Checking Off Delivered Products:</div>
  1. Open <strong>Orders</strong> and click any order row to open its details modal.<br>
  2. Locate the <strong>Order Products &amp; Quantity</strong> section.<br>
  3. As items are prepared, packed, or delivered, click the checkbox next to each product.<br>
  4. A green background and check mark confirm fulfillment.
</div>

<div class="callout-tip">
  <strong>Persistence Guarantee:</strong> Item checkmarks are saved locally in browser storage (<code>localStorage</code>). Refreshing the page, closing the modal, or navigating to another section will not erase your checked items.
</div>

<h2>13.3. Customer Invoicing (<code>InvoiceModal</code>)</h2>
<ol>
  <li>In the Orders table, click the document invoice icon (<code>📄</code>) on any order.</li>
  <li>The formatted invoice displays company details, customer address, itemized charges, VAT rate, and net total.</li>
  <li>Click <strong>Print Invoice</strong> to trigger your browser's print dialog (physical print or <strong>Save as PDF</strong>).</li>
</ol>

<div class="page-break"></div>

<!-- SECTION 14 -->
<h1 style="margin-top: 0;">14. Approval Center (Fund Requests &amp; Stock Transfers)</h1>

<h2>14.1. Fund Disbursement Requests</h2>
<div class="step-box">
  <div class="step-title">Workflow:</div>
  1. <strong>Supervisor Submission:</strong> Click <strong>Request Funds</strong>, enter amount, business purpose, and branch. Click Submit.<br>
  2. <strong>Admin Audit:</strong> Administrators review the pending queue and click <strong>Approve</strong> or <strong>Reject</strong> with comments.
</div>

<h2>14.2. Inter-Branch Stock Transfers</h2>
<div class="step-box">
  <div class="step-title">Workflow:</div>
  1. <strong>Supervisor Requisition:</strong> Click <strong>Request Inventory</strong>, select product, quantity, Source Branch, and Destination Branch.<br>
  2. <strong>Admin Authorization:</strong> Admin approves the transfer to initiate warehouse logistics movement.
</div>

<div class="page-break"></div>

<!-- SECTION 15 -->
<h1 style="margin-top: 0;">15. CRM: Customers &amp; Sales Pipeline Leads</h1>

<h2>15.1. Customer Directory (<code>/customers</code>)</h2>
<p>
  Maintain client profiles including contact phone numbers, delivery addresses, and associated servicing branches.
</p>

<h2>15.2. Lead Generation Pipeline (<code>/leads</code>)</h2>
<ol>
  <li>Click <strong>+ Add Lead</strong>.</li>
  <li>Record lead source (Website, Social Media, Referral, Cold Call, Email), prospective deal value, and assign a sales representative.</li>
  <li>Update deal stages: <code>New</code> &rarr; <code>Contacted</code> &rarr; <code>Qualified</code> &rarr; <code>Converted</code> (or <code>Lost</code>).</li>
</ol>

<div class="page-break"></div>

<!-- SECTION 16 -->
<h1 style="margin-top: 0;">16. Reporting, Notifications, Settings &amp; Security Audits</h1>

<h2>16.1. Financial Reports (<code>/reports</code>)</h2>
<p>
  Filter transactions by custom calendar ranges to analyze gross revenue, total operational expenses, and net profit margins.
</p>

<h2>16.2. In-App Notifications (<code>/notifications</code>)</h2>
<p>
  Click the notification bell icon to review alerts regarding new orders, task assignments, and approval decisions. Click <strong>Mark all as read</strong> to clear badges.
</p>

<h2>16.3. System Settings (<code>/settings</code>)</h2>
<p>
  Administrators can update corporate address details, default invoice tax percentages, and base accounting currencies.
</p>

<h2>16.4. Security Audit Logs (<code>/audit-logs</code>)</h2>
<p>
  Administrators can inspect forensic records of every system operation (user logins, check-ins, order updates) with timestamps and origin IP addresses.
</p>

<div class="page-break"></div>

<!-- SECTION 17 -->
<h1 style="margin-top: 0;">17. Frequently Asked Questions (FAQ) &amp; Troubleshooting</h1>

<h2>Q1: Why do some users see &pound; (GBP) while others see &#8377; (INR)?</h2>
<p>
  <strong>Answer:</strong> This is an intentional feature of GlobalDrop ERP's dual-currency architecture. Administrators manage executive corporate finances in British Pounds (<code>&pound;</code> GBP), while regional Supervisors and Employees view operations in Indian Rupees (<code>&#8377;</code> INR).
</p>

<h2>Q2: What timezone does the attendance system follow?</h2>
<p>
  <strong>Answer:</strong> The system follows <strong>UK London Time (<code>Europe/London</code>, GMT/BST)</strong>. Regardless of your physical location, your clock-in and clock-out will be recorded against the official UK business calendar. Check-ins after 09:00 AM London time are automatically classified as <code>Late</code>.
</p>

<h2>Q3: Why did my product stock decrease automatically?</h2>
<p>
  <strong>Answer:</strong> When an order is created, GlobalDrop ERP automatically decrements the ordered product quantities from your available inventory. If available stock reaches zero, the product status automatically shifts to <code>Out of Stock</code>.
</p>

<h2>Q4: Are product delivery checkmarks saved permanently?</h2>
<p>
  <strong>Answer:</strong> Yes. Product checkmarks are saved in your browser's local storage (<code>localStorage</code>). They persist across page refreshes, tab changes, and modal reopens on that browser.
</p>

<div class="callout-tip" style="margin-top: 25pt;">
  <strong>Support &amp; Technical Assistance:</strong> For corporate technical support, user account password resets, or system questions, contact your System Administrator.
</div>

</body>
</html>
"""

output_pdf = "docs/GlobalDrop_ERP_User_Manual.pdf"
print("Compiling User Manual PDF with WeasyPrint...")
weasyprint.HTML(string=html_content).write_pdf(output_pdf)
print(f"Successfully generated: {output_pdf}")

