# 🏥 Klinik MediQueue

A clinic queue and patient management system, built step by step while learning full-stack development.

Receptionists register patients and book them into today's queue. The queue page shows who is being served and updates automatically on every screen.

## Tech stack
| Layer | Technology |
|---|---|
| Frontend | HTML, CSS, JavaScript (Fetch API) — Next.js version coming next |
| Backend | NestJS 12 (TypeScript), REST API, class-validator |
| Database | PostgreSQL 18 with TypeORM |
| Tools | Git, GitHub, VS Code REST Client |

## Project structure
```
clinic-app/
├── backend/   NestJS REST API (patients, appointments)
├── db/        PostgreSQL schema and indexes
├── web/       Queue page and patients page
└── basics/    JavaScript practice scripts
```

## Features
- **Patients:** register and list patients, with validation (IC number format, age 0–120) and duplicate IC detection
- **Appointments:** book patients into today's queue with automatic queue numbers and fees (child / adult / senior)
- **Live queue:** call and complete patients; only one patient can be "called" at a time; screens refresh every 5 seconds
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

**3. Web pages**
- Open `web/index.html` with the VS Code **Live Server** extension (port 5500)

**4. Test the API**
- Use `backend/requests.http` with the VS Code **REST Client** extension

## What I learned
- **Query optimisation:** PostgreSQL does not index foreign keys automatically. Adding an index on `appointments.patient_id` made patient-history queries much faster on 1 million rows (measured with `EXPLAIN ANALYZE`)
- **Validation & security:** NestJS `ValidationPipe` with `whitelist` blocks unexpected fields (mass assignment)
- **CORS:** why browsers block cross-origin requests, and allowing only trusted origins
- **Secrets:** keeping passwords out of Git with `.env` and `.env.example`
- **Git workflow:** feature branches, pull requests and merging

## Roadmap
- [ ] Rebuild the frontend with Next.js (React)
- [ ] Real-time queue updates with WebSockets
- [ ] Legacy hospital system integration (PHP Yii2 + MariaDB)
- [ ] Docker, CI/CD and deployment to AWS
- [ ] AI assistant (RAG with Ollama + Qdrant)