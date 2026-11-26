// Small helpers shared by controllers, views and the seed script.

// "Nico Hülkenberg" -> "nico-hulkenberg", "What's new? Rules!" -> "whats-new-rules"
export function slugify(text) {
    return text
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/[\s-]+/g, '-');
}

// URL params are strings: "5" -> 5, anything else ("abc", "5x", "") -> null
export function parseId(value) {
    return /^\d+$/.test(value) ? Number(value) : null;
}

// First `length` characters of a text, with "…" if it was cut
export function summarize(text, length = 140) {
    return text.length > length ? text.slice(0, length) + '…' : text;
}
