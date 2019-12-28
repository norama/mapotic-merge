import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

import { Button, Form, FormGroup, Label, Input, FormText, InputGroup, InputGroupAddon } from 'reactstrap';

import { categoryEqual, attributeEqual } from '../util/equal';
import { chain } from '../util/promise';

import './Merge.css';

const PARENT_ATTRIBUTE = {
    name: { en: "__Parent__" },
    attribute_type: "inputtext",
    settings: [null],
    icon: "im-openid",
    permission: "user",
    is_required: false,
    can_edit: false
};

const Merge = ({ api, targetMap }) => {

    const [ sourceMapUrl, setSourceMapUrl ] = useState('');
    const [ sourceCategories, setSourceCategories ] = useState(null);
    const [ sourceAttributes, setSourceAttributes ] = useState(null);
    const [ sourcePlaces, setSourcePlaces ] = useState(null);
    const [ selectedCategories, setSelectedCategories ] = useState([]);
    const [ loading, setLoading ] = useState(false);

    const handleSourceMapUrlChange = (event) => {
        setSourceMapUrl(event.target.value);
        setSourceCategories(null);
        setSourceAttributes(null);
        setSelectedCategories([]);
    };

    const handleCategoriesChange = (event) => {
        setSelectedCategories([...event.target.selectedOptions].map((option) => (
            sourceCategories.find((cat) => (String(cat.id) === option.value))
        )));
    };

    const loadSource = () => {
        const k = sourceMapUrl.lastIndexOf('/');
        if (k > -1) {
            const sourceMapSlug = sourceMapUrl.substring(k + 1);
            api.getJson('/maps/by-slug/' + sourceMapSlug + '/').then((map) => {
                console.log('sourceMap', map);
                return loadAttributes(map.id).then((attributes) => {
                    console.log('sourceAttributes', attributes);
                    setSourceAttributes(attributes);
                }).then(() => {
                    return loadCategories(map.id).then((categories) => {
                        console.log('sourceCategories', categories);
                        setSourceCategories(categories);
                    });
                }).then(() => {
                    return loadPlaces(map.id).then((places) => {
                        setSourcePlaces(places);
                    });
                });
            });
        } else {
            toast.error('URL should contain "/" character.');
        }
    };

    const loadAttributes = (mapId) => {
        return api.getJson('/maps/' + mapId + '/attributes/');
    };

    const loadCategories = (mapId) => {
        return api.getJson('/maps/' + mapId + '/categories/');
    };

    const loadPlaces = (mapId) => {
        return api.getJson('/maps/' + mapId + '/pois.geojson/').then((response) => (response.features));
    }

    const loadTargetAttributes = () => {
        return loadAttributes(targetMap.id);
    };

    const loadTargetCategories = () => {
        return loadCategories(targetMap.id);
    }

    const loadTarget = () => {
        return loadTargetAttributes().then((targetAttributes) => {
            return loadTargetCategories().then((targetCategories) => ({
                targetAttributes,
                targetCategories
            }));
        });
    }

    const handleLoad = () => {
        loadSource();
    };

    const addAttributes = (targetAttributes, targetCategories) => {

        let attributeMap = {};

        const attributes = sourceAttributes.find((attr) => (
            attributeEqual(attr, PARENT_ATTRIBUTE)
        )) ? sourceAttributes : [...sourceAttributes, PARENT_ATTRIBUTE];

        const newAttributes = attributes.reduce((acc, sourceAttribute) => {
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
            api.postJson('/maps/' + targetMap.id + '/attributes/', {
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
                    api.deleteJson('/maps/' + targetMap.id + '/categories/' + category.id + '/attributes/' + attribute.id +'/')
                )))
            )))
        )).then(loadTargetAttributes).then((attributes) => ({
            attributes,
            attributeMap
        }));
    };

    const addCategories = (categories, attributes, attributeMap) => {
        const categoryBaseUrl = '/maps/' + targetMap.id + '/categories/';
        return chain(categories.map((category) => (

            // workaround: subsequent POST category requests cause error 500 on server
            api.getJson(categoryBaseUrl).then(() => (

            api.postJson(categoryBaseUrl, {
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
                    api.deleteJson(categoryBaseUrl + newCategory.id + '/attributes/' + attrId +'/')
                ))).then(() => {
                    return Promise.all(attributeIds.map((attrId, index) => (
                        api.putJson(categoryBaseUrl + newCategory.id + '/attributes/' + attrId +'/', { position: index })
                    ))).then(() => (newCategory));
                });
            })

            // end of workaround
            ))
        ))).then((newCategories) => {
            console.log(newCategories);
            return newCategories;
        });
    };

    // selection algorithm to keep number of places under control
    const selectPlaces = (categories) => {
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

    const addPlaces = (categories) => {
        const places = selectPlaces(categories);
        console.log('random places to be added', places);
        const content =
            'Nedamov 1,Lom,14.65639,50.53756,202967,xxx,Suitable for nudists,https://ce838d3ec.cloudimg.io/crop/400x266/n/_p_/media/image/geo/2941/319577/temp.jpg'+'\n'+
            'Nedamov 2,Lom,14.55639,50.58756,202968,,Suitable for nudists,https://ce838d3ec.cloudimg.io/crop/400x266/n/_p_/media/image/geo/2941/319577/temp.jpg';

        const importBaseUrl = '/maps/' + targetMap.id + '/datasource/';

        let fd = new FormData();
        fd.append('has_header', false);

        fd.append('source_file', new File([content], 'data.csv'));
        return api.postDataSource(importBaseUrl, fd).then((response) => {
            console.log('DS', response);
            const importId = response.id;
            return api.patchJson(importBaseUrl + '/' + importId + '/', {
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
                        "id": 17535
                      },
                      {
                        "type": "attribute",
                        "name": "Nuda pláž",
                        "id": 17540
                      },
                      {
                        "type": "image_url",
                        "name": "Adresa obrázku"
                      }
                    ]
            }).then(() => {
                return api.getJson(importBaseUrl + '/' + importId + '/analyze/').then((response) => {
                    console.log('analyze', response);
                    if (response && response.allow_import && (response.content_errors.length === 0) && (response.definition_errors.length === 0)) {
                        return api.postJson(importBaseUrl + '/' + importId + '/start/').then(() => new Promise((resolve) => {
                            const statusInterval = setInterval(() => {
                                api.getJson(importBaseUrl + '/' + importId + '/status/').then((response) => {
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

    const handleMerge = (event) => {
        event.preventDefault();

        setLoading(true);
        return loadTarget().then(({ targetAttributes, targetCategories }) => {
            console.log('targetAttributes', targetAttributes);
            console.log('targetCategories', targetCategories);
            return addAttributes(targetAttributes, targetCategories).then(({ attributes, attributeMap }) => {
                console.log('Missing attributes added.');
                console.log('attributeMap', JSON.stringify(attributeMap));
                const newCategories = selectedCategories.filter((category) => (
                    !targetCategories.find((targetCategory) => (categoryEqual(targetCategory, category))
                )));
                return addCategories(newCategories, attributes, attributeMap).then((categories) => {
                    console.log('Missing categories added.', categories);
                    toast.success('Categories added: ' + categories.map((category) => (category.name.en)));
                }).then(() => {
                    return addPlaces(selectedCategories).then((places) => {
                        console.log('places', places);
                    });
                })
            });
        }).then(() => {
            setLoading(false);
        });
    };

    return (
        <div className="__Merge__">
            <Form className="merge-form">
                <FormGroup>
                    <Label for="targetMap">Target Map</Label>
                    <h5 id="targetMap"><a href={targetMap.url} target="_blank" rel="noopener noreferrer">{targetMap.name}</a></h5>
                </FormGroup>

                <FormGroup>
                    <InputGroup>
                        <Input type="url" name="sourceMapUrl" value={sourceMapUrl} onChange={handleSourceMapUrlChange} id="sourceMapUrl" placeholder="source map URL" disabled={loading} />
                        <InputGroupAddon addonType="append"><Button onClick={handleLoad} disabled={loading}>Load categories</Button></InputGroupAddon>
                    </InputGroup>
                </FormGroup>

                { sourceCategories ?
                    <FormGroup>
                        <Label for="selectCategories">Select Multiple Categories</Label>
                        <Input type="select" onChange={handleCategoriesChange} size={""+sourceCategories.length} name="selectCategories" id="selectCategories" disabled={loading} multiple>
                        { sourceCategories.map((category) => (
                            <option key={category.id} value={category.id}>{category.name.en}</option>
                        ))}
                        </Input>
                    </FormGroup>
                : null }

                { sourceCategories ?
                    <FormGroup>
                        <div className="merge-label">Add places of selected categories in source map to target map.</div>
                        <Button type="button" color="primary" size="lg" onClick={handleMerge} disabled={loading || (selectedCategories.length === 0)} name="merge" id="merge">MERGE</Button>
                    </FormGroup>
                : null }
            </Form>
        </div>
    );
};

export default Merge;