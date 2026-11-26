import pool from './db.js';

export async function getRacesBySeason(season) {
    const sql = `
    SELECT r.season, r.round, r.name AS race,
        to_char(r.race_day, 'Mon DD, YYYY') AS date,
        c.name AS circuit, c.city, c.country,
        r.status, r.sprint,
        d.name AS winner, t.name AS "winningTeam"
        
    FROM races r
    LEFT JOIN  circuits c ON c.id = r.circuit_id
    LEFT JOIN  race_results rr ON rr.race_id = r.id AND rr.finish = 1
    LEFT JOIN  drivers d ON d.id = rr.driver_id
    LEFT JOIN teams t ON t.id = rr.team_id
    WHERE  r.season = $1
    ORDER BY r.round`;

const { rows } = await pool.query(sql, [season]);
return rows;
}