const MAPOTIC_URL = "https://www.mapotic.com/";

export function mapUrl(mapSlug) {
    return MAPOTIC_URL + mapSlug;
}

export function placeUrl({ id, slug }, mapSlug) {
    return MAPOTIC_URL + mapSlug + '/' + id + '-' + slug;
}