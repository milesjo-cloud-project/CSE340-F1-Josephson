import { getDriversBySeason, getDriverBySlug, getDriverSeasons, getTeamsBySeason, getTeamStandings, } from '../models/drivers.js';
import { getDriverResults, getRaceResults } from '../models/results.js';
import { getRacesBySeason } from '../models/races.js';
import { notFound } from '../middleware/errors.js';

export async function showDrivers(req, res) {
    const { season } = req.params;
    const team = req.query.team || '';

    res.render('season-drivers', {
        title: `Drivers for ${season}`,
        season,
        team,
        teams: await getTeamsBySeason(season),
        drivers: await getDriversBySeason(season, team),
    });
}

export async function showDriver(req, res, next) {
        const {season, slug } = req.params;
        const seasons = await getDriverSeasons(slug);

        if (seasons.length === 0) {
            return next(notFound('Driver not found'));
        }
    

    const stats = await getDriverBySlug(season, slug);

    if (!stats) {
        return res.redirect(`/seasons/${seasons[0]}/drivers/${slug}`);
    }

    res.render('driver-stats', {
        title: `${stats.name} - ${season}`,
        season: Number(season),
        seasons,
        stats,
        results: await getDriverResults(season, slug),
    });
}

export async function showTeams(req, res, next) {
    const { season } = req.params;
    const teams= await getTeamStandings(season);

    if (teams.length === 0) {
        return next(notFound('Season not found'));
    }

    res.render('season-teams', { title: `Teams for ${season}`, season, teams});

}

export async function showRaces(req, res, next) {
    const { season } = req.params;
    const races = await getRacesBySeason(season);

    if (races.length === 0) {
        return next(notFound('Season not found'));
    }

    res.render('season-races', { title: `Races for ${season}`, season, races });
}

export async function showRace(req, res, next) {
    const { season, round } = req.params;
    const race = (await getRacesBySeason(season)).find((r) => r.round === Number(round));

    if(!race) {
        return next(notFound('Race not found'));
    }

    res.render('race-results', {
        title: `${race.race} - ${season}`,
        season,
        race,
        results: await getRaceResults(season, round),
    });
}
