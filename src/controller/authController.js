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
    res.render('register', {title: 'Register', errors: [], values: {} });

}

