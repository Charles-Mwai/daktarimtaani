# Daktari Mtaani

Daktari Mtaani is a Next.js + Prisma healthcare dispatch platform for Kenya, covering teleconsultation, home visits, and ambulance coordination.

## Product overview

The application supports:

- patient signup and login
- doctor onboarding and verification
- teleconsult request flow
- home-visit request flow
- ambulance request creation and dispatch matching
- ambulance fleet onboarding and dispatch status updates
- patient tracking for live ambulance ETA and status
- admin ops dashboards for doctors, requests, and ambulance fleet

## Tech stack

- Next.js 14 (App Router)
- TypeScript
- Prisma ORM
- SQLite for local development
- Tailwind CSS

## Prerequisites

- Node.js 18+
- npm
- Git

## Local setup

1. Install dependencies

```bash
npm install
```

2. Create environment variables

```bash
cp .env.example .env
```

Then update `.env` with the required values, including a secure JWT secret if the app is using auth tokens in your environment.

3. Generate the Prisma client and push the schema

```bash
npx prisma generate
npx prisma db push
```

4. Seed the database

```bash
npm run seed
```

5. Start the app

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

## Useful scripts

- `npm run dev` — run the app in development mode
- `npm run build` — run the production build
- `npm run seed` — seed the database with demo data
- `npx prisma generate` — generate the Prisma client
- `npx prisma db push` — sync the Prisma schema with SQLite

## Core user journeys

### 1. Patient request journey

1. Patient selects a service: teleconsult, home visit, or ambulance.
2. Patient fills the request form with symptoms, address, and urgency.
3. The app creates a request record and redirects the patient to a tracking page.
4. The patient sees the matching status and, for ambulance requests, the live dispatch timeline and ETA.
5. Once the request is complete, the patient is guided to the payment step to confirm the service.

### 2. Doctor assignment journey

1. The dispatch engine scans verified doctors and ranks them by proximity and availability.
2. A pending offer is created for the best candidate.
3. The doctor accepts the request from the doctor console.
4. The patient sees the accepted doctor profile and can proceed with consultation or visit tracking.
5. The doctor completes the consultation and the summary becomes available for the patient.

### 3. Ambulance dispatch journey

1. The admin verifies an ambulance unit in the ambulance console.
2. A patient requests ambulance transport from the request flow.
3. The app matches the request to the nearest available verified unit.
4. The ambulance dispatch appears in the admin panel with active status controls.
5. Operators move the status from assigned to en route, arrived, and complete.
6. The patient UI updates automatically and guides the user to payment after completion.

## Ambulance feature

The ambulance workflow supports:

- ambulance unit onboarding from the admin console
- verification of ambulance vehicles before dispatch eligibility
- automatic request matching to available verified units
- active dispatch tracking for patient, admin, and fleet ops
- status transitions:
  - assigned
  - en route
  - arrived
  - complete
  - cancelled
- patient-facing tracking and ETA updates
- completion flow that leads to payment on the patient UI

### Admin ambulance console

The admin ambulance dashboard allows operators to:

- onboard new ambulance units
- verify or mark units pending
- see active ambulance requests
- update dispatch state directly from the console
- cancel a dispatch when needed

## Data reset

To reset the local database:

```bash
rm -f prisma/dev.db
npx prisma db push
npm run seed
```

## Notes

- SQLite is used by default for local development in `prisma/schema.prisma`.
- This is a prototype and can be extended with real live GPS feeds, external dispatch APIs, or production-grade auth and notifications.
- The ambulance logic is already modeled in Prisma with `AmbulanceUnit` and `AmbulanceDispatch`, and the app routes are wired to support dispatch operations from the dashboard.
