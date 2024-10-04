export function parseUrlWithFilters({ url = '', filters = {} }) {
    return Object.entries(filters).reduce((prev, curr) => `${prev}${curr && '&'}${curr[0]}=${curr[1]}`, `${url}?`);
}
