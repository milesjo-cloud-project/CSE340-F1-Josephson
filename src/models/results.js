import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'csv-parse/sync';
import { slugify } from './drivers.js';

const csvPath = path.join(process.cwd(), 'data', 'f1_2025-2026_race_results.csv');
const text = fs.readFileSync(csvPath, 'utf8');
const rawRows = parse(text, { columns: true, skip_empty_lines: true, trim: true });
 
const results = rawRows.map((row) => ({
    season: Number(row['Season']),
    round: Number(row['Round']),
    race: row['Race'],
    slug: slugify(row['Driver']),
    team: row['Team'],
    grid: Number(row['Grid']),
    finish: row['Finish'],
    status: row['Status'],
    racePoints: Number(row['Race points']),
    sprintPoints: Number(row['Sprint Points']),
}));

export function getDriverResults(season, slug) {
    return results

        .filter((r) => r.season === Number(season) && r.slug === slug)
        .sort((a, b) => a.round - b.round);
}


