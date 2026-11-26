import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import 'dotenv/config';
import indexRouter from './src/routes/index.js';
import seasonsRouter from './src/routes/seasons.js';
import { notFoundHandler, errorHandler } from './src/middleware/errors.js';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import pool from './src/models/db.js';
import authRouter from './src/routes/auth.js'
import newsRouter from './src/routes/news.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

const PgSession = connectPgSimple(session);

app.use(session({
    store: new PgSession({ pool }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 2
    }
}));

app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

app.use('/', indexRouter);
app.use('/seasons', seasonsRouter);
app.use('/news', newsRouter);

app.use('/', authRouter);

app.use(notFoundHandler);
app.use(errorHandler);


app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));

