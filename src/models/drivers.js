import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'csv-parse/sync';

const csvPath = path.join(process.cwd(), 'data', 'f1_2025-2026_driver_totals.csv');

const text = fs.readFileSync(csvPath, 'utf8');

const rawRows = parse(text, { columns: true, skip_empty_lines: true, trim: true });

export function slugify(name) {
    return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') 
}

const drivers = rawRows.map((row) => ({
    season: Number(row['Season']),
    position: Number(row['Position']),
    name: row['Driver'],
    slug: slugify(row['Driver']),
    points: Number(row['Points']),
    team: row['Team'],
    starts: Number(row['Starts']),
    wins: Number(row['Wins']),
    podiums: Number(row['Podiums']),
    retirements: Number(row['Retirements']),
    penalties: Number(row['Penalties']),
    licensePoints: Number(row['Licence points']),
    disqualifications: Number(row['Disqualifications']),
}));

export function getSeasons() {
    const seasons = drivers.map((driver) => driver.season);
    return [...new Set(seasons)].sort((a, b) => b - a);
}

export function getTeamsBySeason(season) {
    const teams = getDriversBySeason(season).map((driver) => driver.team);
    return [...new Set(teams)].sort();
}

export function getDriversBySeason(season, team) {
    return drivers
    .filter((driver) => driver.season === (Number(season)))
    .filter((driver) => !team || driver.team === team)
    .sort((a, b) => a.position - b.position);
}

export function getTeamStandings(season) {
    const teams = {};

    getDriversBySeason(season).forEach((driver) => {
        if (!teams[driver.team]) {
            teams[driver.team] = {name: driver.team, points: 0, drivers: [] };
        }
        teams[driver.team].points += driver.points;
        teams[driver.team].drivers.push(driver);
    });

    return Object.values(teams).sort((a, b) => b.points - a.points);
}

export function getDriverBySlug(season, slug) {
    return drivers.find((driver) => driver.season === (Number(season)) && driver.slug === slug);
}

export function getDriverSeasons(slug) {
    return drivers
    .filter((driver) => driver.slug === slug)
    .map((driver) => driver.season)
    .sort((a, b) => b - a);
}


