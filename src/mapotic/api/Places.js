import { BASE_DEFINITION, PARENT_ATTRIBUTE } from './Constants.js';

import { attributeEqual } from './util/equal.js';
import { placeUrl } from './util/url.js';

class Places {

    constructor(places, mapId, mapSlug, attributeMap) {
        this.places = places;
        this.mapId = mapId;
        this.mapSlug = mapSlug;
        this.attributeMap = attributeMap;
    }

    attributeDefinition(attribute) {
        return {
            type: 'attribute',
            name: attribute.name.en,
            id: this.attributeMap[attribute.id],
            sourceId: attribute.id
        };
    }

    definitionForImport() {
        let definition = [...BASE_DEFINITION];
        let ids = new Set();
        this.places.forEach((place) => {
            place.attributes_values.forEach((attr) => {
                const attribute = attr.attribute;
                if (!attributeEqual(attribute, PARENT_ATTRIBUTE)) {
                    if (!ids.has(attribute.id)) {
                        definition.push(this.attributeDefinition(attribute));
                        ids.add(attribute.id);
                    }
                }
            })
        });
        definition.push(this.attributeDefinition(PARENT_ATTRIBUTE));
        return definition;
    }

    // TODO: this is not working, IDs are auto-generated
    id(place) {
        return this.mapId * 100000000 + place.id;
    }

    // TODO
    rating(place) {
        return place.rating && place.rating.average ? Math.round(place.rating.average) : 1
    }

    image(place) {
        return place.image ? place.image.image.medium : '';
    }

    videoLink(value) {
        if (value.youtube) {
            return 'https://www.youtube.com/watch?v=' + value.youtube;
        }
        if (value.vimeo) {
            return 'https://vimeo.com/' + value.vimeo;
        }
        console.error('unknown video config', value);
        return '';
    }

    attributeValue(attr) {
        let value = attr.value;
        const attribute = attr.attribute;
        switch (attribute.attribute_type) {
            case 'select':
                return attribute.settings.choices[value[0]].en;
            case 'multiple_select':
                return value.map((v) => attribute.settings.choices[v].en).join('!');
            case 'video':
                return this.videoLink(value);
            default:
                return value;
        }
    }

    parentLink(place) {
        return placeUrl(place, this.mapSlug);
    }

    forImport() {
        const definition = this.definitionForImport();

        const data = this.places.map((place) => {

            // start with base attributes
            let row = [
                place.name,
                place.category.name.en,
                place.point.coordinates[0],
                place.point.coordinates[1],
                this.id(place),
                this.rating(place),
                this.image(place)
            ];

            // continue with custom attributes
            definition.slice(row.length, definition.length - 1).forEach((def) => {
                const attr = place.attributes_values.find((attr) => (
                    attr.attribute.id === def.sourceId
                ));
                if (attr) {
                    row.push(this.attributeValue(attr));
                } else {
                    row.push('');
                }
            });
            
            // end with parent link
            row.push(this.parentLink(place));

            return row;
        });

        return { data, definition };
    }
}

export default Places;