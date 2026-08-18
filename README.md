# Youth Sports Scheduler

> **Learning project for family sports scheduling, calendar ingestion, and full-stack application design.**

A mobile-first web application project for organizing children, teams, events, attendance, and team calendar feeds in one place. The project uses TypeScript, Hono, Cloudflare D1, and a responsive web UI.

## Project Status

This repository is a **learning/demo project**, not a production authentication reference. It demonstrates application architecture and workflow ideas, but the current authentication/session design must be strengthened before any public production deployment involving real family data.

## Features

- Parent/user registration and login flow
- Child profile management
- Team and sport relationships
- Event scheduling and family calendar views
- Attendance tracking
- iCal/ICS team-calendar ingestion
- Calendar sync controls and imported-event handling
- Cloudflare D1 relational storage
- Mobile-responsive interface
- REST-style API routes

## Tech Stack

- **TypeScript**
- **Hono**
- **Cloudflare Workers / Pages concepts**
- **Cloudflare D1 (SQLite-based storage)**
- **Tailwind CSS / responsive web UI**
- **iCal / ICS calendar parsing**

## Architecture

Core data relationships include:

- Users
- Children
- Sports
- Teams
- Child/team assignments
- Events
- Attendance

A typical workflow is:

1. A user creates an account.
2. Children are associated with the user.
3. Children are assigned to teams and sports.
4. Events are created manually or imported from an iCal/ICS feed.
5. The family calendar combines events across children.
6. Attendance can be tracked per child/event.

## API Examples

Representative routes include:

```text
GET  /api/health
POST /api/auth/register
POST /api/auth/login
GET  /api/children/:userId
POST /api/children
GET  /api/sports
GET  /api/teams/:sportId
POST /api/child-teams
GET  /api/events/:childId
POST /api/events
GET  /api/calendar/:userId
PUT  /api/attendance/:eventId/:childId
PUT  /api/teams/:teamId/calendar
POST /api/teams/:teamId/sync
GET  /api/teams/:teamId/sync-status
```

## Local Development

### Prerequisites

- Node.js 18+
- npm
- Cloudflare Wrangler

### Setup

```bash
git clone https://github.com/krak3n84/Youth_Sports_Scheduler.git
cd Youth_Sports_Scheduler
npm install
```

Create/configure a local D1 database using Wrangler, apply the repository migrations, and load only synthetic seed data.

Example workflow:

```bash
npx wrangler d1 create sports-tracker-development
npx wrangler d1 migrations apply sports-tracker-development --local
npx wrangler d1 execute sports-tracker-development --local --file=./seed.sql
npm run build
```

Use your own local Wrangler configuration for database bindings. Do not commit credentials, API tokens, private calendar URLs, or personal family data.

## Calendar Integration

The calendar workflow is designed around standard iCal/ICS feeds:

1. Store a team calendar feed URL.
2. Enable synchronization for that team.
3. Parse events from the feed.
4. Map imported items into the application's event model.
5. Display them with manually created events in the family calendar.

The project is intended to explore calendar ingestion and synchronization patterns. Private or authenticated calendar feeds require additional security design.

## Security Notice

The current repository should be treated as **development/demo code**.

Before using an application like this with real users or family information, important hardening work would include:

- Replace simple password hashing with a password-specific KDF such as Argon2, bcrypt, scrypt, or appropriately configured PBKDF2.
- Implement secure server-side sessions or another well-reviewed authentication/session model.
- Add authorization checks to every user-scoped API route so one user cannot access another user's records by changing an ID.
- Restrict CORS to approved origins rather than using a broad development policy.
- Add CSRF protection where appropriate for the chosen session model.
- Validate and normalize all untrusted input.
- Rate-limit authentication and other sensitive endpoints.
- Keep secrets in platform secret storage or environment configuration.
- Add automated security, dependency, and application tests.

## Privacy Rules for the Public Repository

Only synthetic data should be committed here.

Do **not** commit:

- real children's names or birth dates
- school/team schedules tied to a real child
- private calendar-feed URLs
- home or recurring location details
- passwords or password hashes for real users
- Cloudflare/API tokens or other credentials
- production database exports

The included `seed.sql` intentionally contains fictional reference data and no default user/password.

## Known Limitations / Next Steps

- Production-grade authentication and authorization
- Scheduled background calendar synchronization
- Private/authenticated calendar feeds
- Conflict-resolution UI
- Push notifications
- Test coverage
- Input/schema validation improvements
- Secure production deployment documentation

## Portfolio Purpose

This project demonstrates my work with a larger application surface than a single automation script: relational data modeling, API routes, calendar parsing, stateful workflows, UI design, and cloud-oriented application development.

## License

MIT License. Review all third-party service terms and privacy requirements before adapting the project for production use.
