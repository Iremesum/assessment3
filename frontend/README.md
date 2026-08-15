# RSS Server + LMS — Assessment 2

**GitHub Repository:** https://github.com/Iremesum/assessment2

Assessment 2 for CSE5006 Cloud Web Applications — extends the Assessment 1
frontend with a full backend: a database, CRUD API, operational monitoring
endpoints, a validated RSS feed, and Docker-based deployment.

## Architecture

This project has two separate applications:

- **`api/`** — the RSS Server: handles the database, CRUD API routes, and
  operational endpoints. Built with Next.js and Sequelize.
- **`frontend/`** — the RSS Client: the user-facing website, extended from
  Assessment 1, which fetches and displays live data from the RSS Server.

Both run as separate Docker containers, connected via `docker-compose.yml`,
alongside a small container that holds the shared SQLite database volume.

## Features

- **Database**: SQLite, managed via the Sequelize ORM. A `Post` model stores
  title, author, content, summary, an optional image, an optional link, and
  a published/draft status.
- **CRUD API** (`/api/feed`): full Create, Read, Update, and Delete support.
- **Operational endpoints**: `/api/health` (server status) and `/api/count`
  (request tracking).
- **RSS feed** (`/api/rss`): outputs a W3C-validated RSS 2.0 feed.
- **RSS Client**: the frontend, reusing Assessment 1's Header, Navbar,
  Footer, Breadcrumbs, and theme toggle, now pulling live data from the
  backend instead of localStorage.
- **Dockerized**: both apps run in separate containers, orchestrated via
  Docker Compose.
- **Deployed**: runs live on an AWS EC2 instance.

## Getting Started (local development)

Each app needs its own dependencies installed and run separately:

\`\`\`bash
cd api
npm install
npx sequelize-cli db:migrate
npm run dev
\`\`\`

\`\`\`bash
cd frontend
npm install
npm run dev -- -p 3001
\`\`\`

Or run both together via Docker:

\`\`\`bash
docker-compose build --no-cache
docker-compose up
\`\`\`

## Project Structure

- `api/app/lib/sequelize.tsx` — database connection and Post model
- `api/app/api/feed/route.tsx` — CRUD API route
- `api/app/api/health/route.tsx` — health check endpoint
- `api/app/api/count/route.tsx` — request count endpoint
- `api/app/api/rss/route.tsx` — RSS XML feed endpoint
- `frontend/app/feeds/page.tsx` — RSS Client, fetches live data from the API

## Author

Name: Irem Ercan Sumer — Student Number: 22591527