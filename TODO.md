# TODO

Goal: meet every requirement in the CSE 340 Final Project Requirements.
Missing a core concept or a working login system is a failing grade, so phases 1-8 come first.
Commit after each phase (aim for 15+ substantial commits; 13 so far).

## Requirement status
| # | Requirement | Status |
|---|---|---|
| Stack | Express, EJS, ESM | ✅ done |
| 1 | PostgreSQL database with related tables | 🟡 Phase 1 (schema + seed done, models next) |
| 2 | Sessions, bcrypt, 3 roles, protected routes | ❌ Phase 3 |
| 3 | SSR, dynamic routes, partials, query params | ✅ done (layouts optional) |
| 4 | MVC folders, middleware, global error handler | 🟡 Phase 2 (error handler done) |
| 5 | Admin manages content stored in the DB | ❌ Phase 4 |
| 6 | Users submit/edit/delete their own content | ❌ Phase 5 |
| 7 | Multi-stage workflow with status history | ❌ Phase 6 |
| 8 | Admin dashboard | ❌ Phase 7 |
| 9 | Parameterized queries, validation, sanitization | ❌ Phases 1, 3, 5, 6 |
| 10 | Deployed on Render with Postgres | ❌ Phase 8 |
| Docs | README.md with ERD, roles, test accounts | ❌ Phase 9 |

## The plan for the F1 site
- **Roles:** `admin` (full control), `editor` (writes articles, answers fan questions, moderates comments), `fan` (standard user)
- **Admin-managed content:** news articles (replace the hardcoded `news` array in `server.js`), races and drivers
- **User content:** fans comment on races, and can edit/delete their own comments
- **Workflow:** "Ask a question" fan questions: `submitted → in review → answered → closed`, with a history of every status change

## Schedule (due ~Mon Dec 7, aim to finish by Fri Dec 4)
Total: about 30-40 hours, so roughly 2.5-3 hours a day.

| Days | Phase |
|---|---|
| Nov 23-25 | 1: Database + seed + models on Postgres |
| Nov 26 | 2: Routes/controllers |
| Nov 27-28 | 3: Login, sessions, roles |
| Nov 29 | 4: Articles |
| Nov 30 | 5: Comments |
| Dec 1-2 | 6: Fan questions workflow |
| Dec 2-3 | 7: Dashboards |
| Dec 4 | 8: Deploy to Render (deploy early, even half-done, to catch problems) |
| Dec 5 | 9: README, ERD, final testing |
| Dec 6-7 | Buffer |

---

## Phase 1: PostgreSQL database (~5-7 hrs)
- [x] Postgres is running locally and `DATABASE_URL` in `.env` points to `f1_dev` (checked 2026-11-23, empty, no tables yet)
- [x] `src/models/db.js`: create a `pg` `Pool` from `process.env.DATABASE_URL` and export it

**Starter: `src/models/db.js`**
```js
import pg from 'pg';
import 'dotenv/config';

const isProduction = process.env.NODE_ENV === 'production';

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    // Render's Postgres needs SSL; your local one doesn't
    ssl: isProduction ? { rejectUnauthorized: false } : false,
});

export default pool;
```
Why a pool: it keeps a few connections open and lends them out, instead of opening a new one per request.

- [x] `db/schema.sql`: create the tables (drop them first so you can re-run it)

**Starter: `db/schema.sql`** (first 4 tables done, you write the rest)
```sql
-- Drop in reverse order (children before parents) so this file can be re-run
DROP TABLE IF EXISTS question_history, questions, comments, articles, users,
                     penalties, race_results, season_entries, races, circuits, drivers, teams CASCADE;

CREATE TABLE teams (
    id   SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE drivers (
    id   SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,   -- from your slugify() function
    code CHAR(3)                          -- 'NOR', 'VER'...
);

CREATE TABLE circuits (
    id      SERIAL PRIMARY KEY,
    name    VARCHAR(150) NOT NULL UNIQUE,
    city    VARCHAR(100),
    country VARCHAR(100)
);

CREATE TABLE races (
    id         SERIAL PRIMARY KEY,
    season     SMALLINT NOT NULL,
    round      SMALLINT NOT NULL,
    name       VARCHAR(150) NOT NULL,
    race_day   DATE,
    circuit_id INTEGER REFERENCES circuits(id) ON DELETE SET NULL,
    sprint     BOOLEAN NOT NULL DEFAULT false,
    status     VARCHAR(20) NOT NULL DEFAULT 'Scheduled',
    UNIQUE (season, round)               -- only one Round 3 per season
);

-- TODO: season_entries, race_results, penalties
-- TODO: users, articles, comments, questions, question_history
```

