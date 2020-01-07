import { chain } from '../api/util/promise.js';

import { ATTRIBUTES, CATEGORIES, CENTER } from './constants.js';

function createTargetMap(api) {

    return api.postJson('/maps/create/', {
        name: "booking",
        description: "Merge hotels from booking.com with places of your interest.",
        topic: 9,
        lang: "cs",
        center: CENTER
    }).then((targetMap) => {
        const origCategory = targetMap.categories[0];
        const origAttributeIds = targetMap.categories[0].attributes;

        const deleteAttribute = (attrId) => (
            api.deleteJson('/maps/' + targetMap.id + '/attributes/' + attrId + '/')
        );

        const postAttribute = (attr) => (
            api.postJson('/maps/' + targetMap.id + '/attributes/', attr)
        );

        const postCategory = (cat) => (
            api.postJson('/maps/' + targetMap.id + '/categories/', cat)
        );

        return api.deleteJson('/maps/' + targetMap.id + '/categories/' + origCategory.id + '/').then(() => (
            chain((index) => (deleteAttribute(origAttributeIds[index])), origAttributeIds.length)
        ).then(() => (
            chain((index) => (postAttribute(ATTRIBUTES[index])), ATTRIBUTES.length)
        )).then((attributes) => (
            chain((index) => (postCategory(CATEGORIES[index])), CATEGORIES.length).then(() => (attributes))
        )).then((attributes) => (
            api.getJson('/maps/' + targetMap.id + '/').then((targetMap) => ({
                targetMap, attributes
            }))
        )));
    });
}

export default createTargetMap;