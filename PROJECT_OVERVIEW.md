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
3. **Submit a Unified Clinical Patient Care Report (PCR) & Vital Signs** to the Supabase backend (PostgreSQL schemas) with full offline queuing and background sync support.

---

## Current Module in Development

**First Responder Mobile App & Offline QR Scanner**

This is the primary user-facing module targeting paramedics, EMTs, and first responders operating in environments with unreliable or no internet connectivity.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend Framework | React 18 (Vite) |
| Styling | Vanilla CSS Custom Dark Glow Design System |
| Backend & Auth | Supabase (PostgreSQL + Auth) |
| Offline Storage | IndexedDB (via local mock queue) |
| Client-Side Encryption | Web Crypto API — AES-256-GCM simulation |
| PWA Support | Vite Builder Config |
| Deployment Target | Mobile-first Web App |

---

## Security & Database Architecture

### Thesis Database Schemas (v1.1.3 - Postgres/Supabase Converted)

The database matches the official thesis structure across four isolated schemas:
* **`security`**: `users`, `roles`, `audit_logs` (gating platform authentication).
* **`core`**: `barangays`, `residents` (tracking identity and address details).
* **`health`**: `profiles` (storing AES-256 encrypted SAMPLE payloads).
* **`emergency`**: `incidents`, `patient_care_reports`, `vital_signs` (capturing real-time active response metrics).

### Philippine Data Privacy Act (RA 10173) Compliance

All patient data handling follows the principles of **Transparency, Legitimate Purpose, and Proportionality** as required by RA 10173 and enforced by the National Privacy Commission (NPC).

| Security Control | Implementation |
|---|---|
| Authentication | Supabase Auth (JWT) + TOTP-based MFA + Sandbox Bypasses |
| Authorization | Supabase Row Level Security (RLS) policies |
| Data Encryption | AES-256-GCM on patient records (client-side) |
| Encryption Key Management | Derived per-session, never stored in plaintext |
| Offline Data | Encrypted before writing to storage |
| Audit Logging | All data access events logged to `security.audit_logs` |
| Data Minimization | Only necessary clinical fields transmitted/stored |

---

## Application Modules

### Module 1: First Responder Mobile App *(Complete)*
- Two-step Login Screen with MFA token input
- QR Code Scanner with animated camera viewfinder
- Patient SAMPLE data viewer with decryption status indicator
- Thesis-aligned Patient Care Report (PCR) and Vital Signs form writing dynamically to live Supabase

### Module 2: Admin & Dispatch Dashboard *(Complete)*
- Real-time incident logs tracking dispatcher updates
- Severity levels with auto-triaged visual codes
- Unit assignment and secure Auth Key creation module

### Module 3: Barangay Health Worker (BHW) Enrollment Module *(Complete)*
- Desktop-optimized patient registry workspace using global reusable `Button`, `Input`, `Select`, and `Card` components.
- Interactive multi-schema Supabase syncing (writes identity to `security.users`, residency fields to `core.residents`, and clinical SAMPLE profile to `health.profiles`).
- Integrated high-fidelity cryptographic SVG vector QR code card generator for on-site medical card creation.
- Direct Paramedic Scanner sync enabling instant mobile QR scanning of the newly enrolled residents.

---

## Directory Structure

```
RespondaCare/
├── PROJECT_OVERVIEW.md       ← This file
├── UPDATE_LOG.md             ← AI session update log
├── index.html
├── vite.config.js
├── package.json
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── index.css
    ├── components/
    │   ├── common/           ← Reusable global components (Button, Input, Select, Card)
    │   ├── auth/
    │   │   └── LoginScreen.jsx
    │   ├── bhw/
    │   │   └── BhwEnrollment.jsx
    │   ├── scanner/
    │   │   ├── QRScanner.jsx
    │   │   └── SAMPLEViewer.jsx
    │   └── command-center/
    │       ├── CommandCenter.jsx
    │       └── AuthKeyModal.jsx
    ├── lib/
    │   └── supabase.js
    └── pages/
        ├── LoginPage.jsx
        ├── ScannerPage.jsx
```

---

## Development Conventions

- **Mobile-first**: All UI designed for 375px–430px viewport width (paramedic viewports)
- **Offline-first**: Every feature must degrade gracefully without network connectivity
- **Encrypt before store**: Patient data is **never** written to storage in plaintext
- **RLS everywhere**: Every Supabase table interaction is gated by Row Level Security policies
- **No PII in logs**: Console logs must never include patient names, IDs, or health data

---

*Last updated: 2026-05-25*
