# Daktari Mtaani — Technical Work Plan
### On-demand doctor dispatch & teleconsultation platform (Web MVP → Funding → Native Apps)

---

## 1. Product Concept & Core Hypothesis

Daktari Mtaani ("Doctor in the neighbourhood") is a two-sided marketplace connecting patients to verified, nearby doctors on demand — modeled on the ride-hailing request/dispatch/track/pay loop, applied to healthcare.

Two request types from day one:
- **Teleconsult** — instant video/voice consultation with a licensed doctor. Low friction, low cost to deliver, fastest to validate demand.
- **Home visit** — a doctor or clinical officer is dispatched to the patient's location for physical examination, basic diagnostics, or medication delivery follow-up.

**MVP hypothesis to prove before fundraising:** patients in a defined pilot area will pay (via M-Pesa) for faster, more convenient access to a doctor than the status quo (walk-in clinic / hospital queue), and a supply pool of doctors can be reliably rostered to respond within a target SLA (e.g. teleconsult connect <5 min, home visit arrival <45 min).

This hypothesis, not the app itself, is what unlocks funding — so the technical plan is built to instrument and prove it.

---

## 2. Regulatory Constraints That Shape the Architecture

These aren't optional add-ons — they determine what must exist before Phase 1 can legally launch:

- **KMPDC licensing.** Every doctor on the platform must be a practitioner registered and licensed with the Kenya Medical Practitioners and Dentists Council (KMPDC). KMPDC publishes annual licensure status for all registered practitioners and facilities. The system needs a **doctor verification module** that checks license number, specialty, and current-year licensure status before a doctor can go live — ideally re-checked annually.
- **Virtual institution registration.** Under KMPDC's e-health framework, a platform offering telemedicine should operate as a registered "virtual institution" tied to a recognised, registered health facility — this is a business/legal workstream to run in parallel with development (the client should engage a KMPDC-registered facility as clinical/legal anchor, or register one).
- **Data Protection Act, 2019.** As of January 2025, KMPDC requires health facilities to hold a valid Certificate of Data Handler/Processor from the Office of the Data Protection Commissioner (ODPC). Patient health records are "sensitive personal data" under the Act — this drives encryption-at-rest, access logging, consent capture, and data residency decisions from day one, not retrofitted later.
- **Digital Health Act, 2023** and its 2024 regulations establish a national Kenya Health Enterprise Architecture and interoperability expectations. Not an MVP blocker, but worth designing the data model so future integration (e.g. SHA/health information exchange) isn't a rewrite.

**Action item for the client, in parallel with Phase 1 build:** secure the clinical/legal anchor (registered facility + KMPDC engagement) and ODPC data handler certification. This is on the critical path to *launch*, not to *build*.

---

## 3. Phased Roadmap

| Phase | Goal | Duration |
|---|---|---|
| **0. Discovery & compliance setup** | Lock scope, pilot geography, clinical partner, data protection registration | 2 weeks |
| **1. Web MVP build** | Patient web app, doctor console, dispatch, M-Pesa, teleconsult | 10–12 weeks |
| **2. Pilot operations** | Live in one area with a small doctor roster, real transactions | 8–12 weeks |
| **3. Fundraising readiness** | Traction data room, pitch deck, investor targeting (runs alongside Phase 2) | Overlaps Phase 2 |
| **4. Native apps** | iOS/Android patient + doctor apps, funded by raised capital | 12–16 weeks post-raise |
| **5. Scale** | Multi-county rollout, insurance/NHIF-SHA integration, pharmacy & lab partnerships | Post-raise, ongoing |

---

## 4. System Architecture

**Guiding principle:** reuse the stack already proven on your ticketing/Couch TV work (Node.js, Supabase, M-Pesa Daraja) so the pilot can be built fast by a small team, with a schema that migrates cleanly to native apps later — the web MVP and future mobile apps share one backend and one API from day one.

```
┌─────────────────┐     ┌──────────────────┐     ┌───────────────────┐
│  Patient Web App │     │  Doctor Console   │     │   Admin / Ops      │
│  (Next.js/React) │     │  (Next.js/React)  │     │   Dashboard        │
└────────┬─────────┘     └────────┬──────────┘     └─────────┬──────────┘
         │                        │                            │
         └──────────────┬─────────┴────────────┬───────────────┘
                         │   REST/WebSocket API   │
                ┌────────▼─────────────────────────▼────────┐
                │        Node.js / Express API layer         │
                │  (Auth, Dispatch, Payments, Notifications) │
                └──┬───────┬────────┬─────────┬───────────┬─┘
                   │       │        │         │           │
            ┌──────▼─┐ ┌───▼───┐ ┌──▼──────┐ ┌▼─────────┐ ┌▼──────────┐
            │Supabase│ │M-Pesa │ │ Video    │ │Africa's  │ │ Maps /    │
            │Postgres│ │Daraja │ │ (Agora / │ │Talking   │ │ Geocoding │
            │+PostGIS│ │ API   │ │ Twilio)  │ │(SMS)     │ │ (Google)  │
            │+Auth   │ │       │ │          │ │          │ │           │
            │+Realtime│└───────┘ └──────────┘ └──────────┘ └───────────┘
            └────────┘
```

