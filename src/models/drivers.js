import pool from './db.js';

const driverColumns = `
    se.season, se.position, d.name, d.slug, t.name AS team,
    se.points::float AS points, se.starts, se.wins, se.podiums,
    se.retirements, se.penalties,
    se.licence_points AS "licensePoints", se.disqualifications`;

const fromEntries = `
    FROM season_entries se
    JOIN drivers d ON d.id = se.driver_id
    LEFT JOIN teams t ON t.id = se.team_id`;

export async function getSeasons() {
    const { rows } = await pool.query(
        'SELECT DISTINCT season FROM season_entries ORDER BY season DESC');
    return rows.map((r) => r.season);
}

export async function getDriversBySeason(season, team) {
    const { rows } = await pool.query(`
        SELECT ${driverColumns} ${fromEntries}
        WHERE se.season = $1 AND ($2 = '' OR t.name = $2)
        ORDER BY se.position`, [season, team || '']);
    return rows
}

export async function getTeamsBySeason(season){
    const { rows } = await pool.query(`
        SELECT DISTINCT t.name ${fromEntries}
        WHERE se.season = $1
        ORDER BY t.name`, [season]);
    return rows.map((r) => r.name);
}

export async function getTeamStandings(season) {
    const teams = {};

    (await getDriversBySeason(season)).forEach((driver) => {
           if (!teams[driver.team]) {
            teams[driver.team] = {name: driver.team, points: 0, drivers: [] };
        }
        teams[driver.team].points += driver.points;
        teams[driver.team].drivers.push(driver);
    });

    return Object.values(teams).sort((a, b) => b.points - a.points);
}

export async function getDriverBySlug(season, slug) {
    const { rows } = await pool.query(`
        SELECT ${driverColumns} ${fromEntries}
        WHERE se.season = $1 AND d.slug = $2`, [season, slug]);
    return rows[0];
}

export async function getDriverSeasons(slug) {
    const { rows } = await pool.query(`
        SELECT se.season ${fromEntries}
        WHERE d.slug = $1
        ORDER BY se.season DESC`, [slug]);
    return rows.map((r) => r.season); 
}


