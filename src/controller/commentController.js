import { validationResult } from 'express-validator';
import { getCommentById, createComment, updateComment, deleteComment } from '../models/comments.js';
import { findRace, renderRace } from './seasonController.js';
import { notFound } from '../middleware/errors.js';
import { parseId } from '../utils/helpers.js';

function forbidden(message) {
    const err = new Error(message);
    err.status = 403;
    return err;
}
function raceUrl(comment) {
    return`/seasons/${comment.season}/races/${comment.round}#comments`;
}

function isOwner(comment, user) {
    return comment.user_id === user.id;
}

function isStaff(user) {
    return user.role === 'admin' || user.role === 'editor';
}

async function loadComment(req, next) {
    const id = parseId(req.params.id);
    const comment = id && await getCommentById(id);
    if (!comment) {
        next(notFound('Comment not found'));
        return null;
    }
    return comment;
}

export async function handleCreateComment(req, res, next) {
    const { season, round } = req.params;
    const body = req.body.body;

    const result = validationResult(req);
    if (!result.isEmpty()) {
        return renderRace(req, res, next, {errors: result.array().map((e) => e.msg), body });
    }

    const race = await findRace(season, round);
    if (!race) {
        return next(notFound('Race not found'));
    }

    await createComment(race.id, req.session.user.id, body);
    res.redirect(`/seasons/${season}/races/${round}#comments`);
}

export async function showEditComment(req, res, next) {
    const comment = await loadComment (req, next);
    if (!comment) return;

    if (!isOwner(comment, req.session.user)) {
        return next(forbidden('You can only edit your own comments.'));
    }

    res.render('comment-form', {
        title: 'Edit Comment',
        comment,
        errors: [],
        body: comment.body,
        cancelUrl: raceUrl(comment),
    });
}

export async function handleUpdateComment(req, res, next) {
    const comment = await loadComment(req, next);
    if (!comment) return;

    if (!isOwner(comment, req.session.user)) {
        return next(forbidden('You can only edit your own comments.'));
    }

    const body = req.body.body;
    const result = validationResult(req);
    if (!result.isEmpty()) {
        return res.status(400).render('comment-form', {
            title: 'Edit Comment',
            comment,
            errors: result.array().map((e) => e.msg),
            body,
            cancelUrl: raceUrl(comment),
        });
    }
    await updateComment(comment.id, body);
    res.redirect(raceUrl(comment));
}

export async function handleDeleteComment(req, res, next) {
    const comment = await loadComment(req, next);
    if (!comment) return;

    const user = req.session.user;
    if (!isOwner(comment, user) && !isStaff(user)) {
        return next(forbidden('You can only delete your own comments.'));
    }

    await deleteComment(comment.id);
    res.redirect(raceUrl(comment));
    
}
