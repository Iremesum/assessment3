# Assessment 3 – RSS Server

This project extends the RSS Server developed in earlier assessments.

Assessment 3 adds real database persistence, authentication, operational monitoring, observability, automated testing, and Docker-based deployment.

The application uses a Next.js frontend and backend. Posts are stored in SQLite using Sequelize and published as RSS XML for use by an LMS or RSS client.

## Technology

- Next.js, React, TypeScript, Tailwind CSS
- SQLite and Sequelize
- JWT authentication
- OpenTelemetry, Jaeger, Zipkin, Prometheus
- Playwright, JMeter, Lighthouse
- Docker and AWS EC2

## Main Features

Users can:

- view and search announcements
- expand announcements or open a full page
- access the RSS XML feed

Authenticated administrators can:

- create announcements
- edit announcements
- delete announcements

The dashboard displays server health, database status, request counts, failed requests, response times, unique clients and recent requests.

## Architecture

```text
Browser
   ↓
Frontend
   ↓
Backend API
   ↓
Sequelize
   ↓
SQLite
```

Published posts are converted into RSS XML through `/api/rss`.

## Frontend and Backend

### Frontend
The frontend is built with Next.js, React, TypeScript and Tailwind CSS. It provides the dashboard, RSS feed pages, login, search, and announcement management interface.

### Backend
The backend is built with Next.js API routes and TypeScript. It handles authentication, CRUD operations, RSS XML generation, health checks, request metrics, and communication with SQLite through Sequelize.

## Testing and Observability

Playwright is used for end-to-end testing, including:

```text
login → create → edit → delete
```

JMeter is used for RSS load testing. A 10,000-request test completed with 0% HTTP errors, although response times increased under heavy load.

Lighthouse is used for frontend quality checks. Dashboard accessibility improved from 94 to 98, while performance improved from 98 to 100.

OpenTelemetry instruments important backend requests. Jaeger and Zipkin are used for tracing, and Prometheus is used for metrics.

## Running Locally

Backend:

```bash
cd backend
npm install
npm run dev
```

Frontend:

```bash
cd frontend
npm install
npm run dev -- -p 3001
```

Frontend runs on `http://localhost:3001` and backend on `http://localhost:3000`.

## Docker and Deployment

The project includes Dockerfiles for the frontend and backend and a Docker Compose configuration.

```bash
docker compose build
docker compose up -d
```

SQLite uses a persistent Docker volume.

The final application is deployed to AWS EC2. URLs are configured through environment variables so the deployed application does not depend on localhost.