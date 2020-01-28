import { chain } from '../api/util/promise.js';
import { attributeEqual, categoryEqual } from '../api/util/equal.js';

import { ATTRIBUTES, CATEGORIES } from './constants.js';

function prepareTargetMap(targetMapUrl, api) {

    return api.getJson('/auth/me/').then((response) => {
        if (!response) {
            throw 'No maps for user.';
        }
        if (response.maps && response.maps.my) {
            const targetMap = response.maps.my.find(map => map.url === targetMapUrl);
            if (targetMap) {
                return targetMap;
            } else {
                throw 'URL: ' + targetMapUrl + ' is not among user maps.';
            }
        } else {
            throw 'No maps for user.';
        }
    }).then((targetMap) => (
        api.getJson('/maps/' + targetMap.id + '/')
    )).then((targetMap) => {

        const getAttributes = () => (
            api.getJson('/maps/' + targetMap.id + '/attributes/')
        );

        const postAttribute = (attr, attributes) => {
            const a = attributes.find((attribute) => (attributeEqual(attr, attribute)));
            return a ?
                Promise.resolve(a) :
                api.postJson('/maps/' + targetMap.id + '/attributes/', attr);
        };

        const postCategory = (cat, categories) => {
            const c = categories.find((category) => (categoryEqual(cat, category)));
            return c ?
                Promise.resolve(c) :
                api.postJson('/maps/' + targetMap.id + '/categories/', cat);
        };

        return getAttributes().then((origAttributes) => (
            chain((index) => (postAttribute(ATTRIBUTES[index], origAttributes)), ATTRIBUTES.length)
        )).then((attributes) => (
            chain((index) => (postCategory(CATEGORIES[index], targetMap.categories)), CATEGORIES.length).then(() => (attributes))
        )).then((attributes) => (
            api.getJson('/maps/' + targetMap.id + '/').then((targetMap) => ({
                targetMap, attributes
            }))
        ));
    });
}

export default prepareTargetMap;