import { validationResult } from 'express-validator';
import { getArticles, getArticleBySlug, getArticleById, createArticle, updateArticle, deleteArticle } from '../models/articles.js';
import { notFound } from '../middleware/errors.js';
import { slugify, parseId, summarize } from '../utils/helpers.js';

export async function showNews(req, res, next) {
    try {
        const articles = (await getArticles()).map((a) => ({ ...a, summary: summarize(a.body) }));
        res.render('news', { title: 'News', articles });
    } catch (err) {
        next(err);
    }
}

export async function showArticle(req, res, next) {
    try {
        const article = await getArticleBySlug(req.params.slug);
        if (!article) {
            return next(notFound('Article not found'));
        }
        res.render('article', { title: article.title, article });
    } catch (err) {
        next(err);
    }
}

export function showNewArticle(req, res) {
    res.render('article-form', {
        title: 'New Article',
        action: '/news/new',
        button: 'Publish',
        errors: [],
        values: {},
    });
}

export async function handleCreateArticle(req, res, next) {
    const { title, body } = req.body;
    const values = { title, body };
    const renderForm = (errors) => res.status(400).render('article-form', {
        title: 'New Article',
        action: '/news/new',
        button: 'Publish',
        errors,
        values,
    });

    const result = validationResult(req);
    if (!result.isEmpty()) {
        return renderForm(result.array().map((e) => e.msg));
    }

    const slug = slugify(title);
    if (!slug) {
        return renderForm(['Title must contain at least one letter or number.']);
    }

    try {
        const article = await createArticle(title, slug, body, req.session.user.id);
        res.redirect(`/news/${article.slug}`);
    } catch (err) {
        if (err.code === '23505') {
            return renderForm(['An article with that title already exists.']);
        }
        next(err);
    }
}

export async function showEditArticle(req, res, next) {
    const id = parseId(req.params.id);
    try {
        const article = id && await getArticleById(id);
        if (!article) {
            return next(notFound('Article not found'));
        }
        res.render('article-form', {
            title: 'Edit Article',
            action: `/news/${id}/edit`,
            button: 'Save',
            errors: [],
            values: article,
        });
    } catch (err) {
        next(err);
    }
}

export async function handleUpdateArticle(req, res, next) {
    const id = parseId(req.params.id);
    if (!id) {
        return next(notFound('Article not found'));
    }

    const { title, body } = req.body;
    const values = { title, body };
    const renderForm = (errors) => res.status(400).render('article-form', {
        title: 'Edit Article',
        action: `/news/${id}/edit`,
        button: 'Save',
        errors,
        values,
    });

    const result = validationResult(req);
    if (!result.isEmpty()) {
        return renderForm(result.array().map((e) => e.msg));
    }

    const slug = slugify(title);
    if (!slug) {
        return renderForm(['Title must contain at least one letter or number.']);
    }

    try {
        const article = await updateArticle(id, title, slug, body);
        if (!article) {
            return next(notFound('Article not found'));
        }
        res.redirect(`/news/${article.slug}`);
    } catch (err) {
        if (err.code === '23505') {
            return renderForm(['An article with that title already exists.']);
        }
        next(err);
    }
}

export async function handleDeleteArticle(req, res, next) {
    const id = parseId(req.params.id);
    try {
        const deleted = id && await deleteArticle(id);
        if (!deleted) {
            return next(notFound('Article not found'));
        }
        res.redirect('/news');
    } catch (err) {
        next(err);
    }
}