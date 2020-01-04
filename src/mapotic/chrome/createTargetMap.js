import { chain } from '../api/util/promise.js';

import { ATTRIBUTES, CATEGORIES } from './constants.js';

function createTargetMap(center, api) {

    return api.postJson('/maps/create/', {
        name: "booking",
        description: "Merge hotels from booking.com with places of your interest.",
        topic: 9,
        lang: "cs",
        center: {
            type: "Point",
            coordinates: [center.lon, center.lat]
        }
    }).then((targetMap) => {
        const origCategory = targetMap.categories[0];
        const origAttributeIds = targetMap.categories[0].attributes;
        return api.deleteJson('/maps/' + targetMap.id + '/categories/' + origCategory.id + '/').then(() => (
            // workaround: subsequent POST category requests cause error 500 on server
            api.getJson('/maps/' + targetMap.id + '/categories/').then(() => (

            chain(origAttributeIds.map((attrId) => (
                api.deleteJson('/maps/' + targetMap.id + '/attributes/' + attrId + '/').then(() => (
                    api.getJson('/maps/' + targetMap.id + '/attributes/') // part of workaround
                ))
            )))

            // end of workaround
            ))
        ).then(() => (
            chain(ATTRIBUTES.map((attr) => (
                api.postJson('/maps/' + targetMap.id + '/attributes/', attr)
            )))
        )).then((attributes) => (
            chain(CATEGORIES.map((cat) => (
                // workaround: subsequent POST category requests cause error 500 on server
                api.getJson('/maps/' + targetMap.id + '/categories/').then(() => (

                    api.postJson('/maps/' + targetMap.id + '/categories/', cat)

                // end of workaround
                ))
            ))).then(() => (attributes))
        )).then((attributes) => (
            api.getJson('/maps/' + targetMap.id + '/').then((targetMap) => ({
                targetMap, attributes
            }))
        )));
    });
}

export default createTargetMap;