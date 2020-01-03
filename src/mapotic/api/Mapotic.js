
import { categoryEqual, attributeEqual } from './util/equal';
import { chain } from './util/promise';

import { distance2 } from './util/geo.js';

import { toCsv } from './util/data';

import { PARENT_ATTRIBUTE } from './Constants.js';
import Places from './Places';

class Mapotic {

    constructor(api, mapId) {
        this.api = api;
        this.mapId = mapId;
    }

    loadAttributes = () => {
        return this.api.getJson('/maps/' + this.mapId + '/attributes/');
    };

    loadCategories = () => {
        return this.api.getJson('/maps/' + this.mapId + '/categories/');
    };

    loadPlaces = () => {
        return this.api.getJson('/maps/' + this.mapId + '/pois.geojson/').then((response) => (response.features));
    }

    loadMap = () => {
        return this.loadAttributes().then((attributes) => {
            console.log('attributes', attributes);
            return this.loadCategories().then((categories) => {
                console.log('categories', categories);
                return this.loadPlaces().then((places) => {
                    console.log('places', places);
                    return { attributes, categories, places, id: this.mapId };
                });
            });
        });
    };

    extendAttributeMap = (attributeMap, sourceAttribute, targetAttribute) => {
        if (attributeEqual(sourceAttribute, PARENT_ATTRIBUTE)) {
            attributeMap[sourceAttribute.id] = PARENT_ATTRIBUTE.id;
            attributeMap[PARENT_ATTRIBUTE.id] = targetAttribute.id;
        } else {
            attributeMap[sourceAttribute.id] = targetAttribute.id;
        }
    };

    mergeAttributes = (attributes, targetAttributes, targetCategories) => {
        let attributeMap = {};

        const attributesWithParent = attributes.find((attr) => (
            attributeEqual(attr, PARENT_ATTRIBUTE)
        )) ? attributes : [...attributes, PARENT_ATTRIBUTE];

        const newAttributes = attributesWithParent.reduce((acc, sourceAttribute) => {
            const targetAttribute = targetAttributes.find((attr) => (
                attributeEqual(attr, sourceAttribute)
            ));
            if (targetAttribute) {
                this.extendAttributeMap(attributeMap, sourceAttribute, targetAttribute);
            } else {
                acc.push(sourceAttribute);
            }
            return acc;
        }, []);

        return chain((newAttributes.map((attribute) => (
            this.api.postJson('/maps/' + this.mapId + '/attributes/', {
                attribute_type: attribute.attribute_type,
                icon: attribute.icon,
                name: attribute.name,
                permission: attribute.permission,
                is_required: attribute.is_required,
                settings: attribute.settings
            })
        )))).then((newTargetAttributes) => {
            for (let i=0; i < newAttributes.length; ++i) {
                this.extendAttributeMap(attributeMap, newAttributes[i], newTargetAttributes[i]);
            }
            return newTargetAttributes;
        }).then((newTargetAttributes) => (
            // remove from all categories (to be added to new categories only)
            Promise.all(targetCategories.map((category) => (
                chain(newTargetAttributes.map((attribute) => (
                    this.api.deleteJson('/maps/' + this.mapId + '/categories/' + category.id + '/attributes/' + attribute.id +'/')
                )))
            )))
        )).then(this.loadAttributes).then((attr) => ({
            attributes: attr,
            attributeMap
        }));
    };

    mergeCategories = (categories, attributes, attributeMap) => {
        const categoryBaseUrl = '/maps/' + this.mapId + '/categories/';
        return chain(categories.map((category) => (

            // workaround: subsequent POST category requests cause error 500 on server
            this.api.getJson(categoryBaseUrl).then(() => (

            this.api.postJson(categoryBaseUrl, {
                name: { en: category.name.en.trim() },
                color: category.color,
                icon: category.icon
            }).then((newCategory) => {

                // category target attribute ids without parent
                let attributeIds = category.attributes.map((a) => (attributeMap[a]));
                attributeIds = attributeIds.filter((id) => (id !== PARENT_ATTRIBUTE.id));

                // add category target parent attribute ir to the end
                const parentAttribute = attributes.find((attribute) => (attributeEqual(attribute, PARENT_ATTRIBUTE)));
                const index = attributeIds.indexOf(parentAttribute.id);
                if (index >= 0) {
                    // shift to end
                    for (let i=index; i < attributeIds.length - 1; ++i) {
                        attributeIds[i] = attributeIds[i + 1];
                    }
                    attributeIds[attributeIds.length - 1] = parentAttribute.id;
                } else {
                    // add to end
                    attributeIds.push(parentAttribute.id);
                }

                // delete unnecessary attributes, fix positions of the remaining ones
                const delAttributeIds = newCategory.attributes.filter((a) => (!attributeIds.includes(a)));
                return Promise.all(delAttributeIds.map((attrId) => (
                    this.api.deleteJson(categoryBaseUrl + newCategory.id + '/attributes/' + attrId +'/')
                ))).then(() => {
                    return Promise.all(attributeIds.map((attrId, index) => (
                        this.api.putJson(categoryBaseUrl + newCategory.id + '/attributes/' + attrId +'/', { position: index })
                    ))).then(() => (newCategory));
                });
            })

            // end of workaround
            ))
        )));
    };

