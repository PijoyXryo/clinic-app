# 🏥 Klinik MediQueue

A clinic queue and patient management system, built step by step while learning full-stack development.

Receptionists register patients and book them into today's queue. The queue page shows who is being served and updates automatically on every screen.

## Tech stack
| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (React 19, TypeScript) |
| Backend | NestJS 12 (TypeScript), REST API, class-validator |
| Database | PostgreSQL 18 with TypeORM |
| Tools | Git, GitHub, VS Code REST Client |

## Project structure
```
clinic-app/
├── backend/   NestJS REST API (patients, appointments)
├── frontend/  Next.js app (queue page, patients page)
├── db/        PostgreSQL schema and migrations
├── legacy-his/ Legacy hospital system (PHP Yii2 + MariaDB)
└── basics/    JavaScript practice scripts
```

## Features
- **Patients:** register and list patients, with validation (IC number format and date), date of birth and age calculated automatically from the IC, and duplicate IC detection
- **Appointments:** book patients into today's queue with automatic queue numbers and fees (child / adult / senior)
- **Live queue:** call and complete patients; only one patient can be "called" at a time; screens update instantly via WebSockets (Socket.IO) and reconnect automatically
- **Hospital integration:** imports patients from a legacy PHP (Yii2) + MariaDB hospital system via REST, with API key auth, timeouts, and graceful fallback when it's down
- **Security:** input whitelist (blocks mass assignment), CORS restricted to the web app, secrets kept in `.env`

## API endpoints
| Method | Endpoint | Description |
|---|---|---|
| GET | `/patients` | Newest 50 patients |
| GET | `/patients/:id` | One patient (404 if not found) |
| POST | `/patients` | Register a patient (400 invalid, 409 duplicate IC) |
| GET | `/appointments/today` | Today's queue with patient details |
| POST | `/appointments` | Book a patient into today's queue |
| PATCH | `/appointments/:id/status` | Set status: `waiting`, `called`, `done` |
| GET | `/patients/by-ic/:icNumber` | Find a patient by IC (used by check-in) |
| GET | `/his/patients` | Preview hospital (legacy) patients |
| POST | `/his/sync` | Import all hospital patients (idempotent) |
| POST | `/his/import/:icNumber` | Import one patient by IC |

## Run with Docker (easiest)
Requires [Docker Desktop](https://www.docker.com/products/docker-desktop/).
```bash
docker compose up --build
```
Then open http://localhost:3001 and import hospital patients with `POST http://localhost:3000/his/sync`.

| Service | URL / port |
|---|---|
| Website (Next.js) | http://localhost:3001 |
| API (NestJS) | http://localhost:3000 |
| Hospital API (Yii2) | http://localhost:8080 |
| PostgreSQL | localhost:5433 |
| MariaDB | localhost:3307 |

## Run it locally
**1. Database**
- Install PostgreSQL, create a database named `clinic`, and run `db/schema.sql`

**2. Backend**
```bash
cd backend
cp .env.example .env    # then put your real database password in .env
npm install
npm run start:dev       # API on http://localhost:3000
```

**3. Frontend**
```bash
cd frontend
npm install
npm run dev             # website on http://localhost:3001
```

**4. Test the API**
- Use `backend/requests.http` with the VS Code **REST Client** extension

**Daily startup (all services)**

| # | Service | How |
|---|---|---|
| 1 | PostgreSQL (clinic DB) | Starts automatically with Windows |
| 2 | MariaDB (hospital DB) | XAMPP Control Panel → MySQL → Start |
| 3 | Legacy hospital API (port 8080) | `cd legacy-his` → `php -S 127.0.0.1:8080 -t web web/index.php` |
| 4 | Backend API (port 3000) | `cd backend` → `npm run start:dev` |
| 5 | Frontend (port 3001) | `cd frontend` → `npm run dev` |

Then open http://localhost:3001

## What I learned
- **Query optimisation:** PostgreSQL does not index foreign keys automatically. Adding an index on `appointments.patient_id` made patient-history queries much faster on 1 million rows (measured with `EXPLAIN ANALYZE`)
- **Validation & security:** NestJS `ValidationPipe` with `whitelist` blocks unexpected fields (mass assignment)
- **CORS:** why browsers block cross-origin requests, and allowing only trusted origins
- **Secrets:** keeping passwords out of Git with `.env` and `.env.example`
- **Refactoring:** replaced a stored `age` column (goes stale every birthday) with `date_of_birth` derived from the IC, using a database migration
- **React:** Server vs Client Components, `useState`, `useEffect` with cleanup, lifting state up
- **Integration:** connecting to a legacy system with timeouts, 502/504 error handling, data mapping and graceful degradation
- **WebSockets:** replaced 5-second polling with server push; the client reloads the full state after reconnecting
- **Docker:** multi-stage Dockerfiles, Compose with health checks, container networking by service name
- **Git workflow:** feature branches, pull requests and merging

## Roadmap
- [x] Rebuild the frontend with Next.js (React)
- [x] Real-time queue updates with WebSockets
- [x] Legacy hospital system integration (PHP Yii2 + MariaDB)
- [x] Docker (all 5 services with Docker Compose)
- [ ] CI/CD and deployment to AWS
- [ ] AI assistant (RAG with Ollama + Qdrant)