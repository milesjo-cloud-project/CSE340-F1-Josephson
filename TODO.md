# TODO

Goal: meet every requirement in the CSE 340 Final Project Requirements.
Missing a core concept or a working login system is a failing grade, so phases 1-8 come first.
Commit after each phase (aim for 15+ substantial commits; 20 so far).

## Requirement status
| # | Requirement | Status |
|---|---|---|
| Stack | Express, EJS, ESM | ✅ done |
| 1 | PostgreSQL database with related tables | ✅ done (Phase 1) |
| 2 | Sessions, bcrypt, 3 roles, protected routes | ❌ Phase 3 |
| 3 | SSR, dynamic routes, partials, query params | ✅ done (layouts optional) |
| 4 | MVC folders, middleware, global error handler | ✅ done (Phase 2) |
| 5 | Admin manages content stored in the DB | ❌ Phase 4 |
| 6 | Users submit/edit/delete their own content | ❌ Phase 5 |
| 7 | Multi-stage workflow with status history | ❌ Phase 6 |
| 8 | Admin dashboard | ❌ Phase 7 |
| 9 | Parameterized queries, validation, sanitization | 🟡 parameterized queries done; validation in Phases 3, 5, 6 |
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
- [ ] Environment variables on Render: `DATABASE_URL`, `SESSION_SECRET`, `NODE_ENV=production`
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
- [ ] Optional: open the tables in pgAdmin to see the data there too
- [ ] Optional: a shared layout in `src/views/layouts/` (partials already cover the requirement)
- [ ] Nav links: keep `/teams` and `/races` on the season you're currently viewing
- [ ] Stretch: link each team card on `season-teams.ejs` to `/seasons/<season>/drivers?team=<name>`

---

## Done
### Database (Phase 1)
- [x] Postgres running locally, `DATABASE_URL` in `.env` points to `f1_dev`
- [x] `src/models/db.js`: `pg` Pool, SSL only in production
- [x] `db/schema.sql`: 12 tables, re-runnable (drops first)
- [x] `db/seed.js` + `npm run seed` (checked 2026-11-24: 14 teams, 26 drivers, 26 circuits, 47 races, 46 season entries, 919 results, 56 penalties; every driver's season points match the sum of their race results)
- [x] Models on Postgres: `drivers.js`, `races.js`, `results.js` use `pool.query()` with `$1` parameters, no CSV reads (`csv-parse` stays, `seed.js` uses it)
  - Column aliases (`AS "racePoints"`, `AS "licensePoints"`, `AS race`) keep the old property names, so no view changed
  - `::float` on NUMERIC points (pg returns NUMERIC as strings); `to_char` for race dates
  - Race winner comes from a `LEFT JOIN race_results ... finish = 1`; DNFs show their status via `COALESCE(finish::text, status)`
- [x] All routes `async`/`await`; every page checked 2026-11-25: drivers, `?team=` filter, driver stats, teams, races, race results, bad season/round/driver 404s
- CASCADE vs SET NULL (for the README): CASCADE when the child is meaningless without its parent (results, comments, questions, history → their race/user/question); SET NULL when it should survive (`articles.author_id`, `question_history.changed_by`, `races.circuit_id`, `team_id`)

### MVC structure (Phase 2)
- [x] `server.js` only sets up the app, static files, body parsing, routers and error middleware (25 lines)
- [x] `src/routes/index.js` (`/`, `/drivers`, `/teams`, `/races`) and `src/routes/seasons.js` (mounted at `/seasons`) using `express.Router()`
- [x] `src/controller/homeController.js` (`showHome`, `latestSeasonRedirect(page)`) and `seasonController.js` (`showDrivers`, `showDriver`, `showTeams`, `showRaces`, `showRace`, `notFound()` helper)
- [x] `src/middleware/errors.js`: `notFoundHandler` + `errorHandler` (4 params so Express treats it as an error handler)
- [x] New `/drivers` redirect; nav and home links use `/drivers` instead of hardcoded `/seasons/2026/drivers`
- [x] Home page shows the next 3 races of the latest season from the DB (falls back to the last 3 when the season is over), linking to their results pages
- [x] Deleted `src/views/f1.html` and `driver.ejs` (nothing rendered them); fixed the `driver-card` class typo
- [x] Every page checked 2026-11-25 after the split

### Deploy (Phase 8)
- [x] Render Web Service + PostgreSQL connected to the GitHub repo (every push to `main` redeploys)
- [x] SSL for the Postgres connection in production (`db.js`, checked with `NODE_ENV=production`)

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
