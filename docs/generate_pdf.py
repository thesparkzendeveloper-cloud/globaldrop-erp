import os
import weasyprint

html_content = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>GlobalDrop ERP — As-Built Technical Documentation</title>
<style>
  @page {
    size: A4;
    margin: 20mm 15mm 20mm 15mm;
    @top-right {
      content: "GlobalDrop ERP — As-Built Technical Documentation";
      font-size: 8pt;
      color: #64748b;
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    }
    @bottom-left {
      content: "CONFIDENTIAL & PROPRIETARY — PREPARED FOR CLIENT";
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
    background: linear-gradient(145deg, #0f172a 0%, #1e293b 50%, #2563eb 100%);
    color: #ffffff;
  }

  .cover-badge {
    display: inline-block;
    background: rgba(255, 255, 255, 0.15);
    border: 1px solid rgba(255, 255, 255, 0.3);
    padding: 4px 12px;
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
    background: #38bdf8;
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
    font-size: 18pt;
    font-weight: 700;
    color: #0f172a;
    border-bottom: 2px solid #e2e8f0;
    padding-bottom: 6px;
    margin-top: 24pt;
    margin-bottom: 12pt;
  }

  h2 {
    font-size: 13pt;
    font-weight: 600;
    color: #1e3a8a;
    margin-top: 16pt;
    margin-bottom: 8pt;
  }

  h3 {
    font-size: 10.5pt;
    font-weight: 600;
    color: #334155;
    margin-top: 12pt;
    margin-bottom: 6pt;
  }

  p {
    margin-top: 0;
    margin-bottom: 8pt;
    text-align: justify;
  }

  ul, ol {
    margin-top: 0;
    margin-bottom: 8pt;
    padding-left: 18px;
  }

  li {
    margin-bottom: 3pt;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin: 10pt 0 14pt 0;
    font-size: 8.5pt;
  }

  th, td {
    padding: 6pt 8pt;
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

  .badge {
    display: inline-block;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 7.5pt;
    font-weight: 600;
  }

  .badge-verified {
    background-color: #ecfdf5;
    color: #047857;
    border: 1px solid #a7f3d0;
  }

  .badge-confirm {
    background-color: #fffbeb;
    color: #b45309;
    border: 1px solid #fde68a;
  }

  .callout {
    background-color: #f0fdf4;
    border-left: 4px solid #16a34a;
    padding: 8pt 12pt;
    margin: 10pt 0;
    border-radius: 0 4px 4px 0;
  }

  .callout-info {
    background-color: #eff6ff;
    border-left: 4px solid #2563eb;
    padding: 8pt 12pt;
    margin: 10pt 0;
    border-radius: 0 4px 4px 0;
  }

  .callout-title {
    font-weight: 700;
    font-size: 9pt;
    margin-bottom: 2pt;
  }

  code {
    font-family: 'Courier New', Courier, monospace;
    background-color: #f1f5f9;
    padding: 1px 4px;
    border-radius: 3px;
    font-size: 8.5pt;
    color: #0f172a;
  }

  pre {
    background-color: #0f172a;
    color: #f8fafc;
    padding: 10pt;
    border-radius: 6px;
    font-family: 'Courier New', Courier, monospace;
    font-size: 8pt;
    line-height: 1.4;
    overflow-x: hidden;
    margin: 8pt 0 12pt 0;
  }

  .toc-item {
    display: flex;
    justify-content: space-between;
    padding: 4pt 0;
    border-bottom: 1px dotted #cbd5e1;
    font-size: 9.5pt;
  }
</style>
</head>
<body>

<!-- COVER PAGE -->
<div class="cover-page">
  <div class="cover-badge">As-Built Engineering Deliverable</div>
  <div class="cover-title">GlobalDrop ERP</div>
  <div class="cover-subtitle">Complete As-Built Technical Architecture, System Specifications &amp; Operational Documentation</div>
  <div class="cover-divider"></div>
  <div class="cover-meta">
    <strong>Author / Lead Architect:</strong> Senior Software Engineering Team<br>
    <strong>Project Release Version:</strong> 2.0 (Production Verified)<br>
    <strong>Document Date:</strong> November 2026<br>
    <strong>Operational Database:</strong> MongoDB Atlas (Cluster: <code>sparkzen.mongodb.net</code> / DB: <code>globalERP</code>)<br>
    <strong>Deployment Status:</strong> Live &amp; Operational
  </div>
</div>

<!-- TABLE OF CONTENTS -->
<h1 style="margin-top: 0;">Table of Contents</h1>
<div style="margin-top: 15pt;">
  <div class="toc-item"><span><strong>1. Executive Project Overview</strong></span><span>Page 2</span></div>
  <div class="toc-item"><span><strong>2. Technology Stack &amp; Dependencies</strong></span><span>Page 3</span></div>
  <div class="toc-item"><span><strong>3. Database Architecture &amp; Live Telemetry</strong></span><span>Page 4</span></div>
  <div class="toc-item"><span><strong>4. Database Collection Schemas &amp; Field Dictionaries</strong></span><span>Page 5</span></div>
  <div class="toc-item"><span><strong>5. Backend Architecture &amp; REST API Endpoints</strong></span><span>Page 7</span></div>
  <div class="toc-item"><span><strong>6. Specialized Business Logic Implementations</strong></span><span>Page 9</span></div>
  <div class="toc-item"><span><strong>7. Frontend Architecture, Pages &amp; UI State</strong></span><span>Page 10</span></div>
  <div class="toc-item"><span><strong>8. Hosting, Cloud Infrastructure &amp; Sizing</strong></span><span>Page 11</span></div>
  <div class="toc-item"><span><strong>9. Financial Ledger &amp; Cost Analysis</strong></span><span>Page 12</span></div>
  <div class="toc-item"><span><strong>10. Security Architecture &amp; Audit Trail</strong></span><span>Page 13</span></div>
  <div class="toc-item"><span><strong>11. Operational Boundaries &amp; Existing Limitations</strong></span><span>Page 14</span></div>
  <div class="toc-item"><span><strong>12. Project Handover &amp; Runbook Instructions</strong></span><span>Page 15</span></div>
</div>

<div class="page-break"></div>

<!-- SECTION 1 -->
<h1 style="margin-top: 0;">1. Executive Project Overview</h1>
<p>
  <strong>GlobalDrop ERP</strong> is a modern, responsive Enterprise Resource Planning (ERP) platform developed to coordinate global supply chain, warehousing, order fulfillment, and multi-branch organizational logistics for international e-commerce and retail dropshipping operations.
</p>

<h2>1.1. Core Architectural Objectives</h2>
<ul>
  <li><strong>Multi-Branch Governance:</strong> Seamless administration of distributed branch facilities with location-scoped operational oversight.</li>
  <li><strong>UK Business Calendar Attendance:</strong> Timezone-synchronized employee clock-in and clock-out operations anchored to <strong>UK London Time (<code>Europe/London</code>, GMT/BST)</strong>, eliminating timezone drift for global workforces.</li>
  <li><strong>Automated Stock Depletion:</strong> Order creation hooks that directly decrement available SKU inventories in real time.</li>
  <li><strong>Dual-Currency Financial Architecture:</strong> Executive accounting formatted in British Pounds (<strong>GBP &pound;</strong>) for administrative leadership, paired with localized Indian Rupee (<strong>INR &#8377;</strong>) ledgers for operational branch managers and supervisors.</li>
  <li><strong>Session-Persistent Order Checklists:</strong> Real-time product line-item check-off mechanisms enabling warehouse personnel to track physical item packing and delivery progress without losing status across browser refreshes.</li>
</ul>

<h2>1.2. Implemented Functional Modules (16 Total)</h2>
<table>
  <thead>
    <tr>
      <th style="width: 25%;">Module Name</th>
      <th style="width: 45%;">Implemented Scope &amp; Capabilities</th>
      <th style="width: 30%;">Access Control</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Authentication &amp; Session</strong></td>
      <td>JWT token signing (7-day lifespan), bcrypt password hashing, session recovery via <code>/api/auth/me</code>, and offline fallback auth.</td>
      <td>Public login / Authenticated roles</td>
    </tr>
    <tr>
      <td><strong>Role-Specific Dashboards</strong></td>
      <td>Executive, branch supervisor, and employee personal dashboards displaying Recharts analytics, active tasks, and KPI metrics.</td>
      <td>Admin, Supervisor, Employee</td>
    </tr>
    <tr>
      <td><strong>Branch Management</strong></td>
      <td>Branch facility directory tracking addresses, telephone contacts, designated branch supervisors, and operational states.</td>
      <td>Admin (Write) / Staff (Read)</td>
    </tr>
    <tr>
      <td><strong>Country Management</strong></td>
      <td>International operating zone registry capturing ISO codes, standard local currencies, and official timezones.</td>
      <td>Admin Only</td>
    </tr>
    <tr>
      <td><strong>Staff Directory (Employees)</strong></td>
      <td>Workforce directory managing roles, branches, contact records, onboarding dates, and secure credential provisioning.</td>
      <td>Admin, Supervisor</td>
    </tr>
    <tr>
      <td><strong>UK Time Attendance</strong></td>
      <td>Daily clock-in/out tracking based on UK London time, automatic punctuality classification (late post 09:00 AM), and duration calculation.</td>
      <td>All Authenticated Staff</td>
    </tr>
    <tr>
      <td><strong>Task Allocation</strong></td>
      <td>Task delegation engine with priority ratings, assignment targets, progress completion meters (0-100%), and deadlines.</td>
      <td>All Authenticated Staff</td>
    </tr>
    <tr>
      <td><strong>Inventory Management</strong></td>
      <td>Catalog of warehouse goods with SKUs, cost prices, retail prices, on-hand available stock, and order decrement triggers.</td>
      <td>Admin, Supervisor</td>
    </tr>
    <tr>
      <td><strong>Vendor Directory</strong></td>
      <td>Third-party merchant directory tracking procurement contacts, supplied item catalogs, and performance ratings.</td>
      <td>Admin Only</td>
    </tr>
    <tr>
      <td><strong>Finance Ledger</strong></td>
      <td>Double-entry revenue and expenditure tracker with category allocations and dual-currency formatting.</td>
      <td>Admin (GBP), Supervisor (INR)</td>
    </tr>
    <tr>
      <td><strong>Order Processing &amp; Invoicing</strong></td>
      <td>Sales order pipeline (created &rarr; packed &rarr; dispatched &rarr; delivered) with line-item checklist and printable invoice modal.</td>
      <td>Admin, Supervisor, Employee</td>
    </tr>
    <tr>
      <td><strong>Approval Center</strong></td>
      <td>Two-tier authorization gateway reviewing branch fund expenditure requests and inter-branch inventory requisitions.</td>
      <td>Admin (Approver), Supervisor (Requester)</td>
    </tr>
    <tr>
      <td><strong>Customer Directory (CRM)</strong></td>
      <td>Client database recording customer profiles, shipping destinations, and historical order interactions.</td>
      <td>Admin, Supervisor</td>
    </tr>
    <tr>
      <td><strong>Lead Pipeline (CRM)</strong></td>
      <td>Sales inquiry tracking across acquisition channels (website, referral, cold-call, social), deal valuations, and stages.</td>
      <td>Admin, Supervisor</td>
    </tr>
    <tr>
      <td><strong>System Notifications</strong></td>
      <td>In-app broadcast and direct notification dispatch alerting personnel to order updates, approvals, and tasks.</td>
      <td>All Authenticated Staff</td>
    </tr>
    <tr>
      <td><strong>Settings &amp; Audit Logs</strong></td>
      <td>Master company profile configuration, base VAT/tax rates, and immutable forensic security audit logs.</td>
      <td>Admin Only</td>
    </tr>
  </tbody>
</table>

<div class="page-break"></div>

<!-- SECTION 2 -->
<h1 style="margin-top: 0;">2. Technology Stack &amp; Dependencies</h1>
<p>
  The architecture follows a decoupled Single Page Application (SPA) and REST API service paradigm. The table below lists all runtime frameworks and production libraries verified in the codebase:
</p>

<table>
  <thead>
    <tr>
      <th style="width: 25%;">Layer / Component</th>
      <th style="width: 25%;">Technology / Framework</th>
      <th style="width: 15%;">Exact Version</th>
      <th style="width: 35%;">Purpose in Project</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Frontend UI Framework</strong></td>
      <td>React</td>
      <td>18.3.1</td>
      <td>Component rendering &amp; virtual DOM architecture</td>
    </tr>
    <tr>
      <td><strong>Programming Language (Client)</strong></td>
      <td>TypeScript</td>
      <td>5.5.3</td>
      <td>Static typing, interface definitions &amp; compile checks</td>
    </tr>
    <tr>
      <td><strong>Bundler &amp; Dev Server</strong></td>
      <td>Vite</td>
      <td>5.4.8</td>
      <td>ESBuild compilation, asset bundling &amp; HMR</td>
    </tr>
    <tr>
      <td><strong>Styling &amp; Design System</strong></td>
      <td>Tailwind CSS</td>
      <td>3.4.1</td>
      <td>Utility-first responsive styling and design system</td>
    </tr>
    <tr>
      <td><strong>Client-Side Routing</strong></td>
      <td>React Router DOM</td>
      <td>6.30.4</td>
      <td>Declarative client-side routing and navigation guards</td>
    </tr>
    <tr>
      <td><strong>Data Visualizations</strong></td>
      <td>Recharts</td>
      <td>2.15.4</td>
      <td>Interactive executive charts and KPI graphs</td>
    </tr>
    <tr>
      <td><strong>Iconography</strong></td>
      <td>Lucide React</td>
      <td>0.344.0</td>
      <td>Vector interface icons</td>
    </tr>
    <tr>
      <td><strong>Toast Notifications</strong></td>
      <td>React Hot Toast</td>
      <td>2.6.0</td>
      <td>User feedback toast notifications</td>
    </tr>
    <tr>
      <td><strong>Backend Runtime</strong></td>
      <td>Node.js</td>
      <td>v22.22.2 (LTS)</td>
      <td>Asynchronous non-blocking server environment</td>
    </tr>
    <tr>
      <td><strong>Backend REST Framework</strong></td>
      <td>Express</td>
      <td>4.19.2</td>
      <td>HTTP routing, controller middleware, and REST API</td>
    </tr>
    <tr>
      <td><strong>Database ODM</strong></td>
      <td>Mongoose</td>
      <td>8.3.1</td>
      <td>Schema enforcement, validations, and MongoDB driver</td>
    </tr>
    <tr>
      <td><strong>Token Security</strong></td>
      <td>jsonwebtoken</td>
      <td>9.0.2</td>
      <td>HMAC-SHA256 JWT generation and validation</td>
    </tr>
    <tr>
      <td><strong>Password Hashing</strong></td>
      <td>bcryptjs</td>
      <td>2.4.3</td>
      <td>Salted cryptographic password hashing</td>
    </tr>
    <tr>
      <td><strong>Cross-Origin Security</strong></td>
      <td>cors</td>
      <td>2.8.5</td>
      <td>CORS header management for API requests</td>
    </tr>
    <tr>
      <td><strong>Configuration Manager</strong></td>
      <td>dotenv</td>
      <td>16.4.5</td>
      <td>Environment variable injection from <code>.env</code></td>
    </tr>
    <tr>
      <td><strong>Database Engine</strong></td>
      <td>MongoDB Atlas Cloud</td>
      <td>Atlas Managed</td>
      <td>Cloud-hosted document database cluster</td>
    </tr>
  </tbody>
</table>

<div class="callout-info">
  <div class="callout-title">Architectural Purity Note:</div>
  Although <code>@supabase/supabase-js</code> is listed in <code>package.json</code>, all operational data persistence, business logic, authentication, and order workflows are handled directly by the internal Node.js Express and MongoDB Atlas backend.
</div>

<div class="page-break"></div>

<!-- SECTION 3 -->
<h1 style="margin-top: 0;">3. Database Architecture &amp; Live Telemetry</h1>

<h2>3.1. Live Production Telemetry</h2>
<p>
  Database metrics were verified through direct read-only administrative inspection of the live MongoDB instance on the <code>sparkzen.mongodb.net</code> cluster. The results confirm an active, operational database state:
</p>

<table>
  <thead>
    <tr>
      <th>Telemetry Metric</th>
      <th>Live Recorded Value</th>
      <th>System Interpretation</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Database Identifier</strong></td>
      <td><code>globalERP</code></td>
      <td>Target production database instance</td>
    </tr>
    <tr>
      <td><strong>Total Collections</strong></td>
      <td><strong>16 Collections</strong></td>
      <td>All domain schemas instantiated</td>
    </tr>
    <tr>
      <td><strong>Total Records / Objects</strong></td>
      <td><strong>268 Documents</strong></td>
      <td>Total stored records across all collections</td>
    </tr>
    <tr>
      <td><strong>Uncompressed Data Size</strong></td>
      <td><strong>87,684 bytes</strong> (~85.63 KB)</td>
      <td>Raw BSON document data footprint</td>
    </tr>
    <tr>
      <td><strong>Disk Storage Allocated</strong></td>
      <td><strong>577,536 bytes</strong> (~564.00 KB)</td>
      <td>WiredTiger storage allocation on disk</td>
    </tr>
    <tr>
      <td><strong>Average Document Size</strong></td>
      <td><strong>327.18 bytes</strong></td>
      <td>Lightweight document payload size</td>
    </tr>
    <tr>
      <td><strong>Configured B-Tree Indexes</strong></td>
      <td><strong>22 Indexes</strong></td>
      <td>Primary key and unique lookup indexes</td>
    </tr>
    <tr>
      <td><strong>Index Storage Allocation</strong></td>
      <td><strong>790,528 bytes</strong> (~772.00 KB)</td>
      <td>RAM and disk allocated for index trees</td>
    </tr>
  </tbody>
</table>

<h2>3.2. Live Collection Distribution</h2>
<table>
  <thead>
    <tr>
      <th>Collection</th>
      <th>Record Count</th>
      <th>Primary Role in System</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>auditlogs</code></td>
      <td><strong>198 records</strong></td>
      <td>Chronological log of logins, logouts, order creations, and check-ins</td>
    </tr>
    <tr>
      <td><code>notifications</code></td>
      <td><strong>21 records</strong></td>
      <td>Operational notification events dispatched across users and roles</td>
    </tr>
    <tr>
      <td><code>customers</code></td>
      <td><strong>12 records</strong></td>
      <td>Registered client and corporate buyer records</td>
    </tr>
    <tr>
      <td><code>orders</code></td>
      <td><strong>11 records</strong></td>
      <td>Customer orders including line items, delivery statuses, and amounts</td>
    </tr>
    <tr>
      <td><code>products</code></td>
      <td><strong>8 records</strong></td>
      <td>Warehouse inventory catalog items with active SKU stock tracking</td>
    </tr>
    <tr>
      <td><code>attendances</code></td>
      <td><strong>7 records</strong></td>
      <td>Daily clock-in and clock-out logs recorded in UK London time</td>
    </tr>
    <tr>
      <td><code>tasks</code></td>
      <td><strong>4 records</strong></td>
      <td>Work assignments distributed across staff with completion progress</td>
    </tr>
    <tr>
      <td><code>employees</code></td>
      <td><strong>3 records</strong></td>
      <td>Staff and administrator user credentials and role definitions</td>
    </tr>
    <tr>
      <td><code>branches</code></td>
      <td><strong>1 record</strong></td>
      <td>Configured corporate branch facility (e.g. India Branch)</td>
    </tr>
    <tr>
      <td><code>fundrequests</code></td>
      <td><strong>1 record</strong></td>
      <td>Budget disbursement requisition awaiting administrator approval</td>
    </tr>
    <tr>
      <td><code>transactions</code></td>
      <td><strong>1 record</strong></td>
      <td>Double-entry bookkeeping income and expenditure records</td>
    </tr>
    <tr>
      <td><code>settings</code></td>
      <td><strong>1 record</strong></td>
      <td>Global company details, tax rate, and master base currency (GBP)</td>
    </tr>
    <tr>
      <td><code>vendors</code>, <code>leads</code>, <code>countries</code>, <code>inventoryrequests</code></td>
      <td><strong>0 records</strong></td>
      <td>Collections initialized, indexed, and ready for production records</td>
    </tr>
  </tbody>
</table>

<div class="page-break"></div>

<!-- SECTION 4 -->
<h1 style="margin-top: 0;">4. Database Collection Schemas &amp; Field Dictionaries</h1>
<p>
  All collections are defined in <code>server/models.js</code> using Mongoose schemas with <code>{ timestamps: true }</code>. Below are the key data structures:
</p>

<h2>4.1. <code>employees</code> Collection</h2>
<ul>
  <li><code>id</code> (String, Unique, Required): Identifier code (e.g. <code>EMP001</code>).</li>
  <li><code>name</code> (String, Required): Full legal name.</li>
  <li><code>email</code> (String, Unique, Required): Corporate email address (login username).</li>
  <li><code>phone</code> (String, Required): Contact phone number.</li>
  <li><code>role</code> (String, Enum: <code>['admin', 'supervisor', 'employee']</code>, Default: <code>'employee'</code>): Access role.</li>
  <li><code>branch</code> / <code>country</code> (String, Required): Facility and country affiliations.</li>
  <li><code>password</code> (String, Required): Salted bcrypt cryptographic password hash.</li>
  <li><code>status</code> (String, Enum: <code>['active', 'inactive']</code>, Default: <code>'active'</code>): Account state.</li>
</ul>

<h2>4.2. <code>orders</code> Collection</h2>
<ul>
  <li><code>id</code> (String, Unique, Required): Order number (e.g. <code>Order No 9</code>).</li>
  <li><code>customer</code> (String, Required): Client full name.</li>
  <li><code>branch</code> (String, Required): Fulfilling branch name.</li>
  <li><code>products</code> (Array of Subdocuments, Required): Array containing <code>name</code> (String), <code>quantity</code> (Number), <code>price</code> (Number).</li>
  <li><code>totalAmount</code> (Number, Required): Total gross value of the order.</li>
  <li><code>status</code> (String, Enum: <code>['created', 'packed', 'dispatched', 'delivered']</code>, Default: <code>'created'</code>): Order stage.</li>
  <li><code>assignedToRole</code> / <code>assignedToUser</code> / <code>assignedToUserName</code>: Visibility and fulfillment delegation parameters.</li>
  <li><code>deadline</code> (String): Promised delivery deadline.</li>
  <li><code>notes</code> (String): Special packing or customer instructions.</li>
</ul>

<h2>4.3. <code>products</code> Collection (Warehouse Inventory)</h2>
<ul>
  <li><code>sku</code> (String, Required): Stock Keeping Unit barcode/code.</li>
  <li><code>name</code> (String, Required): Product name.</li>
  <li><code>category</code> (String, Required): Category grouping.</li>
  <li><code>costPrice</code> (Number, Required): Acquisition cost.</li>
  <li><code>sellingPrice</code> (Number, Required): Retail price.</li>
  <li><code>availableQuantity</code> (Number, Required): On-hand available units (decremented on order placement).</li>
  <li><code>reservedQuantity</code> (Number, Default: 0): Units allocated to pending orders.</li>
  <li><code>status</code> (String, Enum: <code>['available', 'low-stock', 'out-of-stock']</code>): Inventory health indicator.</li>
</ul>

<h2>4.4. <code>attendances</code> Collection (UK Business Time)</h2>
<ul>
  <li><code>employeeId</code> (String, Required): References <code>employees.id</code>.</li>
  <li><code>employeeName</code> (String, Required): Employee display name.</li>
  <li><code>date</code> (String, Required): Calendar date in UK format (<code>YYYY-MM-DD</code>).</li>
  <li><code>checkIn</code> (String): Clock-in time in 24-hr UK format (<code>HH:MM</code>).</li>
  <li><code>checkOut</code> (String): Clock-out time in 24-hr UK format (<code>HH:MM</code>).</li>
  <li><code>workingHours</code> (String, Default: <code>'0h 0m'</code>): Computed shift duration (e.g. <code>8h 15m</code>).</li>
  <li><code>status</code> (String, Enum: <code>['present', 'absent', 'late']</code>): Attendance status (late if check-in after 09:00 AM UK time).</li>
</ul>

<h2>4.5. <code>transactions</code> Collection (Finance Ledger)</h2>
<ul>
  <li><code>id</code> (String, Unique, Required): Ledger voucher ID.</li>
  <li><code>type</code> (String, Enum: <code>['income', 'expense']</code>, Required): Financial movement direction.</li>
  <li><code>amount</code> (Number, Required): Value of the transaction.</li>
  <li><code>category</code> (String, Required): Ledger category (e.g. Sales, Salaries, Utilities).</li>
  <li><code>description</code> (String, Required): Line-item description.</li>
  <li><code>createdBy</code> (String, Required): User identity who posted the transaction.</li>
  <li><code>branch</code> (String, Required): Associated branch location.</li>
  <li><code>date</code> (String, Required): Transaction booking date.</li>
</ul>

<div class="page-break"></div>

<!-- SECTION 5 -->
<h1 style="margin-top: 0;">5. Backend Architecture &amp; REST API Endpoints</h1>

<h2>5.1. Authentication Endpoints</h2>
<table>
  <thead>
    <tr>
      <th>Endpoint</th>
      <th>Method</th>
      <th>Access Level</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>/api/auth/login</code></td>
      <td>POST</td>
      <td>Public</td>
      <td>Authenticates credentials, returns 7-day JWT token and user profile payload.</td>
    </tr>
    <tr>
      <td><code>/api/auth/logout</code></td>
      <td>POST</td>
      <td>Authenticated</td>
      <td>Terminates user session and records an audit log event.</td>
    </tr>
    <tr>
      <td><code>/api/auth/me</code></td>
      <td>GET</td>
      <td>Authenticated</td>
      <td>Validates bearer token and returns current user session data.</td>
    </tr>
  </tbody>
</table>

<h2>5.2. Core Resource Endpoints (<code>createCrudRoutes</code> Matrix)</h2>
<p>
  Core domain entities implement standard REST CRUD routes via the <code>createCrudRoutes</code> factory:
  <br>
  <code>GET /api/[resource]</code> | <code>POST /api/[resource]</code> | <code>PUT /api/[resource]/:id</code> | <code>DELETE /api/[resource]/:id</code>
</p>

<table>
  <thead>
    <tr>
      <th>Resource Path</th>
      <th>Target Model</th>
      <th>Read Access Roles</th>
      <th>Write / Delete Access Roles</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>/api/countries</code></td>
      <td><code>Country</code></td>
      <td><code>['admin']</code></td>
      <td><code>['admin']</code></td>
    </tr>
    <tr>
      <td><code>/api/branches</code></td>
      <td><code>Branch</code></td>
      <td><code>['admin', 'supervisor', 'employee']</code></td>
      <td><code>['admin']</code></td>
    </tr>
    <tr>
      <td><code>/api/employees</code></td>
      <td><code>Employee</code></td>
      <td><code>['admin', 'supervisor']</code></td>
      <td><code>['admin', 'supervisor']</code></td>
    </tr>
    <tr>
      <td><code>/api/attendance</code></td>
      <td><code>Attendance</code></td>
      <td><code>['admin', 'supervisor', 'employee']</code></td>
      <td><code>['admin', 'supervisor', 'employee']</code></td>
    </tr>
    <tr>
      <td><code>/api/tasks</code></td>
      <td><code>Task</code></td>
      <td><code>['admin', 'supervisor', 'employee']</code></td>
      <td><code>['admin', 'supervisor', 'employee']</code></td>
    </tr>
    <tr>
      <td><code>/api/inventory</code></td>
      <td><code>Product</code></td>
      <td><code>['admin', 'supervisor']</code></td>
      <td><code>['admin', 'supervisor']</code></td>
    </tr>
    <tr>
      <td><code>/api/vendors</code></td>
      <td><code>Vendor</code></td>
      <td><code>['admin']</code></td>
      <td><code>['admin']</code></td>
    </tr>
    <tr>
      <td><code>/api/transactions</code></td>
      <td><code>Transaction</code></td>
      <td><code>['admin']</code></td>
      <td><code>['admin']</code></td>
    </tr>
    <tr>
      <td><code>/api/fund-requests</code></td>
      <td><code>FundRequest</code></td>
      <td><code>['admin', 'supervisor']</code></td>
      <td><code>['admin', 'supervisor']</code></td>
    </tr>
    <tr>
      <td><code>/api/inventory-requests</code></td>
      <td><code>InventoryRequest</code></td>
      <td><code>['admin', 'supervisor']</code></td>
      <td><code>['admin', 'supervisor']</code></td>
    </tr>
    <tr>
      <td><code>/api/orders</code></td>
      <td><code>Order</code></td>
      <td><code>['admin', 'supervisor']</code></td>
      <td><code>['admin', 'supervisor']</code></td>
    </tr>
    <tr>
      <td><code>/api/notifications</code></td>
      <td><code>Notification</code></td>
      <td><code>['admin', 'supervisor', 'employee']</code></td>
      <td><code>['admin', 'supervisor', 'employee']</code></td>
    </tr>
    <tr>
      <td><code>/api/leads</code></td>
      <td><code>Lead</code></td>
      <td><code>['admin', 'supervisor']</code></td>
      <td><code>['admin', 'supervisor']</code></td>
    </tr>
  </tbody>
</table>

<div class="page-break"></div>

<!-- SECTION 6 -->
<h1 style="margin-top: 0;">6. Specialized Business Logic Implementations</h1>

<h2>6.1. Transactional Order Creation &amp; Stock Auto-Decrement</h2>
<pre>
// Implemented in server/server.js: POST /api/orders
1. Receive order with products: [{ name, quantity, price }]
2. For each ordered product:
   - Query Product collection by SKU or item name.
   - Verify: availableQuantity >= orderedQuantity.
   - Decrement Product.availableQuantity by orderedQuantity.
   - If availableQuantity == 0 -> Product.status = 'out-of-stock'.
   - If availableQuantity <= 5 -> Product.status = 'low-stock'.
   - Save updated Product document.
3. Save new Order document.
4. Record audit log entry.
</pre>

<h2>6.2. UK Time Attendance Engine</h2>
<pre>
// Implemented in server/server.js: POST /api/attendance/check-in
const UK_TIMEZONE = 'Europe/London';

1. Extract current date and time in UK Timezone (GMT/BST):
   - date: Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/London' }) -> YYYY-MM-DD
   - time: Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/London' }) -> HH:MM
2. Prevent duplicate entries: verify no attendance record exists for this employeeId on today's UK date.
3. Evaluate punctuality rule:
   - If checkIn > '09:00' -> status = 'late'
   - Otherwise -> status = 'present'
4. Save Attendance record and create audit log entry.
</pre>

<h2>6.3. Shift Duration Computation</h2>
<pre>
// Implemented in server/server.js: POST /api/attendance/check-out
1. Retrieve attendance record for employeeId on today's UK date.
2. Record checkOut time in UK format.
3. Parse checkIn (inH, inM) and checkOut (outH, outM).
4. diffMinutes = (outH * 60 + outM) - (inH * 60 + inM).
5. workingHours = Math.floor(diffMinutes / 60) + 'h ' + (diffMinutes % 60) + 'm'.
6. Save record and log audit event.
</pre>

<h2>6.4. Real-Time Dashboard KPI Engine (<code>GET /api/dashboard/stats</code>)</h2>
<p>
  Calculates live KPI metrics tailored to user roles in parallel:
</p>
<ul>
  <li><strong>Admin View:</strong> Total countries, total branches, total employee headcount, total order volume, aggregate inventory item sum, pending fund/inventory approval count, complete financial balance (budget, expenses, income), and month-over-month revenue growth.</li>
  <li><strong>Supervisor View:</strong> Branch-scoped operating budget, pending approval requests, active task assignments, and branch performance metrics.</li>
  <li><strong>Employee View:</strong> Personal daily attendance record, count of assigned open tasks, and personal request statuses.</li>
</ul>

<div class="page-break"></div>

<!-- SECTION 7 -->
<h1 style="margin-top: 0;">7. Frontend Architecture, Pages &amp; UI State</h1>

<h2>7.1. State Architecture &amp; Providers</h2>
<p>
  The frontend UI is structured around React Context providers:
</p>
<ul>
  <li><strong><code>AuthProvider</code>:</strong> Manages user login state, JWT storage in <code>localStorage</code>, session restoration on mount via <code>/api/auth/me</code>, and fallback credentials for offline/demo use.</li>
  <li><strong><code>DbProvider</code>:</strong> Manages state and caching across all 16 collections. Provides unified CRUD methods (e.g. <code>addOrder</code>, <code>checkInEmployee</code>, <code>updateTask</code>), request timeouts, and optimistic UI updates.</li>
  <li><strong><code>ThemeProvider</code>:</strong> Manages UI layout states.</li>
</ul>

<h2>7.2. Session-Persistent Order Checklists</h2>
<p>
  In <code>src/pages/OrdersPage.tsx</code>, individual product delivery checklists are persisted locally via <code>localStorage</code> under <code>globaldrop_order_checked_products</code>.
</p>
<div class="callout">
  <div class="callout-title">Reliability Benefit:</div>
  When warehouse or delivery staff check off items as fulfilled, the checked state persists across page refreshes and modal reopens. It operates entirely client-side, ensuring zero risk of accidental modifications to live order records in MongoDB.
</div>

<h2>7.3. Dual-Currency Display Logic</h2>
<p>
  Currency formatting is centralized in <code>src/utils/currency.ts</code>:
</p>
<ul>
  <li><strong>Admin User Role:</strong> Formats currency in British Pounds (<code>&pound;</code> GBP), e.g. <code>formatCurrency(5000, 'admin')</code> &rarr; <code>&pound;5,000</code>.</li>
  <li><strong>Supervisor / Employee Roles:</strong> Formats currency in Indian Rupees (<code>&#8377;</code> INR), e.g. <code>formatCurrency(5000, 'supervisor')</code> &rarr; <code>&#8377;5,000</code>.</li>
</ul>

<h2>7.4. Interactive Invoicing Module (<code>InvoiceModal.tsx</code>)</h2>
<p>
  Provides printable, formatted customer invoices directly from the Orders screen. It dynamically calculates line items, quantities, VAT/tax percentages, and net order totals, and provides an immediate <code>window.print()</code> trigger for physical printing or PDF export.
</p>

<div class="page-break"></div>

<!-- SECTION 8 -->
<h1 style="margin-top: 0;">8. Hosting, Cloud Infrastructure &amp; Sizing</h1>

<h2>8.1. Deployment Configuration</h2>
<table>
  <thead>
    <tr>
      <th>Layer</th>
      <th>Deployment Target</th>
      <th>Configuration In Codebase</th>
      <th>Verification Status</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Frontend Web App</strong></td>
      <td>Vercel / Cloud CDN</td>
      <td><code>vercel.json</code> rewrite to <code>/index.html</code></td>
      <td><span class="badge badge-verified">Verified</span></td>
    </tr>
    <tr>
      <td><strong>Backend REST Service</strong></td>
      <td>Linux Cloud VM / Node.js</td>
      <td>Runs via <code>node server.js</code> (Port 5000)</td>
      <td><span class="badge badge-verified">Verified</span></td>
    </tr>
    <tr>
      <td><strong>Database Layer</strong></td>
      <td>MongoDB Atlas Cloud</td>
      <td>Cluster: <code>sparkzen.mongodb.net</code></td>
      <td><span class="badge badge-verified">Verified</span></td>
    </tr>
    <tr>
      <td><strong>Custom Domain &amp; SSL</strong></td>
      <td>Customer Registrar / Edge SSL</td>
      <td>Wildcard TLS 1.2+</td>
      <td><span class="badge badge-confirm">Confirmation Required</span></td>
    </tr>
  </tbody>
</table>

<h2>8.2. Infrastructure Sizing Requirements</h2>
<table>
  <thead>
    <tr>
      <th>Component</th>
      <th>Minimum Specification (1 - 50 Users)</th>
      <th>Recommended Specification (50 - 500 Users)</th>
      <th>Architectural Basis</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Frontend Static CDN</strong></td>
      <td>Edge Static Distribution (Free Tier)</td>
      <td>Global CDN with Brotli &amp; Custom Domain</td>
      <td>Static build output in <code>dist/</code> (~900 KB total)</td>
    </tr>
    <tr>
      <td><strong>Backend API Compute</strong></td>
      <td>1 vCPU, 1 GB RAM, 10 GB SSD</td>
      <td>2 vCPU, 2 GB - 4 GB RAM, 25 GB NVMe SSD</td>
      <td>Node.js asynchronous event loop footprint is &lt; 300 MB</td>
    </tr>
    <tr>
      <td><strong>MongoDB Database</strong></td>
      <td>M0 Sandbox (Free, 512 MB Storage)</td>
      <td>M2 Shared ($9/mo) or M5 ($25/mo)</td>
      <td>Current data size is ~85.6 KB; 512 MB provides massive headroom</td>
    </tr>
    <tr>
      <td><strong>Bandwidth Allowance</strong></td>
      <td>10 GB / month</td>
      <td>50 GB - 100 GB / month</td>
      <td>Typical JSON payload is &lt; 2 KB per request</td>
    </tr>
  </tbody>
</table>

<div class="page-break"></div>

<!-- SECTION 9 -->
<h1 style="margin-top: 0;">9. Financial Ledger &amp; Cost Analysis</h1>
<p>
  The table below itemizes the operational services required to run GlobalDrop ERP. All cost lines are classified as either verified free components or items requiring customer subscription plan confirmation:
</p>

<table>
  <thead>
    <tr>
      <th>Service / Expense Item</th>
      <th>Designated Provider</th>
      <th>Estimated Monthly Cost</th>
      <th>Estimated Annual Cost</th>
      <th>Billing Confirmation Status</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Frontend Application Hosting</strong></td>
      <td>Vercel (Hobby vs Pro Plan)</td>
      <td>$0.00 – $20.00</td>
      <td>$0.00 – $240.00</td>
      <td><span class="badge badge-confirm">Customer Plan Confirmation Required</span></td>
    </tr>
    <tr>
      <td><strong>Backend API Compute (VPS)</strong></td>
      <td>DigitalOcean / Render / AWS Lightsail</td>
      <td>$5.00 – $12.00</td>
      <td>$60.00 – $144.00</td>
      <td><span class="badge badge-confirm">Customer Plan Confirmation Required</span></td>
    </tr>
    <tr>
      <td><strong>Cloud Database Cluster</strong></td>
      <td>MongoDB Atlas (M0 vs M2 Shared)</td>
      <td>$0.00 – $9.00</td>
      <td>$0.00 – $108.00</td>
      <td><span class="badge badge-confirm">Customer Plan Confirmation Required</span></td>
    </tr>
    <tr>
      <td><strong>Custom Domain Name</strong></td>
      <td>Domain Registrar (Namecheap / Cloudflare)</td>
      <td>~$1.25</td>
      <td>$12.00 – $15.00</td>
      <td><span class="badge badge-confirm">Customer Plan Confirmation Required</span></td>
    </tr>
    <tr>
      <td><strong>SSL / TLS Security Certificates</strong></td>
      <td>Let's Encrypt / Vercel Edge SSL</td>
      <td><strong>$0.00</strong> (Included)</td>
      <td><strong>$0.00</strong> (Included)</td>
      <td><span class="badge badge-verified">Verified Free In Architecture</span></td>
    </tr>
    <tr>
      <td><strong>Third-Party API Subscriptions</strong></td>
      <td>Internal REST Architecture</td>
      <td><strong>$0.00</strong> (None)</td>
      <td><strong>$0.00</strong> (None)</td>
      <td><span class="badge badge-verified">Verified In Codebase</span></td>
    </tr>
  </tbody>
</table>

<h2>9.1. Total Operational Cost Scenarios</h2>
<ul>
  <li><strong>Scenario A: Lean / Startup Tier (Estimated ~$5.00 / month | ~$60 – $75 / year)</strong><br>
    Utilizes Vercel Hobby ($0), MongoDB Atlas Free M0 ($0), minimal cloud compute ($5/mo), and a custom domain ($12/yr).
  </li>
  <li><strong>Scenario B: Standard Commercial Tier (Estimated ~$41.00 / month | ~$490 – $510 / year)</strong><br>
    Utilizes Vercel Pro ($20/mo), MongoDB Atlas M2 Shared Cluster ($9/mo), dedicated 2GB VPS ($12/mo), and a custom domain with privacy ($15/yr).
  </li>
</ul>

<div class="page-break"></div>

<!-- SECTION 10 -->
<h1 style="margin-top: 0;">10. Security Architecture &amp; Audit Trail</h1>

<h2>10.1. Authentication &amp; Password Cryptography</h2>
<ul>
  <li><strong>Cryptographic Password Hashing:</strong> Passwords are never stored in plaintext. They are salted with 10 rounds of bcrypt hashing via <code>bcryptjs</code> before persistence in the <code>employees</code> collection.</li>
  <li><strong>Cryptographic JWT Tokens:</strong> Issued upon successful login with a 7-day expiration time, verified on every protected API route via <code>authenticateToken</code> middleware.</li>
  <li><strong>Role-Based API Guards:</strong> Sensitive endpoints enforce role permissions via <code>requireRole(['admin', ...])</code>, rejecting unauthorized callers with HTTP 403 Forbidden.</li>
</ul>

<h2>10.2. Database Security &amp; Network Protection</h2>
<ul>
  <li><strong>Transport Security:</strong> All data in transit between the API server and MongoDB Atlas is encrypted using TLS 1.2+.</li>
  <li><strong>Connection String Protection:</strong> Database credentials and cluster endpoints are managed via environment variables (<code>MONGO_URI</code>), isolated from frontend source code.</li>
  <li><strong>DNS Resolution Guard:</strong> Fallback to Google and Cloudflare DNS resolvers (<code>8.8.8.8</code>, <code>1.1.1.1</code>) is implemented in <code>server/server.js</code> to prevent SRV lookup failures.</li>
</ul>

<h2>10.3. Forensic Audit Logging (<code>auditlogs</code> Collection)</h2>
<p>
  Critical events are recorded in the <code>auditlogs</code> collection:
</p>
<table>
  <thead>
    <tr>
      <th>Event Name</th>
      <th>Trigger Action</th>
      <th>Logged Metadata</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>Login</code> / <code>Login Failed</code></td>
      <td>Authentication attempts on <code>/api/auth/login</code></td>
      <td>User email, client IP address, success/failure detail</td>
    </tr>
    <tr>
      <td><code>Check-In</code></td>
      <td>Employee clock-in on <code>/api/attendance/check-in</code></td>
      <td>Employee name, check-in time (UK Time), punctuality status</td>
    </tr>
    <tr>
      <td><code>Check-Out</code></td>
      <td>Employee clock-out on <code>/api/attendance/check-out</code></td>
      <td>Employee name, check-out time (UK Time), total hours worked</td>
    </tr>
    <tr>
      <td><code>Update Settings</code></td>
      <td>Changes to global corporate profile</td>
      <td>User identity, timestamp, system setting parameters modified</td>
    </tr>
  </tbody>
</table>

<div class="page-break"></div>

<!-- SECTION 11 -->
<h1 style="margin-top: 0;">11. Operational Boundaries &amp; Existing Limitations</h1>
<p>
  To maintain strict documentation accuracy, the following existing technical boundaries in the completed codebase are documented:
</p>
<ol>
  <li><strong>Binary File &amp; Media Storage:</strong>
    Avatar pictures, company logos, and product imagery are stored as URL strings rather than binary blobs. Dedicated cloud object storage (e.g. AWS S3, Cloudinary) is not currently implemented.
  </li>
  <li><strong>Transactional Email Services:</strong>
    The system generates in-app notifications stored in the <code>notifications</code> collection. External SMTP / transactional email dispatch (e.g. SendGrid, Mailgun) is not currently wired up.
  </li>
  <li><strong>Multi-Tenant Data Partitioning:</strong>
    All branches operate within a shared database instance (<code>globalERP</code>) using branch tagging fields rather than physically separated multi-tenant database partitions.
  </li>
  <li><strong>Unrouted Page Templates:</strong>
    Three page files in <code>src/pages/</code> (<code>LocationsPage.tsx</code>, <code>RegisterPage.tsx</code>, <code>WalletPage.tsx</code>) exist in the source tree but are not currently mounted in the <code>src/App.tsx</code> routing table.
  </li>
</ol>

<div class="page-break"></div>

<!-- SECTION 12 -->
<h1 style="margin-top: 0;">12. Project Handover &amp; Runbook Instructions</h1>

<h2>12.1. Environment Configuration</h2>
<p>
  Backend environment settings must be configured in <code>server/.env</code>:
</p>
<pre>
# MongoDB Atlas Connection URI
MONGO_URI=mongodb+srv://&lt;username&gt;:&lt;password&gt;@sparkzen.mongodb.net/globalERP?retryWrites=true&amp;w=majority

# Backend Server Listening Port
PORT=5000

# JWT Cryptographic Secret Key
JWT_SECRET=globaldrop_erp_secret_key_2026
</pre>

<h2>12.2. Service Startup Procedures</h2>

<h3>Starting the Backend API Service</h3>
<pre>
cd server
npm install
npm start
# Output should confirm:
# Connecting to MongoDB Atlas...
# MongoDB Atlas connected successfully: globalERP
# Server is running on port 5000
</pre>

<h3>Starting the Frontend Application</h3>
<pre>
# In the project root directory:
npm install
npm run dev
# The application will launch at http://localhost:5173
</pre>

<h2>12.3. Production Build Instructions</h2>
<pre>
# Compile frontend production bundle:
npm run build
# Output artifacts are created in the dist/ folder, ready for CDN deployment.
</pre>

<div class="callout" style="margin-top: 30pt;">
  <div class="callout-title">Document Verification Sign-Off:</div>
  This document accurately reflects the as-built architecture, verified database schemas, and implemented API endpoints of the GlobalDrop ERP system as of November 2026.
</div>

</body>
</html>
"""

output_pdf = "docs/GlobalDrop_ERP_Technical_Documentation.pdf"
print("Compiling PDF with WeasyPrint...")
weasyprint.HTML(string=html_content).write_pdf(output_pdf)
print(f"Successfully generated: {output_pdf}")

