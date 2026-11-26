import { getSeasons } from "../models/drivers.js";

export function showHome(req, res) {
    const news = [
        { title: 'Season preview', summary: 'Everything you need to know beofre lights out', url: '#' },
        { title: 'New rules explained', summary: 'What changes for the cars this year', url:'#' },
    ];

    const races = [
        { name: 'Australian Grand Prix', date: 'March 15', url: '/races/australia'},
        { name: 'Chinese Grand Prix', date: 'March 22', url: '/races/china'},
    ];

    res.render('home', { title: 'Guide to f1 for Beginners', news, races });
}

export function latestSeasonRedirect(page) {
    return async (req, res) => {
        const latest = (await getSeasons())[0];
        res.redirect(`/seasons/${latest}/${page}`);
    };
}