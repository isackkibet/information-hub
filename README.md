# Sango Information Hub (SIHU)

SIHU is a community media and knowledge-sharing website for the Lake Victoria Basin in Kenya. It brings local stories, community reports, educational resources, and media together in one place. Members can read and save content, send reports with photos, and follow their submissions. Editors, verifiers, and administrators have role-based tools for managing the site.

## Languages and technology

| Area | Technology | What it does |
| --- | --- | --- |
| Application language | TypeScript | Type-safe application and server code |
| User interface | React 19 | Interactive website components |
| Web framework | Next.js 16 App Router | Pages, server rendering, and API routes |
| Styling | Tailwind CSS 4 | Responsive layouts and visual styling |
| Database | PostgreSQL | Stores accounts, articles, reports, tasks, and media records |
| Database toolkit | Prisma 7 | Database schema, migrations, and typed queries |
| Authentication | JWT and bcryptjs | Signed sessions and hashed passwords |
| AI assistant | Groq API | AI chat with relevant published SIHU article context |

Uploads use PDF, JPG, PNG, and WEBP files up to 8 MB. The current upload handler stores files on the server filesystem; production hosting must provide persistent shared storage or an object-storage integration so uploads survive deployments and are available to every app instance.

## Main features

- **Media Content:** browse published articles, videos, podcasts, radio, newspapers, and photos by category.
- **Member Portal:** access saved items, reports and articles submitted, assigned tasks, and profile settings.
- **Community reports:** submit local observations with an optional photo or document and follow review status.
- **Editorial workflow:** editors review and manage submitted articles.
- **Verification workflow:** verifiers review community reports.
- **Admin portal:** manage users, roles, articles, categories, media, site settings, and audit history.
- **AI assistant:** ask questions and get answers informed by relevant published articles when available.
- **Responsive website:** designed to work across desktop and mobile screen sizes.

## Requirements

- Node.js 20.9 or newer
- npm
- A PostgreSQL database
- A Groq API key to use the AI assistant (optional for the rest of the site)

## Run locally

1. Clone the repository and enter the project folder.

   ```bash
   git clone https://github.com/isackkibet/information-hub.git
   cd information-hub
   ```

2. Install dependencies.

   ```bash
   npm install
   ```

3. Create a local environment file and fill in the required values.

   ```bash
   cp .env.example .env
   ```

   At minimum, set `DATABASE_URL` and a long, private `JWT_SECRET`. Set `GROQ_API_KEY` if you want to use the AI assistant. Never commit `.env` or paste real API keys into source code.

4. Apply the database migrations.

   ```bash
   npm run db:deploy
   ```

   To create the administrator account (and any optional role accounts configured in `.env`), run:

   ```bash
   npm run db:seed
   ```

   `db:seed` requires `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env`. Optional editor, verifier, and leadership accounts can be provisioned using the matching variables in `.env.example`. The seed script hashes passwords before saving them.

5. Start the development server.

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

To insert the repository's example categories, articles, and media, run `npm run db:seed-content`. These are demonstration records; review them before using them as real reporting.

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | Secret used to sign authentication tokens; use a long random value |
| `GROQ_API_KEY` | For AI | API key used by the server-side AI endpoint |
| `GROQ_MODEL` | No | Groq model name; defaults to `openai/gpt-oss-20b` |
| `ADMIN_EMAIL` | For admin seed | Email for the seeded administrator |
| `ADMIN_PASSWORD` | For admin seed | Password for the seeded administrator |
| `EDITOR_EMAIL`, `EDITOR_PASSWORD` | No | Optional seeded editor account |
| `VERIFIER_EMAIL`, `VERIFIER_PASSWORD` | No | Optional seeded verifier account |
| `LEADERSHIP_EMAIL`, `LEADERSHIP_PASSWORD` | No | Optional seeded leadership account |
| `UPLOAD_DIR` | No | Upload storage directory; defaults to `./uploads` |

The AI key is read only by the server in `/api/ai/chat`; it is not sent to the browser. If it is missing, the rest of the site can still run, but AI chat will be unavailable.

## Useful commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run start` | Run the production server after building |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Check TypeScript types |
| `npm run db:generate` | Generate the Prisma client |
| `npm run db:migrate` | Create and apply a development migration |
| `npm run db:deploy` | Apply committed migrations to a database |
| `npm run db:push` | Push the Prisma schema directly to a database (use carefully) |
| `npm run db:seed` | Create configured role accounts |
| `npm run db:seed-content` | Add example categories, articles, and media |
| `npm run db:studio` | Open Prisma Studio to inspect database records |

## Project layout

```text
prisma/                 Database schema, migrations, and seed scripts
public/                 Static assets, including the home page image
src/app/                Next.js pages and API route handlers
src/app/api/             HTTP endpoints
src/backend/             Database queries, authentication, and uploads
src/components/          Shared interface and feature components
src/frontend/services/   Browser-side API clients
src/hooks/               Reusable React hooks
src/lib/                 Shared authentication, permissions, and utilities
src/generated/prisma/    Generated Prisma client; do not edit by hand
```

Pages are organized with the Next.js App Router. API endpoints are under `src/app/api`; database and server-only logic belongs in `src/backend`. Use the `@/` import alias for modules in `src`.

## Roles and routes

- `/` — public home page
- `/portal/media` — public Media Content library
- `/portal` — member reading portal
- `/sign-in` — sign in or create an account
- `/account` — signed-in member dashboard
- `/submit` — submit a community report with an optional attachment
- `/ai-assistant` — AI chat assistant
- `/editorial` — editor workspace
- `/verification` — verifier workspace
- `/admin` — administrator dashboard

New accounts have the registered-user role. Higher-privilege roles should be assigned by an administrator or provisioned through the environment-configured seed script. Do not use shared or hard-coded production credentials.

## Database changes

Update `prisma/schema.prisma`, then create a migration during local development:

```bash
npm run db:migrate
```

Commit the new migration with the schema change. Before deploying, configure the production database and run:

```bash
npm run db:deploy
npm run build
```

`npm install` runs Prisma client generation through the package `postinstall` script. If generated client types are out of date, run `npm run db:generate`.

## Deployment notes

Configure the environment variables on the hosting provider and use a PostgreSQL database reachable from the application. Set a secure `JWT_SECRET` and keep `GROQ_API_KEY` private. Run database migrations as part of deployment. The current upload implementation writes to local disk, so use persistent shared storage for production; ephemeral serverless filesystems can lose uploaded photos and documents.
