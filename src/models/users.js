import pool from './db.js';

export async function createUser(name, email, passwordHash, role = 'fan') {
    const sql = `
    INSERT INTO users (name, email, password_hash, role)
    VALUES ($1, $2, $3, $4)
    RETURNING id, name, email, role`;
    
    const { rows } = await pool.query(sql, [name, email.toLowerCase(), passwordHash, role]);
    return rows[0];
    
}

export async function getUserByEmail(email) {
    const sql = `
    SELECT id, name, email, password_hash, role
    FROM users
    WHERE email = $1`;
    
    const { rows } = await pool.query(sql, [email.toLowerCase()]);
    return rows[0];
}

export async function getUserById(id) {
    const sql = `
    SELECT id, name, email, role, created_at
    FROM users
    WHERE id = $1`;

    const { rows } = await pool.query(sql, [id]);
    return rows[0];
    
}