### Core stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | Next.js (React), Tailwind | Fast to build, SEO-friendly for patient acquisition, one codebase later ports concepts to React Native |
| Backend | Node.js / Express (or Next.js API routes for MVP speed) | Matches existing team expertise |
| Database | Supabase (Postgres + PostGIS extension) | Geospatial queries for nearest-doctor matching; built-in Auth and Row-Level Security fit a multi-role app (patient/doctor/admin) |
| Realtime | Supabase Realtime or a lightweight WebSocket layer | Live doctor location, request status updates — the "watching your cab arrive" feel |
| Payments | M-Pesa Daraja API (STK Push for patient payment, B2C for doctor payouts) | Already integrated in your ticketing work; primary payment rail in Kenya |
| Video consult | Agora or Twilio Video (WebRTC) | Low-latency, works on patchy mobile data, SDKs available for future native apps |
| SMS/notifications | Africa's Talking + web push | SMS fallback critical — not everyone will have the app open; also used for OTP verification |
| Maps/dispatch | Google Maps Platform (Distance Matrix, Geocoding) | ETA calculation, doctor-to-patient routing |
| Background jobs | BullMQ + Redis | Dispatch timeout/reassignment, payout batching, license re-verification reminders |
| Hosting | Railway or similar (consistent with Couch TV setup) | Fast to provision, scales adequately for pilot volume |

---

## 5. Core Modules (MVP Scope)

