\# Quimbielle



A digital autofill platform for Tunisian commercial paper forms (Kambiale / Lettre de Change).



\## Prerequisites



\- Node.js v20+

\- pnpm v8+

\- PostgreSQL 16+ (running on port 5432)



\## Quickstart



\### 1. Clone and install



```bash

git clone https://github.com/YOUR\_USERNAME/quimbielle.git

cd quimbielle

pnpm install

pnpm approve-builds

pnpm install

```



\### 2. Environment variables



Create `.env` in `apps/api/`:

DATABASE\_URL="postgresql://postgres:postgres@localhost:5432/quimbielle"



JWT\_SECRET="your-long-random-secret"

\### 3. Database setup



```bash

cd apps/api

npx prisma migrate dev --name init

npx prisma generate

```



\### 4. Add the Kambiale form image



Place the blank Kambiale form scan at:

apps/web/public/kambiale.png

\### 5. Run the project



Open two terminals:



Terminal 1 — API:

```bash

cd apps/api

pnpm dev

```



Terminal 2 — Web:

```bash

cd apps/web

pnpm dev

```



Open http://localhost:5173 in your browser.



\## Running tests



```bash

cd apps/web

pnpm test

```



\## Creating an admin account



After registering, use Prisma Studio to set isAdmin to true:



```bash

cd apps/api

npx prisma studio

```



Open http://localhost:5555, click User, find your account, set isAdmin to true, save.



\## Project structure

quimbielle/



├── apps/



│   ├── api/          # Express + Prisma backend (port 3000)



│   └── web/          # React + Vite frontend (port 5173)



└── packages/



├── types/        # Shared TypeScript types



├── pdf/          # PDF generation logic



└── config/       # Shared config

\## Features



\- JWT authentication (register, login, logout)

\- Kambiale form overlay with draggable/resizable fields

\- PDF export with precise coordinate mapping

\- Form history with pagination

\- Field validation (RIB modulo-97, date format, amount)

\- Admin panel (users + all forms)



\## Known limitations



\- Print calibration requires manual measurement per printer

\- PDF coordinates may need adjustment depending on printer margins

\- Arabic text rendering in PDF requires additional font configuration

