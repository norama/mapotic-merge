import { chain } from '../api/util/promise.js';

const attributes = [{
    attribute_type: "inputtext",
    icon: "im-bus-stop",
    name: { en: "Název" },
    permission: "user",
    is_required: false,
    settings: {}
}, {
    attribute_type: "inputtext",
    icon: "im-office2",
    name: { en: "Místo" },
    permission: "user",
    is_required: false,
    settings: {}
}, {
    attribute_type: "inputtext",
    icon: "im-earth2",
    name: { en: "Web" },
    permission: "user",
    is_required: false,
    settings: {}
}, {
    attribute_type: "inputtext",
    icon: "im-dollar2",
    name: { en: "Cena" },
    permission: "user",
    is_required: false,
    settings: {}
}];

const categories = [{
    name: { en: "Hotel" },
    color: "ff3a36",
    icon: "im-bed"
}, {
    name: { en: "Hotel - už je pozdě" },
    color: "ff3a36",
    icon: "im-clock-o"
}];

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
        ).then(
            chain(attributes.map((attr) => (
                api.postJson('/maps/' + targetMap.id + '/attributes/', attr)
            )))
        ).then(
            chain(categories.map((cat) => (
                // workaround: subsequent POST category requests cause error 500 on server
                api.getJson('/maps/' + targetMap.id + '/categories/').then(() => (

                    api.postJson('/maps/' + targetMap.id + '/categories/', cat)

                // end of workaround
                ))
            )))
        ).then(() => (targetMap)));
    });
}

export default createTargetMap;