    filterPlacesByCategories = (sourcePlaces, categories) => {
        if (categories.length === 1) {
            return sourcePlaces.filter((place) => (place.properties.category === categories[0].id));
        }

        const catIds = new Set(categories.map((category) => (category.id)));
        return sourcePlaces.filter((place) => (catIds.has(place.properties.category)));
    };

    filterPlacesByArea = (sourcePlaces, area) => {
        const maxd2 = area.dist * area.dist;
        return sourcePlaces.filter((place) => (
                distance2(
                    place.geometry.coordinates[1], place.geometry.coordinates[0],
                    area.lat, area.lon
                ) <= maxd2
            ));
    };

    fetchPlaces = (sourcePlaces, sourceMapId, setProgress) => {
        const d = Math.floor(80 / sourcePlaces.length);
        const baseUrl = '/maps/' + sourceMapId + '/public-pois/';
        return Promise.all(sourcePlaces.map((place) => (
            this.api.getJson(baseUrl + place.properties.id + '/').then((response) => {
                setProgress((progress) => ({ collecting: progress.collecting + d, importing: 0 }));
                return response;
            })
        )));
    };

    filterPlaces = (sourcePlaces, categories, area) => {
        
        // filter by category
        let places = this.filterPlacesByCategories(sourcePlaces, categories);

        // filter by area
        return this.filterPlacesByArea(places, area);
    };

    doImport = (definition, data, setProgress) => {

        const importBaseUrl = '/maps/' + this.mapId + '/datasource/';

        let fd = new FormData();
        fd.append('has_header', false);

        fd.append('source_file', new File([toCsv(data)], 'data.csv'));
        return this.api.postDataSource(importBaseUrl, fd).then((response) => {
            console.log('DataSource posted', response);
            const importId = response.id;
            return this.api.patchJson(importBaseUrl + '/' + importId + '/', {
                definition
            }).then(() => {
                return this.api.getJson(importBaseUrl + '/' + importId + '/analyze/').then((response) => {
                    console.log('analyze', response);
                    if (response && response.allow_import && (response.content_errors.length === 0) && (response.definition_errors.length === 0)) {
                        return this.api.postJson(importBaseUrl + '/' + importId + '/start/').then(() => new Promise((resolve) => {
                            const statusInterval = setInterval(() => {
                                this.api.getJson(importBaseUrl + '/' + importId + '/status/').then((response) => {
                                    console.log('status', response);
                                    setProgress({ collecting: 100, importing: response.progress });
                                    if (response.progress === 100) {
                                        clearInterval(statusInterval);
                                        resolve(importId);
                                    }
                                });
                            }, 1000);
                        }));
                    } else {
                        return null;
                    }
                });
            })
        });
    }

    mergePlaces = (places, sourceMap, attributeMap, setProgress) => {

        return this.fetchPlaces(places, sourceMap.id, setProgress).then((places) => {
            setProgress({ collecting: 100, importing: 0 });
            console.log('places', places);
            const p = new Places(places, sourceMap.id, sourceMap.slug, attributeMap);
            const d = p.forImport();
            console.log('definition', d.definition);
            console.log('data', d.data);
            return this.doImport(d.definition, d.data, setProgress);
        });
    };

    merge = (sourceMap, selectedCategories, area, setProgress) => {

        return this.loadAttributes().then((targetAttributes) => {
            console.log('targetAttributes', targetAttributes);
            return this.loadCategories().then((targetCategories) => {
                console.log('targetCategories', targetCategories);
                return this.mergeAttributes(sourceMap.attributes, targetAttributes, targetCategories).then(({
                    attributes,
                    attributeMap
                }) => {
                    setProgress({ collecting: 10, importing: 0 });
                    const newCategories = selectedCategories.filter((sourceCategory) => (
                        !targetCategories.find((targetCategory) => (categoryEqual(targetCategory, sourceCategory))
                    )));
                    return this.mergeCategories(newCategories, attributes, attributeMap).then((addedCategories) => {
                        setProgress({ collecting: 20, importing: 0 });
                        console.log('Missing categories added.', addedCategories);

                        const places = this.filterPlaces(sourceMap.places, selectedCategories, area);
                        console.log('places to be added', places);

                        if (places.length) {
                            return this.mergePlaces(places, sourceMap, attributeMap, setProgress).then((importId) => {
                                return ({ addedCategories, places, importId });
                            });
                        } else {
                            return ({ addedCategories, places, importId: null });
                        }

                    })
                });
            });
        });
    }

    undoImport = (importId) => {
        return this.api.deleteJson('/maps/' + this.mapId + '/datasource/' + importId + '/created_geo/')
    };
}

export default Mapotic;