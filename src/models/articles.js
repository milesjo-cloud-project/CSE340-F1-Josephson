import pool from './db.js';

export async function getArticles(limit = null) {
    const sql = `
    SELECT a.id, a.title, a.slug, a.body, a.published_at, u.name AS author
    FROM articles a
    LEFT JOIN users u ON u.id = a.author_id
    ORDER BY a.published_at DESC
    LIMIT $1`;

    const { rows } = await pool.query(sql, [limit]);
    return rows;
    
}

export async function getArticleBySlug(slug) {
    const sql = `
    SELECT a.id, a.title, a.slug, a.body, a.published_at, u.name AS author
    FROM articles a 
    LEFT JOIN users u ON u.id = a.author_id
    WHERE a.slug = $1`;

    const { rows } = await pool.query(sql, [slug]);
    return rows[0];
}
export async function getArticleById(id) {

    const sql = `
    SELECT id, title, slug, body, author_id
    FROM articles
    WHERE id = $1`;

    const { rows } = await pool.query(sql, [id]);
    return rows[0];
}

export async function createArticle(title, slug, body, authorId) {
    const sql = `
    INSERT INTO articles (title, slug, body, author_id)
    VALUES ($1, $2, $3, $4)
    RETURNING id, slug`;

    const { rows } = await pool.query(sql, [title, slug, body, authorId]);
    return rows[0];
}

export async function updateArticle(id, title, slug, body) {
    const sql = `
    UPDATE articles
    SET title = $2, slug = $3, body = $4
    WHERE id = $1
    RETURNING id, slug`;

    const { rows } = await pool.query(sql, [id, title, slug, body]);
    return rows[0];
}

export async function deleteArticle(id) {
    const { rowCount } = await pool.query('DELETE FROM articles WHERE id = $1', [id]);
    return rowCount > 0;
    
}

