# RSS Server + LMS Frontend

Assessment 3 for CSE5006 Cloud Web Applications.

This project is the third stage of a multi-assessment RSS Server project. It began as a frontend-only application and was later extended with a backend API, database persistence, authentication, observability, testing, and Docker deployment.

## Project Progression

### Assessment 1
Focused on frontend design, usability, and accessibility.

Main features:
- Next.js / React frontend
- Responsive navigation
- Light/dark theme
- Announcement cards and search
- Create, edit, and delete announcements
- localStorage persistence
- Dynamic `/feeds/[id]` pages

### Assessment 2
Introduced the backend and database layer.

Main additions:
- Next.js backend API
- SQLite database
- Sequelize ORM
- CRUD API endpoints
- RSS XML generation
- Docker deployment
- Health and request-count endpoints

### Assessment 3
Extends the system with:
- Authenticated Create/Edit/Delete
- JWT authentication using HTTP-only cookies
- Persistent request logging
- Real database health checks
- Operational dashboard
- OpenTelemetry instrumentation
- Jaeger and Zipkin tracing
- Prometheus metrics
- Playwright end-to-end testing
- JMeter load testing
- Lighthouse testing
- Production Docker configuration
- AWS EC2 deployment

## Architecture

Browser
↓
Frontend
↓
Backend API
↓
Sequelize
↓
SQLite

Published posts are also exposed as RSS:

SQLite → `/api/rss` → RSS XML → LMS / RSS Client

## Frontend

Built with Next.js, React, TypeScript, and Tailwind CSS.

Main features include:
- Operational dashboard
- RSS announcement list
- Search and expand/collapse
- Full announcement pages
- Login/logout
- Authenticated create/edit/delete

## Backend

Built with Next.js API routes and TypeScript.

The backend handles:
- CRUD operations
- Authentication
- RSS XML generation
- SQLite access through Sequelize
- Health checks
- Request logging and metrics
- OpenTelemetry tracing

## Testing and Observability

Playwright is used for end-to-end testing, including:

Login → Create → Edit → Delete

JMeter is used for RSS load testing. A 10,000-request test completed with 0% HTTP errors, although response time increased under heavy load.

Lighthouse dashboard scores improved from:
- Performance: 98 → 100
- Accessibility: 94 → 98
- Best Practices: 100
- SEO: 100

OpenTelemetry instruments important API requests. Jaeger and Zipkin are used for tracing, while Prometheus is used for metrics.

## Running Locally

Backend:

cd backend
npm install
npm run dev

Frontend:

cd frontend
npm install
npm run dev -- -p 3001

Frontend: http://localhost:3001
Backend: http://localhost:3000

## Docker and Deployment

Build and start:

docker compose build
docker compose up -d

Frontend runs on port 3001 and backend on port 3000.

SQLite uses a persistent Docker volume.

The final application is deployed to AWS EC2. Environment variables are used for frontend and backend URLs so the deployed application does not depend on localhost.
