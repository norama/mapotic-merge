import Mapotic from '../api/Mapotic.js';

import { chain } from '../api/util/promise.js';
import { slug } from '../api/util/data.js';

function importPlaces(sources, areas, targetMap, api, updateProgress) {
    const mapotic = new Mapotic(api, targetMap.id);

    console.log('sources', sources);

    return chain(sources.map((source, index) => {
        const setProgress = (progress) => {
            updateProgress({
                progress,
                title: "" + source.name + ": " + slug(source.map.url),
                message: "" + (index + 1) + "/" + sources.length
            });
        };

        setProgress(Math.floor((index + 1) * (100 / sources.length)));

        return mapotic.merge(source.map, source.selectedCategories, areas, console.log);
    }));
}

export default importPlaces;