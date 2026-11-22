import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import 'dotenv/config';
import { getDriversBySeason, getDriverBySlug, getDriverSeasons, getTeamsBySeason } from'./src/models/drivers.js';
import { getDriverResults } from './src/models/results.js';


const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  const news = [
    { title: 'Season preview', summary: 'Everything you need to know before lights out.', url: '#' },
    { title: 'New rules explained', summary: 'What changes for the cars this year.', url: '#' },
  ];

  const races = [
    { name: 'Australian Grand Prix', date: 'March 15', url: '/races/australia' },
    { name: 'Chinese Grand Prix', date: 'March 22', url: '/races/china' },
  ];

  res.render('home', { title: 'Guide to F1 for Beginners', news, races });
});

app.get('/seasons/:season/drivers', (req, res, next) => {
  const { season } = req.params;
  const team = req.query.team || '';
  
  res.render('season-drivers', { 
    title: `Drivers for ${season}`, 
    season,
    team,
    teams: getTeamsBySeason(season), 
    drivers: getDriversBySeason(season, team) 
    });
  });


app.get('/seasons/:season/drivers/:slug', (req, res, next) => {
  const { season, slug } = req.params;

  const seasons = getDriverSeasons(slug);

  if (seasons.length === 0) {
    const err = new Error('Driver not found');
    err.status = 404;
    return next(err);
  }

  const stats = getDriverBySlug(season, slug);

  if (!stats) {
    return res.redirect(`/seasons/${seasons[0]}/drivers/${slug}`);
  }

  const results = getDriverResults(season, slug);

  res.render('driver-stats', {
    title: `${stats.name} - ${season}`,
    season: Number(season),
    seasons,
    stats,
    results,
  });
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
