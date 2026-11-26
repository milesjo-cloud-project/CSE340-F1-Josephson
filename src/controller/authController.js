import bcrypt from 'bcrypt';
import { validationResult } from 'express-validator';
import { createUser, getUserByEmail } from '../models/users.js';

export async function handleRegister(req, res, next) {
    const { name, email, password} = req.body;
    const values = { name, email };

    const result = validationResult(req);
    if (!result.isEmpty()) {
        const errors = result.array().map((e) => e.msg);
        return res.status(400).render('register', {title: 'Register', errors, values });
    }

    try {
        if (await getUserByEmail(email)) {
            return res.status(400).render('register', {
                title: 'Register',
                errors: ['Email already registered.'],
                values
            });
        }

        const hash = await bcrypt.hash(password, 10);
        const user = await createUser(name, email, hash);

        req.session.regenerate((err) => {
            if (err) return next(err);
            req.session.user = { id: user.id, name: user.name, role: user.role };
            res.redirect('/');
        });
    } catch (err) {
        next(err);
    }
}
export function showRegister(req, res) {
    res.render('register', { title: 'Register', errors: [], values: {} });
}

export function showLogin(req, res) {
    res.render('login', { title: 'Log In', errors: [], values: {} });
}

export async function handleLogin(req, res, next) {
    const { email, password } = req.body;
    const values = { email };

    const result = validationResult(req);
    if (!result.isEmpty()) {
        const errors = result.array().map((e) => e.msg);
        return res.status(400).render('login', { title: 'Log In', errors, values });
    }

    try {
        const user = await getUserByEmail(email);
        const ok = user && await bcrypt.compare(password, user.password_hash);

        if (!ok) {
            return res.status(401).render('login', {
                title: 'Log In',
                errors: ['Wrong email or password.'],
                values
            });
        }

        req.session.regenerate((err) => {
            if (err) return next(err);
            req.session.user = { id: user.id, name: user.name, role: user.role };
            res.redirect('/');
        });
    } catch (err) {
        next(err);
    }
}

export function handleLogout(req, res, next) {
    req.session.destroy((err) => {
        if (err) return next(err);
        res.clearCookie('connect.sid');
        res.redirect('/');
    });
}