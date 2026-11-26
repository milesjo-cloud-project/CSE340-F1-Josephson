import { getSeasons } from '../models/drivers.js';
import { getRacesBySeason } from '../models/races.js';
import { getArticles } from '../models/articles.js';
import { summarize } from '../utils/helpers.js';

export async function showHome(req, res) {
    const news = (await getArticles(3)).map((a) => ({
        title: a.title,
        summary: summarize(a.body),
        url: `/news/${a.slug}`,
    }));

    const season = (await getSeasons())[0];
    const seasonRaces = await getRacesBySeason(season);
    const upcoming = seasonRaces.filter((r) => !r.winner);
    const shown = upcoming.length > 0 ? upcoming.slice(0, 3) : seasonRaces.slice(-3);

    const races = shown.map((r) => ({
        name: r.race,
        date: r.date,
        url: `/seasons/${season}/races/${r.round}`,
    }));

    res.render('home', { title: 'Guide to F1 for Beginners', news, races });
}

export function latestSeasonRedirect(page) {
    return async (req, res) => {
        const latest = (await getSeasons())[0];
        res.redirect(`/seasons/${latest}/${page}`);
    };
}
