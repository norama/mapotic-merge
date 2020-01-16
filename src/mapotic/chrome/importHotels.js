import Mapotic from '../api/Mapotic.js';
import { point } from '../api/util/geo.js';

import { CATEGORIES, BASE_DEFINITION } from './constants.js';

const categoryDefault = CATEGORIES[0].name.en;
const categorySoldOut = CATEGORIES[1].name.en;

function avg(arr) {
    const sum = arr.reduce((acc, x) => (acc + x), 0);
    return sum / arr.length;
}

function center(hotels) {
    const lon = avg(hotels.map(hotel => hotel.lon));
    const lat = avg(hotels.map(hotel => hotel.lat));

    return point({ lon, lat });
}

function importHotels(hotels, targetMap, api, setProgress=console.log) {
    const customAttributes = targetMap.attributes.map((attribute) => ({...attribute, type: 'attribute'}));
    const definition = [...BASE_DEFINITION, ...customAttributes];
    const data = hotels.map((hotel) => ([
        hotel.name,
        hotel.soldOut ? categorySoldOut : categoryDefault,
        hotel.lon,
        hotel.lat,
        hotel.id,
        hotel.img,
        hotel.name,
        hotel.place,
        hotel.url,
        hotel.price,
        hotel.id
    ]));

    const mapotic = new Mapotic(api, targetMap.id);
    return mapotic.doImport(definition, data, setProgress).then((response) => (
        api.patchJson('/maps/' + targetMap.id + '/', {
            center: center(hotels)
        }).then(() => (response))
    ));
}

export default importHotels;