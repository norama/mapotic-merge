import config from './config.js';

import Mapotic from '../api/Mapotic.js';
import { slug } from '../api/util/data.js';

function selectedSources(collections) {
    const selected = config.collections.filter((collection) => (collections.includes(collection.name)));
    return selected.reduce((acc, curr) => {
        curr.sources.forEach((source) => {
            acc.push({ ...source, name: curr.name });
        });
        return acc;
    }, []);
}

function selectedCategories(selectedCategoryNames, categories) {
    if (!selectedCategoryNames) {
        return categories;
    }
    return categories.filter((cat) => (selectedCategoryNames.includes(cat.name.en)));
}

function loadSource(source, api) {
    const sourceMapSlug = slug(source.map);
    return api.getJson('/maps/by-slug/' + sourceMapSlug + '/').then((map) => {
        console.log('sourceMap', map);
        const mapotic = new Mapotic(api, map.id);
        return mapotic.loadMap(sourceMapSlug).then((sourceMap) => ({
            map: { ...sourceMap, url: source.map },
            name: source.name,
            selectedCategories: selectedCategories(source.categories, sourceMap.categories)
        }));
    });
};

function loadSources(collections, api) {
    const sources = selectedSources(collections);

    return Promise.all(sources.map((source) => (loadSource(source, api))));
}

export default loadSources;