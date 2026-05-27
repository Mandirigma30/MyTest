# RespondaCare: Master AI Development Blueprint

> **Notice to AI IDE (Antigravity):** This document serves as the absolute source of truth for the RespondaCare architecture. You must adhere strictly to these constraints, schemas, and workflows to ensure compliance with the **Philippine Data Privacy Act (RA 10173)** and to maintain pristine, non-redundant code quality for intellectual property authorship.

---

## 1. System Objective
You are tasked with building a Progressive Web App (PWA) for emergency medical response in Barangay 45. The system must operate flawlessly in zero-connectivity environments (offline-first) and enforce strict cryptographic security on all Protected Health Information (PHI).

---

## 2. Technology Stack & Dependencies

**Core Stack:**
* **Frontend:** React 18 / JavaScript (ES6+) via Vite
* **Styling:** Tailwind CSS v3
* **Backend / Auth:** Supabase (PostgreSQL)
* **Delivery:** Vercel (for mandatory HTTPS required by WebRTC)

**Mandatory Dependencies:**
Ensure these are present in `package.json`.
```bash
# Core & Routing
npm install @supabase/supabase-js react-router-dom

# Offline Storage & PWA
npm install idb
npm install -D vite-plugin-pwa

# Hardware & Export Features
npm install html5-qrcode qrcode.react jspdf jspdf-autotable

# UI Framework
npm install -D tailwindcss postcss autoprefixer
```

---

## 3. Database Architecture (Supabase / PostgreSQL)

You must enforce security at the database level using Row Level Security (RLS). **Do not bypass RLS.**

### Schema Walled Gardens
1.  **`users` (Extends Auth):**
    * Columns: `id`, `role` ('admin', 'responder', 'resident'), `full_name`.
2.  **`residents_health`:**
    * Columns: `id`, `user_id`, `encrypted_sample_data` (AES-256-GCM ciphertext), `consent_status`.
    * *RLS Constraint:* `admin` can INSERT/UPDATE. `resident` can SELECT self. `responder` can only SELECT via specific exact ID lookup (via QR scan).
3.  **`incident_reports`:**
    * Columns: `id`, `responder_id`, `triage_score`, `vitals_data`, `sync_timestamp`.
    * *RLS Constraint:* `responder` can INSERT. `admin` can SELECT.
4.  **`daily_auth_keys`:**
    * Columns: `id`, `key_hash`, `created_by`, `expires_at`.
5.  **`audit_logs`:**
    * Columns: `id`, `actor_id`, `action`, `target_id`, `timestamp`.
    * *RLS Constraint:* Fully locked. Human users cannot UPDATE/DELETE. Supabase Triggers handle INSERTs natively. `admin` can SELECT.

---

## 4. Frontend Routing (Strict RBAC)

Implement a `ProtectedRoute.jsx` component using `react-router-dom`. The routing must create absolute "Walled Gardens" to prevent role crossover.

```jsx
// Architecture Concept for App.jsx
<Routes>
  <Route path="/" element={<LoginPage />} /> // Base login, handles routing redirect based on role.

  {/* Walled Garden 1: First Responders */}
  <Route element={<ProtectedRoute allowedRoles={['responder']} />}>
    <Route path="/responder/scanner" element={<QRScanner />} />
    <Route path="/responder/report" element={<UIRForm />} />
  </Route>

  {/* Walled Garden 2: Admin/BHW */}
  <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
    <Route path="/admin/dashboard" element={<CommandCenter />} />
    <Route path="/admin/enrollment" element={<ResidentEnrollment />} />
  </Route>
  
  {/* Walled Garden 3: Residents (Patient Portal) */}
  <Route element={<ProtectedRoute allowedRoles={['resident']} />}>
    <Route path="/resident/portal" element={<PatientPortal />} />
  </Route>
</Routes>
```

---

## 5. Component Construction Workflow

To prevent code bloat, follow this exact construction order based on the developer prompting you:

### Phase 1: Global UI Stitching (Sebastian's Module)
* **Path:** `src/components/common/`
* **Rule:** Build reusable Tailwind components (`Button`, `Input`, `Card`). **All subsequent modules MUST import these.**

### Phase 2: First Responder Engine (Xander's Module)
* **Offline Scanner (`QRScanner.jsx`):** Use `html5-qrcode`.
* **Decryption:** Use native Web Crypto API (`window.crypto.subtle`).
* **Offline Sync:** Intercept network failures. Save UIR payloads to `idb` and sync to Supabase when `navigator.onLine` returns true.

### Phase 3: Admin & Dispatch (Sebastian & Yashley's Modules)
* **Enrollment:** Capture SAMPLE data, encrypt client-side, generate QR code using `qrcode.react`.
* **Command Center:** Poll `incident_reports`, sort by triage severity.

### Phase 4: UIR & Export (Elijah's Module)
* **Form:** Build the 4-part Unified Incident Report. 
* **PDF Export:** Attach `jspdf` to export a formatted handover document.

---

## 6. Zero-Tolerance Rules

1.  **Never Log PII:** `console.log()` must never output plaintext names, health statuses, or IDs.
2.  **No Server-Side JavaScript:** There is no Node.js backend. All logic happens in the React client or via Supabase RLS.
3.  **Always Update the Log:** Append all actions to `UPDATE_LOG.md` before concluding a session.

---

## 7. Authorship & Code Efficiency Protocol (Strict DRY Enforcement)

To ensure the codebase meets the rigorous standards required for intellectual property authorship and academic defense, the IDE must actively prevent code duplication and enforce architectural purity. 

Before writing **any** new function or UI component, the IDE MUST:
1. **Execute Workspace Scan:** Search `src/hooks/`, `src/lib/`, and `src/components/common/` to verify if the requested utility, API call, or UI element already exists.
2. **Enforce DRY (Don't Repeat Yourself):** If a function or component exists, **import it**. Never write a duplicate variation.
3. **Abstract Shared Logic:** If a newly requested feature shares 80% of its logic with an existing function, refactor the existing function to accept parameters rather than creating a new file.
4. **Maintain Module Purity:** Keep individual file length minimal (ideally under 250 lines). If a file grows too complex, extract the business logic into a dedicated custom hook (`src/hooks/`) or utility file (`src/lib/`).
