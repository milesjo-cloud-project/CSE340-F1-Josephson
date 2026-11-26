export function notFound(message) {
    const err = new Error(message);
    err.status = 404;
    return err;
}

export function notFoundHandler(req, res, next) {
    const err = new Error('Page not found');
    err.status = 404;
    next(err);
}

export function errorHandler(err, req, res, next) {
    const status = err.status || 500;
    console.error(err);
    res.status(status).render('error', {
        title: status === 404 ? 'Not Found' : status === 403 ?  'Forbidden' : 'Server Error',
        message: status < 500 ? err.message : 'Something went wrong.',
    });
}