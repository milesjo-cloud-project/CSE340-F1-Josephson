import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import 'dotenv/config';
import indexRouter from './src/routes/index.js';
import seasonsRouter from './src/routes/seasons.js';
import { notFoundHandler, errorHandler } from './src/middleware/errors.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

app.use('/', indexRouter);
app.use('/seasons', seasonsRouter);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));