1. **Patient onboarding & auth** — phone number + OTP (via Africa's Talking), basic profile, saved location(s).
2. **Doctor onboarding & verification** — application form, KMPDC license number capture, manual admin verification against KMPDC's published register at launch (automate this check later if KMPDC exposes an API/queryable register), specialty, availability windows, bank/M-Pesa payout details.
3. **Request flow** — patient selects teleconsult or home visit, describes symptoms briefly (structured triage questions, not open diagnosis), sets location (for home visit), sees estimated price and ETA before confirming.
4. **Dispatch engine** — on request, query available doctors within radius (PostGIS `ST_DWithin`), rank by proximity + rating + acceptance rate, push request to top candidate with accept/decline timeout (e.g. 30s), auto-reassign on timeout/decline.
5. **Live tracking** — for home visits, patient sees doctor's live location and ETA once accepted (same UX pattern as ride-hailing).
6. **Teleconsultation room** — in-browser video/audio call, no app download required, session token-gated (reusing the session-token pattern from Couch TV).
7. **Payments** — M-Pesa STK Push charged on confirmation or on consult completion (recommend charge-on-completion for trust in early pilot), automatic doctor payout batch (daily or weekly) via B2C, platform commission logic.
8. **Consultation record & prescription note** — structured summary the doctor fills in (diagnosis note, advice, referral flag) — encrypted at rest, visible to the patient, forms the basis of the medical record.
9. **Ratings & trust** — post-consult rating both directions; feeds into dispatch ranking and doctor quality monitoring.
10. **Admin/Ops console** — live map of active requests, doctor roster management, license expiry alerts, manual dispute/refund handling, daily ops metrics.
11. **Compliance layer** — consent capture at signup, audit log of who accessed a patient record and when, encryption at rest for medical notes, data retention policy enforced in code, not just policy.

**Explicitly out of scope for MVP** (defer to Phase 4/5): native apps, insurance/NHIF-SHA billing integration, e-pharmacy fulfillment, lab test dispatch, multi-language beyond English/Swahili, doctor-to-doctor referral network.

---

## 6. Database Schema (Outline)

Core tables — designed so the same schema serves web MVP and future native apps without migration:

- `users` (id, phone, role[patient/doctor/admin], name, created_at)
- `patient_profiles` (user_id, default_location, dob, notes)
- `doctor_profiles` (user_id, kmpdc_license_no, specialty, verification_status, verified_at, bio, payout_details)
- `doctor_verifications` (doctor_id, license_no, checked_at, status, checked_by, source[manual/api])
- `requests` (id, patient_id, type[teleconsult/home_visit], status, symptoms_summary, location geography(Point), created_at)
- `dispatch_offers` (request_id, doctor_id, offered_at, responded_at, response[accepted/declined/timeout])
- `consultations` (request_id, doctor_id, started_at, ended_at, notes_encrypted, diagnosis_tags, referral_flag)
- `payments` (request_id, amount, mpesa_receipt, status, doctor_payout_status)
- `ratings` (request_id, rated_by, rating, comment)
- `audit_log` (actor_id, action, target_table, target_id, timestamp) — for Data Protection Act compliance

---

## 7. Dispatch Algorithm (MVP version)

1. On new request, query `doctor_profiles` where `verification_status = 'verified'` and `availability = 'online'`, within radius R of patient location (start R small, expand if no match).
2. Rank candidates: proximity (weight highest for home visits, less for teleconsult), rating, recent acceptance rate, current load (avoid always hammering the same doctor).
3. Offer to top candidate, start timeout timer (e.g. 30s).
4. On decline/timeout → offer next candidate; log each cycle for later tuning.
5. On accept → lock request to that doctor, notify patient, start tracking (home visit) or generate video room token (teleconsult).
6. Escalate to admin console if no doctor accepts within N cycles — this signal is exactly what tells you where supply is short, which matters for both ops and the funding narrative.

This can run as a simple synchronous service for pilot volume — no need for a dedicated matching microservice until scale demands it.

---

## 8. Milestone Timeline (Phase 1 — Web MVP, ~12 weeks)

| Weeks | Milestone |
|---|---|
| 1–2 | Finalize scope, pilot area, clinical/legal anchor conversations started, schema design, environment setup |
| 3–4 | Auth, patient onboarding, doctor onboarding + verification flow |
| 5–6 | Request flow, dispatch engine (offer/accept/timeout), admin console v1 |
| 7–8 | M-Pesa integration (STK Push + B2C payouts), live tracking for home visits |
| 9 | Teleconsultation video integration |
| 10 | Ratings, consultation notes, audit logging, compliance pass |
| 11 | Internal QA, load-test dispatch with simulated concurrent requests, security review |
| 12 | Soft launch with a small doctor roster (5–10 doctors) in the pilot area |

---

## 9. Team & Roles Needed

- 1 full-stack lead (you) — architecture, backend, dispatch logic, payments integration
- 1 frontend developer — patient/doctor web UIs
- 1 part-time ops/QA person during pilot — doctor onboarding verification, dispute handling, monitoring
- Clinical advisor (client-side) — triage question design, consultation note structure, medical liability sign-off
- Legal/compliance advisor (client-side or contracted) — KMPDC virtual institution registration, ODPC data handler certification, terms of service and consent language

---

## 10. Metrics to Instrument From Day One (These Drive the Funding Pitch)

- Requests per day, by type (teleconsult vs home visit)
- Median time-to-accept and time-to-connect/arrive
- Conversion: request → completed consult → paid
- Repeat usage rate (7-day, 30-day)
- Doctor acceptance rate and active roster size
- Gross transaction value and take-rate revenue
- Patient rating average and complaint/refund rate

Build a simple internal metrics dashboard (even a Supabase view + a lightweight admin chart) — this becomes the traction slide in the investor deck, so it needs to exist before you need it, not be reconstructed from raw logs later.

---

## 11. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Doctor supply thin at launch | Start with teleconsult-only or a very tight pilot radius; recruit doctors directly, possibly moonlighting arrangements |
| Regulatory ambiguity (telemedicine law still developing) | Anchor to a registered facility, follow KMPDC e-health guidance, get ODPC certification early — don't wait for full legal clarity to pilot, but don't skip the steps that exist today |
| Clinical liability | Clear consent flow, doctor professional indemnity insurance requirement at onboarding, referral-to-facility flag for anything beyond teleconsult scope |
| Connectivity (video calls on patchy mobile data) | Voice-fallback on the video call, SMS-based status updates as backup channel |
| Trust/safety for home visits (stranger at your door / at a doctor's next stop) | Doctor ID verification shown to patient pre-arrival, live tracking, two-way rating, in-app support/panic contact |
| Payment disputes | Charge-on-completion by default for pilot, clear refund policy, admin console dispute tooling from day one |

---

## 12. From Pilot to Native Apps

The web MVP is deliberately built API-first: the dispatch engine, auth, payments, and video session logic all live behind the same API the native apps will consume later. When funding is secured, Phase 4 becomes primarily a **frontend rebuild** (React Native, sharing business logic and API contracts with the web app) rather than a backend rebuild — this is what keeps the "web first, app later" sequencing genuinely cheap rather than a redo.
