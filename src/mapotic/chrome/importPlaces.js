import Mapotic from '../api/Mapotic.js';

import { chain } from '../api/util/promise.js';
import { slug } from '../api/util/data.js';

function importPlaces(sources, areas, targetMap, api, updateProgress) {
    const mapotic = new Mapotic(api, targetMap.id);

    const mergeSource = (index) => (
        new Promise((resolve) => {
            const source = sources[index];
            mapotic.merge(source.map, source.selectedCategories, source.color, areas, console.log).then((response) => {
                updateProgress({
                    progress: Math.floor((index + 1) * (100 / sources.length)),
                    title: "" + source.name + ": " + slug(source.map.url),
                    message: "" + (index + 1) + "/" + sources.length
                }, () => {
                    resolve(response);
                });
            });
        })
    );

    return chain(mergeSource, sources.length);
}

export default importPlaces;