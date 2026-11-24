import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'csv-parse/sync';

const csvPath = path.join(process.cwd(), 'data', 'f1_2025-2026_races_and_circuits.csv');
const text = fs.readFileSync(csvPath, 'utf8');
const rawRows = parse(text, { columns: true, skip_empty_lines: true, trim: true});

const races = rawRows.map((row) => ({
    season: Number(row['Season']),
    round: Number(row['Round']),
    race: row['Race'],
    date: row['Race day'],
    circuit: row['Circuit'],
    city: row['City'],
    country: row['Country'],
    status: row['Status'],
    winner: row['Winner'],
    winningTeam: row['Winning team'],
    sprint: row['Sprint'] === 'Yes'
}));

export function getRacesBySeason(season) {

    return races
        .filter((r) => r.season === Number(season))
        .sort((a, b) => a.round - b.round);
}

