import { body } from 'express-validator';

export const registerRules = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required.')
        .isLength({ max: 100 }).withMessage('Name must be 100 characters or less. '),
    body('email')
        .trim()
        .isEmail().withMessage('Enter a valid email address.')
        .normalizeEmail({gmail_remove_dots: false}),
    body('password')
        .isLength({min: 8}).withMessage('Password must be at least 8 characters.')
        .matches(/\d/).withMessage('Password must contain a number.')
        .matches(/[^A-Za-z0-9]/).withMessage('Password must contain a symbol.')
];