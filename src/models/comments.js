import pool from './db.js';

export async function getCommentsByRace(raceId) {
    const sql = `
    SELECT c.id, c.body, c.user_id, c.created_at, c.updated_at, u.name AS author
    FROM comments c
    JOIN users u ON u.id = c.user_id
    WHERE c.race_id = $1
    ORDER BY c.created_at`;

    const { rows } = await pool.query(sql, [raceId]);
    return rows;
}

export async function getCommentById(id) {
    const sql = `
    SELECT c.id, c.body, c.user_id, r.season, r.round
    FROM comments c
    JOIN races r ON r.id = c.race_id
    WHERE c.id = $1`;

    const { rows } = await pool.query(sql, [id]);
    return rows[0];
}

export async function createComment(raceId, userId, body) {
    const sql = `
    INSERT INTO comments (race_id, user_id, body)
    VALUES ($1, $2, $3)
    RETURNING id`;

    const { rows } = await pool.query(sql, [raceId, userId, body]);
    return rows[0];
}

export async function updateComment(id, body) {
    const sql = `
    UPDATE comments
    SET body = $2, updated_at = NOW()
    WHERE id = $1
    RETURNING id`;

    const { rows } = await pool.query(sql, [id, body]);
    return rows[0];
}

export async function deleteComment(id) {
    const { rowCount } = await pool.query('DELETE FROM comments WHERE id = $1', [id]);
    return rowCount > 0;
}
