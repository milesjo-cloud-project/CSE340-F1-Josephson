import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'csv-parse/sync';
import pool from '../src/models/db.js';
import { slugify } from '../src/models/drivers.js';
import bcrypt from 'bcrypt';
import { createUser } from '../src/models/users.js';    

function readCsv(fileName) {
    const text = fs.readFileSync(path.join(process.cwd(), 'data', fileName), 'utf8');
    return parse(text, { columns: true, skip_empty_lines: true, trim: true});
}

function toIntOrNull(value) {
    return /^\d+$/.test(value) ? Number(value) : null;
}

const totals = readCsv('f1_2025-2026_driver_totals.csv');
const results = readCsv('f1_2025-2026_race_results.csv');
const races = readCsv('f1_2025-2026_races_and_circuits.csv');
const penalties = readCsv('f1_2025-2026_penalties.csv');

try {
    const schema = fs.readFileSync(path.join(process.cwd(), 'db', 'schema.sql'), 'utf8');
    await pool.query(schema);
    console.log('Schema created');

    const teamIds = new Map();
    const teamNames = new Set([...totals, ...results].map((row) => row['Team']));

    for (const name of teamNames) {
        const { rows } = await pool.query(
            'INSERT INTO teams (name) VALUES ($1) RETURNING id',
            [name]
        );
        teamIds.set(name, rows[0].id);
}
console.log(`Teams: ${teamIds.size}`);

const driverCodes = new Map();
for (const row of results) driverCodes.set(row['Driver'], row['Driver code'] || null);
for (const row of totals) {
    if (!driverCodes.has(row['Driver'])) driverCodes.set(row['Driver'], null);
}
const driverIds = new Map();
for (const [name, code] of driverCodes) {
    const { rows } = await pool.query(
        'INSERT INTO drivers (name, slug, code) VALUES ($1, $2, $3) RETURNING id',
        [name, slugify(name), code]
    );
    driverIds.set(name, rows[0].id);
}
console.log(`Drivers: ${driverIds.size}`)

const circuitIds = new Map();
for (const row of races) {
    if (circuitIds.has(row['Circuit'])) continue;
     const { rows } = await pool.query(
        'INSERT INTO circuits (name, city, country) VALUES ($1, $2, $3) RETURNING id',
        [row['Circuit'], row['City'], row['Country']]
        );
        circuitIds.set(row['Circuit'], rows[0].id);
    }
    console.log(`Circuits: ${circuitIds.size}`);

const raceIds = new Map();
for (const row of races) {
    const { rows } = await pool.query(
        `INSERT INTO races (season, round, name, race_day, circuit_id, sprint, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
        [
            Number(row['Season']),
            Number(row['Round']),
            row['Race'],
            row['Race day'] || null,
            circuitIds.get(row['Circuit']),
            row['Sprint'] === 'Yes',
            row['Status'],
        ]

    );
    raceIds.set(`${row['Season']}-${row[`Round`]}` , rows[0].id);
}
console.log(`Races: ${raceIds.size}`);

for (const row of totals) {
    await pool.query(
        `INSERT INTO season_entries
        (season, driver_id, team_id, position, points, starts, wins,
        podiums, retirements, penalties, licence_points, disqualifications)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
            Number(row['Season']),
            driverIds.get(row['Driver']),
            teamIds.get(row['Team']),
            Number(row['Position']),
            Number(row['Points']),
            Number(row['Starts']),
            Number(row['Wins']),
            Number(row['Podiums']),
            Number(row['Retirements']),
            Number(row['Penalties']),
            Number(row['Licence points']),
            Number(row['Disqualifications']),

        ]
    );
}
console.log(`Season entries: ${totals.length}`);

for (const row of results) {
    await pool.query(
        `INSERT INTO race_results
        (race_id, driver_id, team_id, finish, grid, status,
        race_points, sprint_points, licence_points)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
            raceIds.get(`${row['Season']}-${row['Round']}`),
            driverIds.get(row['Driver']),
            teamIds.get(row['Team']),
            toIntOrNull(row['Finish']),
            toIntOrNull(row['Grid']),
            row['Status'],
            Number(row['Race points']),
            Number(row['Sprint points']),
            Number(row['Licence points']),
        ]

    );
}
console.log(`Race results: ${results.length}`);

const testUsers = [
    { name: 'Admin User',  email: 'admin@f1fans.test',  role: 'admin' },
    { name: 'Editor User', email: 'editor@f1fans.test', role: 'editor' },
    { name: 'Fan User',    email: 'fan@f1fans.test',    role: 'fan' },
];

for (const user of testUsers) {
    const passwordHash = await bcrypt.hash('P@$$w0rd!', 10);
    await createUser(user.name, user.email, passwordHash, user.role);
}
console.log(`Users: ${testUsers.length}`);

for (const row of penalties) {
    await pool.query(
        `INSERT INTO penalties
        (race_id, driver_id, penalty, licence_points, reason, session, source)
        VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
            raceIds.get(`${row['Season']}-${row['Round']}`),
            driverIds.get(row['Driver']),
            row['Penalty'],
            Number(row['Licence points']),
            row['Reason'] || null,
            row['Session'] || null,
            row['Source'] || null,
        ]

    );
}
console.log(`Penalties: ${penalties.length}`);

    console.log('Seed complete');
} catch (err) {
    console.error('Seed failed', err.message);
    process.exitCode = 1;
} finally {
    await pool.end();
}