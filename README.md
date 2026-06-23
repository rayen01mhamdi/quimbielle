# Quimbielle

Digital autofill platform for Tunisian commercial paper forms (**Kambiale / Lettre de Change**).

Quimbielle allows users to fill, manage, and export Kambiale forms digitally while preserving the layout of official paper documents.

---

## Prerequisites

Before getting started, ensure the following software is installed:

* Node.js 20+
* pnpm 8+
* PostgreSQL 16+ (running on port 5432)

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/quimbielle.git
cd quimbielle
```

### 2. Install dependencies

```bash
pnpm install
pnpm approve-builds
pnpm install
```

---

## Environment Configuration

Create a `.env` file inside `apps/api/`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/quimbielle"
JWT_SECRET="your-long-random-secret"
```

---

## Database Setup

Navigate to the API application and initialize the database:

```bash
cd apps/api

npx prisma migrate dev --name init
npx prisma generate
```

---

## Kambiale Form Template

Place the blank Kambiale form image at:

```text
apps/web/public/kambiale.png
```

This image is used as the base template for form editing and PDF generation.

---

## Running the Application

Start the backend and frontend in separate terminals.

### Terminal 1 — API Server

```bash
cd apps/api
pnpm dev
```

The API will be available at:

```text
http://localhost:3000
```

### Terminal 2 — Web Application

```bash
cd apps/web
pnpm dev
```

The frontend will be available at:

```text
http://localhost:5173
```

Open the URL above in your browser to access the application.

---

## Running Tests

Frontend tests can be executed with:

```bash
cd apps/web
pnpm test
```

---

## Creating an Administrator Account

1. Register a user account through the application.
2. Open Prisma Studio:

```bash
cd apps/api
npx prisma studio
```

3. Open:

```text
http://localhost:5555
```

4. Select the `User` table.
5. Locate your account.
6. Change the `isAdmin` field to `true`.
7. Save the record.

---

## Project Structure

```text
quimbielle/
├── apps/
│   ├── api/              # Express + Prisma backend
│   └── web/              # React + Vite frontend
│
└── packages/
    ├── types/            # Shared TypeScript types
    ├── pdf/              # PDF generation utilities
    └── config/           # Shared configuration
```

---

## Features

* JWT authentication

  * User registration
  * Login
  * Logout

* Interactive Kambiale editor

  * Draggable fields
  * Resizable fields
  * Precise positioning

* PDF generation

  * Coordinate-based field mapping
  * Printable output

* Form management

  * Saved form history
  * Pagination support

* Data validation

  * RIB modulo-97 validation
  * Date validation
  * Amount validation

* Administration tools

  * User management
  * Access to all submitted forms

---

## Known Limitations

* Print calibration may require adjustment for different printers.
* PDF positioning can vary depending on printer margins and scaling settings.
* Arabic text rendering requires additional font configuration for optimal output.

---

## Technology Stack

### Frontend

* React
* TypeScript
* Vite

### Backend

* Express
* Prisma ORM
* PostgreSQL

### Authentication

* JWT (JSON Web Tokens)

---

## License

Specify your project's license here (MIT, Apache-2.0, Proprietary, etc.).
