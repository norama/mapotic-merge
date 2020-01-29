const MAPOTIC_URL = "https://www.testmapotic.com/";

export const MAPOTIC_API = MAPOTIC_URL + "api/v1";

export function mapUrl(mapSlug) {
    return MAPOTIC_URL + mapSlug;
}

export function placeUrl({ id, slug }, mapSlug) {
    return MAPOTIC_URL + mapSlug + '/' + id + '-' + slug;
}