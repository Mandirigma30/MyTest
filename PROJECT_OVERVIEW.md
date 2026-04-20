# RespondaCare — Project Overview

> **Philippine Data Privacy Act (RA 10173) Compliant Healthcare Emergency Response PWA**

---

## Project Name

**RespondaCare**

---

## Objective

An **offline-first mobile Progressive Web App (PWA)** that enables First Responders to:

1. **Securely authenticate** using username/password credentials with Multi-Factor Authentication (MFA).
2. **Scan offline QR codes** to decrypt patient **SAMPLE data**:
   - **S** — Signs & Symptoms
   - **A** — Allergies
   - **M** — Medications
   - **P** — Pertinent Past Medical History
   - **L** — Last Oral Intake
   - **E** — Events Leading to Emergency
3. **Submit a Unified Incident Report (UIR)** to the Supabase backend, with full offline queuing and background sync support.

---

## Current Module in Development

**First Responder Mobile App & Offline QR Scanner**

This is the primary user-facing module targeting paramedics, EMTs, and first responders operating in environments with unreliable or no internet connectivity.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend Framework | React 18 (Vite) |
| Styling | Tailwind CSS v3 |
| Backend & Auth | Supabase (PostgreSQL + Auth) |
| Offline Storage | IndexedDB (via idb or Dexie.js) |
| Client-Side Encryption | Web Crypto API — AES-256-GCM |
| PWA Support | Vite PWA Plugin (Workbox) |
| Deployment Target | Mobile-first PWA (installable) |

---

## Security Architecture

### Philippine Data Privacy Act (RA 10173) Compliance

All patient data handling follows the principles of **Transparency, Legitimate Purpose, and Proportionality** as required by RA 10173 and enforced by the National Privacy Commission (NPC).

| Security Control | Implementation |
|---|---|
| Authentication | Supabase Auth (JWT) + TOTP-based MFA |
| Authorization | Supabase Row Level Security (RLS) policies |
| Data Encryption | AES-256-GCM via Web Crypto API (client-side) |
| Encryption Key Management | Derived per-session, never stored in plaintext |
| Offline Data | Encrypted before writing to IndexedDB |
| Audit Logging | All data access events logged to Supabase |
| Data Minimization | Only SAMPLE fields transmitted/stored |

---

## Application Modules

### Module 1: First Responder Mobile App *(Active)*
- Login Screen with MFA input
- QR Code Scanner (offline-capable)
- Patient SAMPLE data viewer (decrypts locally)
- Unified Incident Report (UIR) form
- Offline sync queue management

### Module 2: Admin & Dispatch Dashboard *(Planned)*
- Incident management console
- Responder assignment and tracking
- Report review and approval workflow

### Module 3: Patient Data Management Portal *(Planned)*
- Patient QR code generation
- Consent management (RA 10173 compliance)
- Data retention and deletion controls

---

## Directory Structure

```
RespondaCare/
├── PROJECT_OVERVIEW.md       ← This file
├── UPDATE_LOG.md             ← AI session update log
├── index.html
├── vite.config.js
├── tailwind.config.js
├── package.json
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── index.css
    ├── components/
    │   ├── auth/
    │   │   └── LoginScreen.jsx
    │   ├── scanner/
    │   │   └── QRScanner.jsx
    │   ├── patient/
    │   │   └── SAMPLEViewer.jsx
    │   └── reports/
    │       └── UIRForm.jsx
    ├── hooks/
    │   ├── useOfflineSync.js
    │   └── useEncryption.js
    ├── lib/
    │   ├── supabase.js
    │   ├── indexedDB.js
    │   └── crypto.js
    └── pages/
        ├── LoginPage.jsx
        ├── ScannerPage.jsx
        └── ReportPage.jsx
```

---

## Development Conventions

- **Mobile-first**: All UI designed for 375px–430px viewport width (iPhone SE → iPhone 14 Pro Max range)
- **Offline-first**: Every feature must degrade gracefully without network connectivity
- **Encrypt before store**: Patient data is **never** written to IndexedDB in plaintext
- **RLS everywhere**: Every Supabase table interaction is gated by Row Level Security policies
- **No PII in logs**: Console logs must never include patient names, IDs, or health data

---

*Last updated: 2026-04-15*
