# Zealthy Mini-EMR

A tiny EMR admin + patient portal built with Next.js and Prisma.

## Tech
- Next.js 15 (App Router, Server Actions)
- Prisma + SQLite
- Tailwind CSS

## Live Routes
- Admin home: `/admin`
- Patient detail (CRUD): `/admin/patients/[id]`
- Patient portal (summary, next 7 days): `/portal`
- Patient portal (full view): `/portal/[id]`

## How to Run Locally
```bash
git clone https://github.com/sravyathotakuri/zealthy-mini-emr.git
cd zealthy-mini-emr
cp .env.example .env
# For SQLite:
# DATABASE_URL="file:./dev.db"

npm i
npx prisma migrate reset   # Press y when prompted (runs seed automatically)
npm run dev -- -p 3001

## Architecture
```mermaid
flowchart LR
  subgraph Admin_App
    A[Admin UI (Next.js App Router)]
    B[Server Actions - CRUD]
  end

  subgraph Patient_Portal
    C[Portal Pages (Next.js)]
    D[Server Actions - Queries]
  end

  subgraph Backend
    E[Prisma Client]
    F[(SQLite dev.db)]
  end

  A --> B --> E --> F
  C --> D --> E
