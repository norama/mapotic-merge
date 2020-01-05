// https://jonisalonen.com/2014/computing-distance-between-coordinates-can-be-simple-and-fast/

const deglen2 = 110.25 * 110.25;

export function distance2(lat, lon, lat0, lon0) {
    const x = lat - lat0;
    const y = (lon - lon0) * Math.cos(lat0);
    return deglen2 * (x*x + y*y);
}


// https://stackoverflow.com/questions/3518504/regular-expression-for-matching-latitude-longitude-coordinates

// eslint-disable-next-line
export const LATLON_PATTERN = '^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?)\s*,\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$';


export function point({ lat, lon }) {
    return {
        type: "Point",
        coordinates: [lon, lat]
    };
}