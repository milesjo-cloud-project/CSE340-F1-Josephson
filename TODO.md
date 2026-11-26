# TODO

Goal: meet every requirement in the CSE 340 Final Project Requirements.
Missing a core concept or a working login system is a failing grade, so phases 3-8 come first.
Commit after each phase (aim for 15+ substantial commits; 23 so far).
Due ~Mon Dec 7.

## Requirements still open
Already done: Stack (Express, EJS, ESM), 1 (PostgreSQL), 2 (sessions, bcrypt, 3 roles, protected routes), 3 (SSR, dynamic routes, partials, query params), 4 (MVC, middleware, error handler), 5 (admin/editor manage news articles in the DB).

| # | Requirement | Status |
|---|---|---|
| 6 | Users submit/edit/delete their own content | ❌ Phase 5 |
| 7 | Multi-stage workflow with status history | ❌ Phase 6 |
| 8 | Admin dashboard | ❌ Phase 7 |
| 9 | Parameterized queries, validation, sanitization | 🟡 queries + register, login and article validation done; more in Phases 5, 6 |
| 10 | Deployed on Render with Postgres | 🟡 Phase 8 (service + DB connected) |
| Docs | README.md with ERD, roles, test accounts | ❌ Phase 9 |

## The plan for the F1 site
- **Roles:** `admin` (full control), `editor` (writes articles, answers fan questions, moderates comments), `fan` (standard user)
- **Admin-managed content:** news articles (replace the hardcoded `news` array), races and drivers
- **User content:** fans comment on races, and can edit/delete their own comments
- **Workflow:** "Ask a question" fan questions: `submitted → in review → answered → closed`, with a history of every status change
- **Output escaping:** all user text is printed with `<%= %>` (no `.escape()` on input, to avoid double-escaping)

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
Render Web Service + Postgres are already connected (every push to `main` redeploys), and SSL for the DB works. Deploy as soon as auth works to catch cookie problems early.
- [ ] Environment variables on Render: `DATABASE_URL`, `SESSION_SECRET`, `NODE_ENV=production`
- [ ] `app.set('trust proxy', 1)` so secure cookies work behind Render's proxy
- [ ] Run the seed against the Render database
- [ ] No dev-only code in production (nodemon, test routes, `console.log` debugging)
- [ ] Log in as each test user on the live site and check everything works

## Phase 9: README.md and submission (~1-2 hrs)
- [ ] Project description: what the site does and who it's for
- [ ] ERD image exported from pgAdmin
- [ ] User roles and what each can do
- [ ] Test account emails: `admin@f1fans.test`, `editor@f1fans.test`, `fan@f1fans.test` (do NOT put the password in the README; all use `P@$$w0rd!`)
- [ ] CASCADE vs SET NULL: CASCADE when the child is meaningless without its parent (results, comments, questions, history → their race/user/question); SET NULL when it should survive (`articles.author_id`, `question_history.changed_by`, `races.circuit_id`, `team_id`)
- [ ] Known limitations (e.g. drivers who switched teams mid-season show a combined team like `Red Bull / Racing Bulls`; race status comes from the CSV, so it can be out of date; editing an article's title changes its slug, so old links to it return 404)
- [ ] Submit the GitHub URL and the live Render URL

## Small leftovers (anytime, optional)
- [ ] Open the tables in pgAdmin to see the data there too
- [ ] A shared layout in `src/views/layouts/` (partials already cover the requirement)
- [ ] Nav links: keep `/teams` and `/races` on the season you're currently viewing
- [ ] Stretch: link each team card on `season-teams.ejs` to `/seasons/<season>/drivers?team=<name>`
