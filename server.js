import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import 'dotenv/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.render('home', { title: 'Guide to F1 for Beginners' });
});


app.use((req, res, next) => {
  const err = new Error('Page not found');
  err.status = 404;
  next(err);
});

app.use((err, req, res, next) => {
  const status = err.status || 500;
  console.error(err);                       // full details only in your terminal
  res.status(status).render('error', {
    title: status === 404 ? 'Not Found' : 'Server Error',
    message: status === 404 ? err.message : 'Something went wrong.',  // don't leak details
  });
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
