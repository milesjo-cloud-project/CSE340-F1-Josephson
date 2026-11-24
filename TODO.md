# TODO

## Next up
- [ ] Nav links: keep `/teams` and `/races` on the season you're currently viewing (right now they always jump to the latest season)
- [ ] Stretch: link each team card on `season-teams.ejs` to `/seasons/<season>/drivers?team=<name>` to reuse the team filter
      (use `encodeURIComponent(t.name)` so names with spaces work)
- [ ] `season-drivers.ejs`: `class="driver-card "href=` has the space inside the quotes, should be `class="driver-card" href=`

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

> The starter code for teams and races is in git history (see `TODO.md` at commit `15f04bf`) if you want to look back at it.