**CASCADE vs SET NULL** (the grader looks for this):
- `ON DELETE CASCADE`: children only make sense with their parent, so delete them too (deleting a race deletes its results and comments)
- `ON DELETE SET NULL`: the child should survive (a deleted editor's articles stay up with `author_id = NULL`); the column must allow NULL
- Decide before writing: `race_results.race_id`, `comments.user_id`, `articles.author_id`, `question_history.changed_by`

**Hints:** points can be halves, use `NUMERIC(5,1)` · `role VARCHAR(10) NOT NULL CHECK (role IN ('admin','editor','fan'))` · `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`

**Test:** `psql f1_dev -f db/schema.sql` then `psql f1_dev -c '\dt'` should list 12 tables

Tables to write:
  - [x] `teams` (id, name UNIQUE)
  - [x] `drivers` (id, name, slug UNIQUE, code)
  - [x] `circuits` (id, name, city, country)
  - [x] `races` (id, season, round, name, race_day DATE, circuit_id FK, sprint BOOLEAN, status), UNIQUE (season, round)
  - [x] `season_entries` (driver_id FK, team_id FK, season, position, points, starts, wins, podiums, ...): who drove for which team in a season
  - [x] `race_results` (race_id FK ON DELETE CASCADE, driver_id FK, team_id FK, finish, grid, status, race_points, sprint_points)
  - [x] `penalties` (race_id FK, driver_id FK, penalty, licence_points, reason, session)
  - [x] `users` (id, name, email UNIQUE, password_hash, role CHECK IN ('admin','editor','fan'), created_at)
  - [x] `articles` (id, title, slug UNIQUE, body, author_id FK → users ON DELETE SET NULL, published_at)
  - [x] `comments` (id, race_id FK ON DELETE CASCADE, user_id FK ON DELETE CASCADE, body, created_at, updated_at)
  - [x] `questions` (id, user_id FK ON DELETE CASCADE, subject, body, status, created_at)
  - [x] `question_history` (id, question_id FK ON DELETE CASCADE, status, note, changed_by FK → users ON DELETE SET NULL, changed_at)
- [x] `db/seed.js`: run `schema.sql`, then read each CSV (reuse your `csv-parse` code) and INSERT the rows
  - Insert in order: teams, drivers, circuits → races → season_entries, race_results, penalties
  - Seed users: moved to Phase 3 (needs bcrypt)
- [x] `npm run seed` works (checked 2026-11-24: 14 teams, 26 drivers, 26 circuits, 47 races, 46 season entries, 919 results, 56 penalties; every driver's season points match the sum of their race results)
  - [ ] Optional: open the tables in pgAdmin to see the data there too
- [ ] Rewrite `drivers.js`, `races.js`, `results.js` to use `pool.query()` with `$1` parameters instead of the CSVs
  - Keep the same function names so `server.js` barely changes
  - The functions become `async`, so routes need `await`
- [ ] Every existing page still works: drivers, driver stats, teams, races, race results, bad season/round 404s

## Phase 2: MVC structure (~2-3 hrs)
- [ ] Move routes out of `server.js` into `src/routes/` (e.g. `seasons.js`, `index.js`) using `express.Router()`
- [ ] Move route logic into `src/controller/` (e.g. `seasonsController.js`)
- [ ] `server.js` only sets up the app, middleware, routers, and the error handler
- [ ] Remove leftovers: `src/views/f1.html`, `driver.ejs` if unused, the hardcoded `/races/australia` links on the home page
- [ ] Optional: a layout in `src/views/layouts/`

## Phase 3: Authentication and roles (~5-6 hrs)
- [ ] `npm install express-session connect-pg-simple bcrypt express-validator`
- [ ] Session setup: secret from `.env` (`SESSION_SECRET`), store sessions in Postgres, cookie `httpOnly`, `sameSite: 'lax'`, `secure` in production
- [ ] `src/models/users.js`: `createUser`, `getUserByEmail`, `getUserById`
- [ ] `db/seed.js`: seed one user per role (admin, editor, fan) with password `P@$$w0rd!`, hashed with bcrypt
- [ ] Register page + POST: validate name/email/password, hash with bcrypt, new users are `fan`
- [ ] Login page + POST: compare with bcrypt, store user id/name/role in `req.session.user`
- [ ] Logout: destroy the session
- [ ] `src/middleware/auth.js`: `requireLogin` and `requireRole('admin', 'editor')`
- [ ] Make `user` available to every view (`res.locals.user`) and show Login/Register or Name/Logout in the header
- [ ] Friendly error messages on the forms ("Email already registered", "Wrong email or password"), never leak details

## Phase 4: Articles (admin-managed content) (~3-4 hrs)
- [ ] `src/models/articles.js`: list, get by slug, create, update, delete
- [ ] `/news` list page and `/news/:slug` article page
- [ ] Home page shows the latest articles from the DB instead of the hardcoded array
- [ ] Admin/editor: create, edit, delete articles (protected with `requireRole`)
- [ ] Validate: title and body required, trimmed, escaped

## Phase 5: Fan comments on races (~3-4 hrs)
- [ ] `src/models/comments.js`: list by race, create, update, delete
- [ ] Comment list and form on the race results page (form only when logged in)
- [ ] Fans can edit/delete **their own** comments (check `comment.user_id === req.session.user.id` on the server, not just by hiding buttons)
- [ ] Editors/admins can delete any comment (moderation)
- [ ] Validation: no empty comments, max length

## Phase 6: Fan questions workflow (~4-6 hrs)
- [ ] `src/models/questions.js`: create, list by user, list all, get by id with history, update status (insert a `question_history` row each time)
- [ ] "Ask a question" button goes to a form (logged-in fans)
- [ ] `/account/questions`: fan sees their questions, current status, and full history
- [ ] Editor/admin: change status, add a note or answer
- [ ] Only allow valid status changes (e.g. can't go from `closed` back to `submitted`)

## Phase 7: Dashboards (~4-6 hrs)
- [ ] `/admin` (admin only): list users, change a user's role, delete a user
- [ ] `/admin`: manage articles, races/drivers (add/edit/delete), all comments, all questions
- [ ] `/admin`: operational numbers (number of users, open questions, comments this week, etc.)
- [ ] `/editor` (editor): articles, comment moderation, questions queue; no user management
- [ ] Optional: `/account` dashboard for fans (their comments and questions)
- [ ] Each role gets a genuinely different experience (check by logging in as each test user)

## Phase 8: Deploy to Render (~2-3 hrs)
- [x] Render Web Service + PostgreSQL connected to the GitHub repo (user confirmed 2026-11-23; every push to `main` redeploys)
- [ ] Environment variables on Render: `DATABASE_URL`, `SESSION_SECRET`, `NODE_ENV=production`
- [ ] Use SSL for the Postgres connection in production
- [ ] `app.set('trust proxy', 1)` so secure cookies work behind Render's proxy
- [ ] Run the seed against the Render database
- [ ] No dev-only code in production (nodemon, test routes, `console.log` debugging)
- [ ] Log in as each test user on the live site and check everything works

## Phase 9: README.md and submission (~1-2 hrs)
- [ ] Project description: what the site does and who it's for
- [ ] ERD image exported from pgAdmin
- [ ] User roles and what each can do
- [ ] Test account emails for admin, editor and fan (do NOT put the password in the README; all use `P@$$w0rd!`)
- [ ] Known limitations (e.g. drivers who switched teams mid-season show a combined team like `Red Bull / Racing Bulls`; race status comes from the CSV, so it can be out of date)
- [ ] Submit the GitHub URL and the live Render URL

## Small leftovers (anytime)
- [ ] Nav links: keep `/teams` and `/races` on the season you're currently viewing
- [ ] Stretch: link each team card on `season-teams.ejs` to `/seasons/<season>/drivers?team=<name>`
- [ ] `season-drivers.ejs`: `class="driver-card "href=` should be `class="driver-card" href=`
- [ ] The Drivers nav link is hardcoded to `/seasons/2026/drivers`; add a `/drivers` redirect like `/teams` and `/races`

---

## Done
### Drivers
- [x] Drivers list filtered by team (`?team=`), with a "No drivers found" message when nothing matches
- [x] Driver page: race-by-race results table using `results-table`, styled back link

### Teams
- [x] `/teams` redirects to the latest season
- [x] `/seasons/:season/teams` standings page (team points + driver links), bad season gives a 404

### Races
- [x] `races.js` model, `/races` redirects to the latest season
- [x] `/seasons/:season/races` list page: race names link to results, upcoming races show a muted `TBD`
- [x] `/seasons/:season/races/:round` full finishing order, "hasn't happened yet" message, bad round gives a 404

### Styling & cleanup
- [x] Table CSS for `.results-table` (width, padding, row lines, link colors, `.tbd`)
- [x] Closed the `driver-grid` div in `season-teams.ejs`
- [x] Deleted the stray `seasons/` folder

### Already meets requirements
- [x] ESM (`import`/`export`, `"type": "module"`), no `require`
- [x] Global error handler that doesn't leak details
- [x] Dynamic routes and query-parameter filtering
- [x] Partials for head/header/footer
