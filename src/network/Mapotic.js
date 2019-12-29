
import { categoryEqual, attributeEqual } from '../util/equal';
import { chain } from '../util/promise';

const PARENT_ATTRIBUTE = {
    name: { en: "__Parent__" },
    attribute_type: "inputtext",
    settings: [null],
    icon: "im-openid",
    permission: "user",
    is_required: false,
    can_edit: false
};

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
                    return { attributes, categories, places };
                });
            });
        });
    }

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
                attributeMap[sourceAttribute.id] = targetAttribute.id;
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
                attributeMap[newAttributes[i].id] = newTargetAttributes[i].id;
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
                name: category.name,
                color: category.color,
                icon: category.icon
            }).then((newCategory) => {
                const attributeIds = category.attributes.map((a) => (attributeMap[a]));

                // ensure parent is among attributes and put it to the end
                const parentAttribute = attributes.find((attribute) => (attribute.name.en === PARENT_ATTRIBUTE.name.en));
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

    // selection algorithm to keep number of places under control
    selectPlaces = (categories, sourcePlaces) => {
        const count = 3;
        const catIds = new Set(categories.map((category) => (category.id)));
        const places = sourcePlaces.filter((place) => (catIds.has(place.properties.category)));
        if (10 * count > places.length) {
            return places;
        }
        const selectedIndexes = [];
        while (selectedIndexes.length < count) {
            const index = Math.floor(Math.random() * places.length);
            if (!selectedIndexes.includes(index)) {
                selectedIndexes.push(index);
            }
        }
        return selectedIndexes.map((i) => (places[i]));
    };

    mergePlaces = (categories, sourcePlaces) => {
        const places = this.selectPlaces(categories, sourcePlaces);
        console.log('random places to be added', places);
        const content =
            'Nedamov 1,Lom,14.65639,50.53756,202967,xxx,Suitable for nudists,https://ce838d3ec.cloudimg.io/crop/400x266/n/_p_/media/image/geo/2941/319577/temp.jpg'+'\n'+
            'Nedamov 2,Lom,14.55639,50.58756,202968,,Suitable for nudists,https://ce838d3ec.cloudimg.io/crop/400x266/n/_p_/media/image/geo/2941/319577/temp.jpg';

        const importBaseUrl = '/maps/' + this.mapId + '/datasource/';

        let fd = new FormData();
        fd.append('has_header', false);

        fd.append('source_file', new File([content], 'data.csv'));
        return this.api.postDataSource(importBaseUrl, fd).then((response) => {
            console.log('DS', response);
            const importId = response.id;
            return this.api.patchJson(importBaseUrl + '/' + importId + '/', {
                    "definition": [
                      {
                        "type": "name",
                        "name": "Název místa"
                      },
                      {
                        "type": "category",
                        "name": "Kategorie"
                      },
                      {
                        "type": "lon",
                        "name": "Zeměpisná délka"
                      },
                      {
                        "type": "lat",
                        "name": "Zeměpisná šířka"
                      },
                      {
                        "type": "id",
                        "name": "ID záznamu"
                      },
                      {
                        "type": "attribute",
                        "name": "__Parent__",
                        "id": 17600
                      },
                      {
                        "type": "attribute",
                        "name": "Nuda pláž",
                        "id": 17598
                      },
                      {
                        "type": "image_url",
                        "name": "Adresa obrázku"
                      }
                    ]
            }).then(() => {
                return this.api.getJson(importBaseUrl + '/' + importId + '/analyze/').then((response) => {
                    console.log('analyze', response);
                    if (response && response.allow_import && (response.content_errors.length === 0) && (response.definition_errors.length === 0)) {
                        return this.api.postJson(importBaseUrl + '/' + importId + '/start/').then(() => new Promise((resolve) => {
                            const statusInterval = setInterval(() => {
                                this.api.getJson(importBaseUrl + '/' + importId + '/status/').then((response) => {
                                    console.log('status', response);
                                    console.log('progess', response.progress);
                                    if (response.progress === 100) {
                                        clearInterval(statusInterval);
                                        resolve(places);
                                    }
                                });
                            }, 3000);
                        }));
                    }
                });
            })
        })
    };

    merge = (sourceAttributes, sourceCategories, sourcePlaces) => {

        return this.loadAttributes().then((targetAttributes) => {
            console.log('targetAttributes', targetAttributes);
            return this.loadCategories().then((targetCategories) => {
                console.log('targetCategories', targetCategories);
                return this.mergeAttributes(sourceAttributes, targetAttributes, targetCategories).then(({
                    attributes,
                    attributeMap
                }) => {
                    const newCategories = sourceCategories.filter((sourceCategory) => (
                        !targetCategories.find((targetCategory) => (categoryEqual(targetCategory, sourceCategory))
                    )));
                    return this.mergeCategories(newCategories, attributes, attributeMap).then((addedCategories) => {
                        console.log('Missing categories added.', addedCategories);
                        return this.mergePlaces(sourceCategories, sourcePlaces).then((addedPlaces) => {
                            console.log('places', addedPlaces);
                            return ({ addedCategories, addedPlaces });
                        });
                    })
                });
            });
        });
    }
}

export default Mapotic;