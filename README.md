This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Where to find code

Next.js route files stay in `src/app`. Put page-specific UI in `src/components` and reusable browser-side helpers in `src/hooks` or `src/frontend/services`.

- `src/app/**/page.tsx` — pages and route UI
- `src/app/api/**/route.ts` — thin HTTP endpoints; database and token logic live in `src/backend`
- `src/components/ui` — shared visual primitives; other `src/components` folders group feature UI
- `src/frontend/services` — browser-side calls to API routes and content helpers
- `src/backend/auth` — server-side token functions
- `src/backend/database` — Prisma client and database connection helpers
- `src/data` — local content and seed-like data
- `src/lib` — shared auth state, permission rules, types of utilities used across UI and routes
- `src/generated/prisma` — generated Prisma client; do not edit by hand
- `.next` and `node_modules` — generated/build and dependency folders; do not edit by hand

Use the `@/` alias for imports from `src`, for example `@/backend/database/prisma` or `@/components/ui/button`.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Connect the AI Assistant to Groq

1. Copy `.env.example` to `.env` and replace the placeholders you need.
2. Set `GROQ_API_KEY` in `.env` to an API key from the [Groq Console](https://console.groq.com/keys).
3. Keep `GROQ_MODEL` as `openai/gpt-oss-20b`, or change it to a model enabled for your Groq account.
4. Restart the development server. The key is read only by the server and is never sent to the browser.

Set `DATABASE_URL` and `JWT_SECRET` for account sign-in. To seed role accounts, provide `ADMIN_EMAIL` and `ADMIN_PASSWORD`; other role accounts are optional and use the matching variables shown in `.env.example`. The seed script has no built-in passwords.

The assistant sends chat requests through `/api/ai/chat` to Groq's OpenAI-compatible Chat Completions API. It uses the article title as optional context, but does not search or retrieve SIHU article content yet.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
