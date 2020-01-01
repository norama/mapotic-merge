// https://jonisalonen.com/2014/computing-distance-between-coordinates-can-be-simple-and-fast/

const deglen2 = 110.25 * 110.25;

export function distance2(lat, lon, lat0, lon0) {
    const x = lat - lat0;
    const y = (lon - lon0) * Math.cos(lat0);
    return deglen2 * (x*x + y*y);
}