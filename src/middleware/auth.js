export function requireLogin(req, res, next) {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    next();
}

export function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.session.user) {
            return res.redirect('/login');
        }
        if (!roles.includes(req.session.user.role)) {
            const err = new Error('You do not have permission to view this page.');
            err.status = 403;
            return next(err);
        }
        next();
    };
}