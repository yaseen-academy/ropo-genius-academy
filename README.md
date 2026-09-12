# Code Academy Platform — Setup Guide (Phase 1)

This is the first build pass of your platform: landing page + course catalog,
trainer login & code generation, student login, and both dashboards' skeletons.
Video parts, exams and the AI assistant land in the next pass.

## 1. Create a free Supabase project
1. Go to https://supabase.com → New project.
2. Once it's ready, open **Project Settings → API** and copy:
   - `Project URL` → this is `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → this is `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → this is `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

## 2. Run the database setup
1. Open **SQL Editor** in Supabase → New query.
2. Paste the contents of `supabase/schema.sql`, run it.
3. New query again → paste the contents of `supabase/seed.sql`, run it.
   This creates your trainer account:
   - Username: `trainer Yaseen`
   - Password: `ro12po500`

## 3. Configure environment variables
```bash
cp .env.example .env.local
```
Open `.env.local` and fill in the three Supabase values from step 1, plus:
- `SESSION_SECRET`: any long random string (e.g. run `openssl rand -hex 32`)
- `NEXT_PUBLIC_WHATSAPP_NUMBER` / `NEXT_PUBLIC_VODAFONE_CASH_NUMBER`: already
  pre-filled with the numbers you gave me — change if needed.

## 4. Install and run locally
```bash
npm install
npm run dev
```
Open http://localhost:3000 — that's your landing page.
- Trainer login: http://localhost:3000/teacher/login
- Student login: http://localhost:3000/student/login

## 5. Deploy it online with a domain (when you're ready)
1. Push this folder to a GitHub repo.
2. Go to https://vercel.com → New Project → import the repo.
3. In Vercel's project settings, add the same environment variables from
   `.env.local`.
4. Deploy. Vercel gives you a free `*.vercel.app` link immediately.
5. In Vercel → Project → Settings → Domains, add your own domain and follow
   the DNS instructions it gives you.

## What already works
- Landing page pulling real courses from the database, with WhatsApp +
  Vodafone Cash info per course.
- Trainer login (`trainer Yaseen` / `ro12po500`).
- Trainer dashboard: add courses, generate 100/500/1000/5000 access codes per
  course, see enrolled students, remove a student, and (owner only) add more
  coaches.
- Student login with name + access code, auto-enrolling them in the code's
  course.
- Student dashboard: list of enrolled courses, WhatsApp button.

## What's next
- Lesson builder: 4 video parts per lesson (link-based, ≤45 min each).
- Student video player: max 3 views, playback speed capped at 1.5x.
- Exam builder + exam runner: max 2 attempts, scored automatically.
- In-site AI assistant for trainers (curriculum help) and for students
  (lesson Q&A, not exam answers), using the Anthropic API.
