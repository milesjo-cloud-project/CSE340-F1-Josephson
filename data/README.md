# F1 2025–2026 dataset

Four CSVs (data through the 2026 Brazilian GP, round 20; last 3 rounds of 2026 not yet run).

| File | Rows | What it is |
|---|---|---|
| f1_2025-2026_races_and_circuits.csv | 47 | One row per race: date, circuit, city, country, sprint?, status, winner |
| f1_2025-2026_race_results.csv | 919 | One row per driver per race: finish, grid, status, points, penalties, circuit |
| f1_2025-2026_penalties.csv | 56 | One row per penalty / disqualification, with reason and source |
| f1_2025-2026_driver_totals.csv | 46 | Season standings per driver |

Join keys: `Season` + `Round` (races, results, penalties); `Season` + `Driver` (driver_totals).

## VS Code
```
pip install pandas
python load_data.py        # prints row counts and builds f1_2025_2026.db
```
Then in code: `from load_data import load; races, results, penalties, totals = load()`.
Open `f1_2025_2026.db` with the "SQLite Viewer" or "SQLite" extension to query it directly.
