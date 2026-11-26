import pool from './db.js';

const resultColumns = `
    r.season, r.round, r.name AS race,
    d.name AS driver, d.slug, t.name AS team,
    rr.grid, COALESCE(rr.finish::text, rr.status) AS finish, rr.status,
    rr.race_points::float AS "racePoints",
    rr.sprint_points::float AS "sprintPoints"`;

export async function getDriverResults(season, slug) {
    const { rows } = await pool.query(`
        SELECT ${resultColumns}
        FROM race_results rr
        JOIN races r   ON r.id = rr.race_id
        JOIN drivers d ON d.id = rr.driver_id
        LEFT JOIN teams t ON t.id = rr.team_id
        WHERE r.season = $1 AND d.slug = $2
        ORDER BY r.round`, [season, slug]);
    return rows;
}

export async function getRaceResults(season, round) {
    const { rows } = await pool.query(`
        SELECT ${resultColumns}
        FROM race_results rr
        JOIN races r   ON r.id = rr.race_id
        JOIN drivers d ON d.id = rr.driver_id
        LEFT JOIN teams t ON t.id = rr.team_id
        WHERE r.season = $1 AND r.round = $2
        ORDER BY rr.finish NULLS LAST`, [season, round]);
    return rows;
}
