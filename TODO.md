# TODO

## Done
- [x] Filter feature: drivers list filtered by team (`?team=`)

## Next up

### Explore teams (`/teams`)
The header nav already links to `/teams` and `/races`, but both 404 right now.

Goal: `/seasons/:season/teams` lists every team for a season with its drivers and total points.
`/teams` redirects to the latest season.

**1. Model: `src/models/drivers.js`** (team data already lives in the driver totals CSV)
```js
export function getTeamStandings(season) {
    const teams = {};   // { 'McLaren': { name, points, drivers: [] } }

    getDriversBySeason(season).forEach((driver) => {
        if (!teams[driver.team]) {
            // TODO: create the team entry (name, points: 0, drivers: [])
        }
        // TODO: add driver.points to the team's points
        // TODO: push the driver into the team's drivers array
    });

    // TODO: turn the object into an array and sort by points, highest first
    // hint: Object.values(teams)
}
```

**2. Routes: `server.js`** (import `getTeamStandings` and `getSeasons`)
```js
app.get('/teams', (req, res) => {
    // TODO: redirect to /seasons/<latest season>/teams
    // hint: getSeasons() is already sorted newest first
});

app.get('/seasons/:season/teams', (req, res, next) => {
    const { season } = req.params;
    // TODO: res.render('season-teams', { title, season, teams: ... })
});
```

**3. View: `src/views/season-teams.ejs`** (new file, copy the shape of `season-drivers.ejs`)
```ejs
<%- include('partials/head') %>
<%- include('partials/header') %>
<main class="container">
<section class="content">
  <h1 class="section-title"><%= title %></h1>
  <div class="driver-grid">
    <% teams.forEach((t, i) => { %>
    <div class="driver-card">
      <!-- TODO: position (i + 1), team name, points -->
      <!-- TODO: loop over t.drivers and link each to /seasons/<season>/drivers/<slug> -->
    </div>
    <% }); %>
  </div>
</section>
</main>
<%- include('partials/footer') %>
```

**Stretch:** link each team card to `/seasons/:season/drivers?team=<name>` so it reuses the filter you built.
(Use `encodeURIComponent(t.name)` in the link so names with spaces work.)

### Explore races (`/races`)
Goal: `/seasons/:season/races` lists every round (date, race, circuit, winner).
`/races` redirects to the latest season.

**1. Model: `src/models/races.js`** (new file, reads `data/f1_2025-2026_races_and_circuits.csv`)
```js
import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'csv-parse/sync';

const csvPath = path.join(process.cwd(), 'data', 'f1_2025-2026_races_and_circuits.csv');
const text = fs.readFileSync(csvPath, 'utf8');
const rawRows = parse(text, { columns: true, skip_empty_lines: true, trim: true });

// CSV columns: Season, Round, Race, Race day, Circuit, City, Country,
//              Sprint, Status, Winner, Winning team, Penalties on record
const races = rawRows.map((row) => ({
    season: Number(row['Season']),
    round: Number(row['Round']),
    race: row['Race'],
    // TODO: date, circuit, city, country, winner, winningTeam
    // TODO: sprint as a true/false boolean (the CSV has "Yes"/"No")
}));

export function getRacesBySeason(season) {
    // TODO: filter by season, sort by round
    // (look at getDriverResults in results.js, it's the same pattern)
}
```

**2. Routes: `server.js`**: same pattern as teams (`/races` redirect plus `/seasons/:season/races`).

**3. View: `src/views/season-races.ejs`**: a table works well here. Reuse
`<div class="table-scroll">` and `class="results-table"` from `driver-stats.ejs`.
Columns: Rd, Date, Race, Circuit, Winner.

**Stretch:** `/seasons/:season/races/:round` shows the full finishing order.
`results.js` already has the data, and it needs a `getRaceResults(season, round)`.

### Check before moving on
- [ ] `/teams` and `/races` in the nav go somewhere (no 404)
- [ ] A bad season like `/seasons/1999/teams` doesn't crash
- [ ] Update the nav links if you want them to stay on the current season

## Small fixes
- [ ] `src/views/driver-stats.ejs`: the results table uses `class="result-table"` but `f1.css` styles `.results-table`. Make the names match.
- [ ] `src/views/driver-stats.ejs`: wrap the back link in `<p class="back-link">` again so it picks up its styling.
- [ ] `season-drivers.ejs`: show a "No drivers found" message when the team filter matches nothing.
- [ ] Delete the stray `seasons/` folder in the project root (created by accident, don't commit it).
