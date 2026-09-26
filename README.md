# 🏥 Klinik MediQueue

[![CI](https://github.com/PijoyXryo/clinic-app/actions/workflows/ci.yml/badge.svg)](https://github.com/PijoyXryo/clinic-app/actions/workflows/ci.yml)

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
- **AI assistant:** answers questions about hours, fees and policies from clinic documents using RAG (Ollama + Qdrant), with sources and an "I don't know" guardrail
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
| POST | `/ai/ingest` | Load clinic documents (`backend/knowledge/`) into Qdrant |
| POST | `/ai/ask` | Ask the clinic assistant (RAG) |

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
| Qdrant dashboard | http://localhost:6333/dashboard |
| Ollama | http://localhost:11434 |

First time only, download the AI models and load the documents:
```bash
docker compose exec ollama ollama pull nomic-embed-text
docker compose exec ollama ollama pull llama3.2:1b
```
Then send `POST http://localhost:3000/ai/ingest`.

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

## Run in production mode with PM2
```bash
npm install -g pm2
cd backend && npm ci && npm run build && cd ..
cd frontend && npm ci && npm run build && cd ..
pm2 start ecosystem.config.cjs
pm2 status        # both apps "online"
pm2 monit         # live CPU / memory / logs
```
The API auto-restarts on crash and when memory exceeds 300 MB. It runs as a single instance because of WebSockets (scaling out would need the Socket.IO Redis adapter).

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
- **RAG:** chunking, embeddings, vector search in Qdrant, prompt grounding with a similarity threshold to prevent hallucination
- **PM2:** production builds, auto-restart on crash, memory limits, reading logs and finding which process holds a port
- **CI/CD:** GitHub Actions runs type-check, lint, build, PHP syntax check and Docker builds on every push and pull request (a Bitbucket Pipelines version is in `bitbucket-pipelines.yml`)
- **Git workflow:** feature branches, pull requests and merging

## Roadmap
- [x] Rebuild the frontend with Next.js (React)
- [x] Real-time queue updates with WebSockets
- [x] Legacy hospital system integration (PHP Yii2 + MariaDB)
- [x] Docker (all 5 services with Docker Compose)
- [x] Production process management with PM2
- [x] CI with GitHub Actions (+ Bitbucket Pipelines config)
- [ ] Deployment to AWS (EC2 + S3)
- [x] AI assistant (RAG with Ollama + Qdrant)