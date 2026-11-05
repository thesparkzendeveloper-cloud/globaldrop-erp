# GlobalDrop ERP — Infrastructure & Cost Summary

## 1. Hosting Architecture & Current Deployments

The following table distinguishes verified codebase configurations from external provider arrangements that require customer billing confirmation:

| Architectural Tier | Configured Technology | Identified Provider | Status / Confirmation |
| :--- | :--- | :--- | :--- |
| **Frontend Application** | React 18 SPA (Vite / Static HTML5) | **Vercel** (`vercel.json` present) | **Verified in Codebase** (Live URL requires customer confirmation) |
| **Backend API Service** | Express 4.19 Node.js REST Service | Node.js Runtime (Linux / Cloud VM) | **Architecture Verified** (Host provider confirmation required) |
| **Database Tier** | MongoDB NoSQL Document Store | **MongoDB Atlas Cloud** (`sparkzen.mongodb.net`) | **Verified via Connection String** |
| **Domain & DNS** | HTTPS Custom Domain | Third-party Registrar | **Customer/Provider Confirmation Required** |
| **SSL / TLS Encryption** | Let's Encrypt / Cloudflare / Atlas TLS | Automatic Wildcard SSL | **Standard Cloud SSL Enabled** |

---

## 2. Infrastructure Sizing & Compute Requirements

### 2.1. Measured Host Environment
The application was evaluated on a Linux host with the following baseline compute specs:
- **CPU Cores:** 8 Cores available
- **Memory (RAM):** 7.0 GB Total Physical RAM, 862 MB Free, 2.1 GB Available
- **Disk Utilization:** Dedicated SSD mount

### 2.2. Production Sizing Recommendations

Because GlobalDrop ERP is a decoupled Single Page Application (SPA) paired with a lightweight, non-blocking Node.js Express API and hosted database, its footprint is exceptionally efficient.

| Component | Minimum Specification (1 - 50 Concurrent Users) | Recommended Specification (50 - 500 Concurrent Users) | Performance Rationale |
| :--- | :--- | :--- | :--- |
| **Frontend Static Hosting** | CDN Edge Network (Vercel / Cloudflare / Netlify) | Global Edge CDN with Custom Domain & Brotli compression | Zero server compute overhead; assets cached globally |
| **Backend API Compute** | 1 vCPU, 1 GB RAM, 10 GB SSD | 2 vCPU, 2 GB - 4 GB RAM, 25 GB NVMe SSD | Node.js single-threaded event loop operates comfortably under 300 MB RAM |
| **Database Tier** | MongoDB Atlas M0 (Free Shared, 512 MB Storage) | MongoDB Atlas M2 ($9/mo) or M5 ($25/mo) | Current live data size is 85.6 KB; 512 MB offers massive headroom |
| **Network & Bandwidth** | 10 GB / month transfer | 50 GB - 100 GB / month transfer | REST JSON payloads average < 2 KB per request |

---

## 3. Project Cost Breakdown & Expense Ledger

> [!IMPORTANT]
> The table below clearly distinguishes **Actual Existing Implementations** from **Estimated Market Costs**. Subscription tiers and invoice totals depend on the customer's choice of cloud hosting plan.

| Cost Item | Service / Provider | Tier / Plan | Estimated Monthly Cost | Estimated Annual Cost | Confirmation Status |
| :--- | :--- | :--- | :---: | :---: | :--- |
| **Frontend Hosting** | Vercel | Hobby (Free) OR Pro ($20/mo) | $0.00 – $20.00 | $0.00 – $240.00 | Customer Plan Confirmation Required |
| **Backend API Compute** | VPS (DigitalOcean / Render / AWS Lightsail) | 1 vCPU / 1GB - 2GB RAM Linux VM | $5.00 – $12.00 | $60.00 – $144.00 | Customer Plan Confirmation Required |
| **Database Hosting** | MongoDB Atlas | M0 Free (512 MB) OR M2 Shared | $0.00 – $9.00 | $0.00 – $108.00 | Customer Plan Confirmation Required |
| **Domain Name Registration** | Domain Registrar (Namecheap / GoDaddy / Cloudflare) | Top-Level Domain (`.com` / `.co.uk`) | ~$1.25 | ~$12.00 – $15.00 | Customer Plan Confirmation Required |
| **SSL Certificate** | Automated SSL (Let's Encrypt / Vercel SSL) | Wildcard SSL | **$0.00** (Free) | **$0.00** (Free) | **Verified** (Standard Free Feature) |
| **Third-Party APIs** | Internal REST Architecture | No paid external APIs in code | **$0.00** | **$0.00** | **Verified** |

### 3.1. Total Cost Scenarios

1. **Zero-Cost / Low-Volume Tier (Startup Phase):**
   - Frontend: Vercel Hobby ($0)
   - Backend: Render / Railway Free or Minimal ($5/mo)
   - Database: MongoDB Atlas M0 Sandbox ($0)
   - Domain: Custom Domain ($12/year)
   - **Total Estimated Operating Cost:** **~$5.00 / month ($60 - $72 / year)**

2. **Standard Production Tier (Business Tier):**
   - Frontend: Vercel Pro or CDN Static Hosting ($20/mo)
   - Backend: DigitalOcean 2GB Droplet or AWS Lightsail ($12/mo)
   - Database: MongoDB Atlas M2 Shared Cluster ($9/mo)
   - Domain: Custom Domain with Privacy ($15/year)
   - **Total Estimated Operating Cost:** **~$41.00 / month (~$495 / year)**

