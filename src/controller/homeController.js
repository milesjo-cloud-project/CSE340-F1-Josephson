import { getSeasons } from '../models/drivers.js';
import { getRacesBySeason } from '../models/races.js';

export async function showHome(req, res) {
    const news = [
        { title: 'Season preview', summary: 'Everything you need to know before lights out.', url: '#' },
        { title: 'New rules explained', summary: 'What changes for the cars this year.', url: '#' },
    ];

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
