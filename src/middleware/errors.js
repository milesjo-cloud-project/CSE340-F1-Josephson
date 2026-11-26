export function notFoundHandler(req, res, next) {
    const err = new Error('Page not found');
    err.status = 404;
    next(err);
}

export function errorHandler(err, req, res, next) {
    const status = err.status || 500;
    console.error(err);
    res.status(status).render('error', {
        title: status === 404 ? 'Not Found' : 'Server Error',
        message: status === 404 ? err.message : 'Something went wrong.',
    });
}