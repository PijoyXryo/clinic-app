# 🏥 Klinik MediQueue

A clinic queue and patient management system, built step by step while learning full-stack development.

## Tech stack
- **Frontend:** HTML, CSS, JavaScript (Next.js coming soon)
- **Backend:** NestJS (TypeScript), REST API with validation
- **Database:** PostgreSQL with TypeORM (schema in `db/schema.sql`)

## Project structure
```
clinic-app/
├── backend/   NestJS API
├── db/        PostgreSQL schema
├── web/       Queue web page
└── basics/    JavaScript practice scripts
```

## Features so far
- Patients API: list, get by id, register (`GET/POST /patients`)
- Input validation (IC number format, age range) and duplicate IC detection (409)
- Appointments table linked to patients, with indexes for fast queries
- Queue web page with live status updates

## Run it locally
1. Create a PostgreSQL database named `clinic` and run `db/schema.sql`
2. Start the backend:
```bash
   cd backend
   cp .env.example .env    # then put your real DB password in .env
   npm install
   npm run start:dev
```
3. Test the API with `backend/requests.http` (VS Code REST Client extension)

## What I learned
- Query optimisation: an index on `appointments.patient_id` made patient-history queries much faster on 1 million rows (checked with `EXPLAIN ANALYZE`)
- Protecting against mass assignment with NestJS `ValidationPipe` whitelist
- Keeping secrets out of Git with `.env` and `.env.example`