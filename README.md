# Quimbielle — Lettre de Change Digital

Quimbielle is a digital autofill platform for Tunisian commercial paper forms (Kambiale / Lettre de Change). Instead of filling these standardized bank-issued forms by hand or typewriter, users type values into a digital overlay, and the app generates a precise PDF that prints exactly on top of the blank physical form.

---

## Tech Stack

- **Frontend:** React + Vite + TypeScript
- **Backend:** Node.js + Express + TypeScript
- **Database:** PostgreSQL + Prisma ORM
- **Monorepo:** Turborepo + pnpm workspaces
- **Testing:** Vitest + Supertest

---

## Prerequisites

- Node.js v20+
- pnpm v8+
- PostgreSQL 16+ (running on port 5432)

---

## Quickstart

### 1. Clone and install

```bash
git clone https://github.com/rayen01mhamdi/quimbielle.git
cd quimbielle
pnpm install
pnpm approve-builds
pnpm install
```

### 2. Environment variables

Create a `.env` file inside `apps/api/`:

```bash
cp .env.example apps/api/.env
```

Edit `apps/api/.env` and set:
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/quimbielle"
JWT_SECRET="change-this-to-a-long-random-secret"
PORT=3000

### 3. Database setup

```bash
cd apps/api
npx prisma migrate dev --name init
pnpm seed
cd ../..
```

The seed script creates:
- Admin account: `admin@quimbielle.tn` / `admin123`
- Test user: `user@quimbielle.tn` / `user123`
- Default Kambiale template

### 4. Add the Kambiale form image

Place your blank Kambiale form scan at:
apps/web/public/kambiale.png

The image should be a high-resolution scan of the blank physical form (recommended: 1280×824px or similar landscape ratio).

### 5. Start the project

```bash
pnpm dev
```

This starts both the API (port 3000) and the web app (port 5173).

Open your browser at: **http://localhost:5173**

---

## Running Tests

Run all tests from the root:

```bash
pnpm test
```

- **API:** 11 Supertest integration tests (auth, forms, routes)
- **Web:** 7 unit tests (form validation, RIB modulo-97)

---

## Project Structure
quimbielle/
├── apps/
│   ├── api/                    # Express + Prisma backend (port 3000)
│   │   ├── prisma/
│   │   │   ├── schema.prisma   # 5 models: User, Form, FormTemplate, FieldPosition, UserSettings
│   │   │   ├── migrations/     # Database migrations
│   │   │   └── seed.ts         # Default users and template
│   │   └── src/
│   │       ├── routes/         # Thin route handlers
│   │       ├── services/       # Business logic (auth, forms, admin, csv, calibration)
│   │       ├── middleware/     # JWT authentication, admin guard
│   │       └── lib/            # Shared Prisma client
│   └── web/                    # React + Vite frontend (port 5173)
│       └── src/
│           ├── pages/          # Login, Register, Dashboard, History, Admin, CSV, Calibration
│           ├── hooks/          # useAuth, useValidation
│           └── api/            # Typed API client
└── packages/
├── types/                  # Shared TypeScript types + validateForm()
├── pdf/                    # jsPDF generation: generateFilledPDF, numToFr, numToAr
└── config/                 # Shared configuration

---

## Features

### Authentication
- Register / Login with JWT (7-day expiry)
- Protected routes — unauthenticated users redirected to login
- Admin role with server-side enforcement

### Form Editor (Dashboard)
- Kambiale form image as background
- Draggable and resizable field boxes in edit mode
- Live coordinate display during drag
- Auto-lettres: converts numeric amount to French words automatically
- Sync fields: montant and échéance auto-sync across duplicate fields
- PDF export with calibration offset correction

### Form History
- Paginated list of all saved forms
- Search by beneficiary name
- Reopen a saved form into the editor
- Duplicate a form
- Delete a form

### Validation
- Client-side + server-side validation (same function from `packages/types`)
- RIB validation: 20 digits + modulo-97 key check
- Date format: DD/MM/YYYY
- Required fields: beneficiary, amount

### Admin Panel (`/admin`)
- View all users with form counts
- View all forms across all users
- Server-side access control (403 for non-admins)

### CSV Batch Export (`/csv`)
- Upload a CSV file (one row = one Kambiale)
- Each valid row generates a PDF
- All PDFs returned as a single ZIP archive
- Invalid rows reported with row number and error details

**CSV format:**
ordrePayer,montant1,echeance1,ribTireur,ribTire,tireur,lieuCreation,dateCreation
Ben Ali Mohamed,1500,01/12/2025,12345678901234567890,12345678901234567890,Societe ABC,Tunis,01/01/2025

### Print Calibration (`/calibration`)
- Download a 1cm grid PDF to measure printer offset
- Enter X/Y correction values in centimeters
- All PDF exports automatically apply the correction

---

## Default Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@quimbielle.tn | admin123 |
| User | user@quimbielle.tn | user123 |

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/register | Register new user |
| POST | /auth/login | Login |
| GET | /api/me | Get current user (DB) |
| GET | /api/forms | List forms (paginated + search) |
| POST | /api/forms | Save a form |
| GET | /api/forms/:id | Get one form with positions |
| DELETE | /api/forms/:id | Delete a form |
| POST | /api/forms/:id/duplicate | Duplicate a form |
| POST | /api/forms/csv | CSV batch → ZIP |
| GET | /api/calibration | Get printer offsets |
| PATCH | /api/calibration | Save printer offsets |
| GET | /api/calibration/grid | Download 1cm grid PDF |
| GET | /api/settings | Get user settings |
| PATCH | /api/settings | Update user settings |
| GET | /api/admin/users | All users (admin only) |
| GET | /api/admin/forms | All forms (admin only) |

---

## Security

- All routes protected with JWT Bearer token
- Admin routes double-protected: route guard in React + `requireAdmin` middleware on API
- Rate limiting on auth endpoints (50 requests / 15 minutes)
- Passwords hashed with bcrypt (10 rounds)
- Server-side input validation on all POST routes
- RIB modulo-97 check on both frontend and API

---

## Known Limitations

- Arabic text in PDF export is not supported (jsPDF lacks Arabic font embedding)
- Print calibration requires manual measurement per printer model
- No email verification on registration
- JWT logout is client-side only (token deletion)

---

## ⚠️ Before Production

1. Change `JWT_SECRET` in `.env` to a long random string
2. Change default admin and user passwords
3. Set up HTTPS
4. Configure CORS for your production domain in `apps/api/src/index.ts`
5. Use a managed PostgreSQL instance (not localhost)