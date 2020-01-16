import { mapUrl, placeUrl } from '../api/util/url.js';
import { HOTEL_ATTRIBUTE } from './constants.js';

function hotelAttribute(targetMap) {
    return targetMap.attributes.find((attr) => (attr.name === HOTEL_ATTRIBUTE.name.en));
}

function getHotelUrl(targetMap, hotel, api) {
    const hotelAttr = hotelAttribute(targetMap);
    if (!hotelAttr) {
        api.onError('Hotel attr missing in target map!');
        return Promise.resolve(mapUrl(targetMap.slug));
    } 
    return api.getJson(`/maps/${targetMap.id}/pois.geojson/?attr${hotelAttr.id}=${hotel.id}`).then(
        (response) => (response.features)
    ).then((places) => {
        if (places && (places.length === 1)) {
            return placeUrl(places[0].properties, targetMap.slug);
        } else {
            api.onError('Multiple hotels with same hotle ID!');
            return mapUrl(targetMap.slug);
        }
    });
}

export default getHotelUrl;