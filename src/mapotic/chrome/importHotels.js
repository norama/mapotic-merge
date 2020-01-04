import Mapotic from '../api/Mapotic.js';

import { CATEGORIES, BASE_DEFINITION } from './constants.js';

const categoryDefault = CATEGORIES[0].name.en;
const categorySoldOut = CATEGORIES[1].name.en;

function importHotels(hotels, targetMap, api, setProgress=console.log) {
    const customAttributes = targetMap.attributes.map((attribute) => ({...attribute, type: 'attribute'}));
    const definition = [...BASE_DEFINITION, ...customAttributes];
    const data = hotels.map((hotel) => ([
        hotel.name,
        hotel.soldOut ? categorySoldOut : categoryDefault,
        hotel.lon,
        hotel.lat,
        hotel.img,
        hotel.name,
        hotel.place,
        hotel.url,
        hotel.price
    ]));

    const mapotic = new Mapotic(api, targetMap.id);
    return mapotic.doImport(definition, data, setProgress);
}

export default importHotels;