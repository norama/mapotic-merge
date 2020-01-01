import React, { useState } from 'react';
import { useCookies } from 'react-cookie';

import { toast } from 'react-toastify';

import { Button, Form, FormGroup, Label, Input, InputGroup, InputGroupAddon } from 'reactstrap';
import { Progress } from 'reactstrap';

import Area from './Area';
import { CookieOptions, DefaultArea } from './Main';

import Mapotic from '../network/Mapotic';

import './Merge.css';

function slug(url) {
    const k = url.lastIndexOf('/');
    return (k !== -1) ? url.substring(k + 1) : null;
}

const Merge = ({ api, targetMap }) => {

    const [ cookies, setCookie, removeCookie ] = useCookies(['mapoticArea']);

    const [ sourceMapUrl, setSourceMapUrl ] = useState('');
    const [ sourceMap, setSourceMap ] = useState(null);
    const [ selectedCategories, setSelectedCategories ] = useState([]);
    const [ loading, setLoading ] = useState(false);
    const [ area, setArea ] = useState(cookies.mapoticArea ? cookies.mapoticArea : DefaultArea);
    const [ importId, setImportId ] = useState(null);
    const [ progress, setProgress ] = useState(null);

    const handleSourceMapUrlChange = (event) => {
        setSourceMapUrl(event.target.value);
        setSourceMap(null);
        setSelectedCategories([]);
        setProgress(null);
    };

    const handleCategoriesChange = (event) => {
        setSelectedCategories([...event.target.selectedOptions].map((option) => (
            sourceMap.categories.find((cat) => (String(cat.id) === option.value))
        )));
    };

    const loadSource = (sourceMapSlug) => {
        return api.getJson('/maps/by-slug/' + sourceMapSlug + '/').then((map) => {
            console.log('sourceMap', map);
            const mapotic = new Mapotic(api, map.id);
            return mapotic.loadMap().then(setSourceMap);
        });
    };

    const handleLoad = () => {
        const sourceMapSlug = slug(sourceMapUrl);
        if (sourceMapSlug) {
            setLoading(true);
            loadSource(sourceMapSlug).finally(() => {
                setLoading(false);
            });
        } else {
            toast.error('URL should contain "/" character.');
        }
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            handleLoad();
        }
    };

    const handleMerge = (event) => {
        event.preventDefault();

        setCookie('mapoticArea', area, CookieOptions);

        setLoading(true);
        setProgress({ collecting: 0, importing: 0 });
        const mapotic = new Mapotic(api, targetMap.id);
        mapotic.merge(
            {...sourceMap, slug: slug(sourceMapUrl)},
            selectedCategories,
            area,
            setProgress
        ).then(({
            addedCategories,
            places,
            importId
        }) => {
            console.log('Categories added: ' + addedCategories.map((category) => (category.name.en)));

            setImportId(importId);
            setProgress({ collecting: 100, importing: 100 });

            if (importId) {
                toast.success('' + places.length + ' places added.');
            } else {
                toast.warn('No places added.');
            }
        }).finally(() => {
            setLoading(false);
        });
    };

    const handleUndo = (event) => {
        event.preventDefault();

        setLoading(true);
        const mapotic = new Mapotic(api, targetMap.id);
        mapotic.undoImport(importId).then(() => {
            toast.success('Places deleted.');
        }).finally(() => {
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

                <Area area={area} onChange={setArea} /> 

                <FormGroup className="sourceMapUrl">
                    <InputGroup>
                        <Input type="url" name="sourceMapUrl" value={sourceMapUrl} onChange={handleSourceMapUrlChange} onKeyPress={handleKeyPress} id="sourceMapUrl" placeholder="source map URL" disabled={loading} />
                        <InputGroupAddon addonType="append"><Button onClick={handleLoad} disabled={loading}>Load categories</Button></InputGroupAddon>
                    </InputGroup>
                </FormGroup>

                { sourceMap ?
                    <FormGroup>
                        <Input type="select" onChange={handleCategoriesChange} title="Select multiple categories" size={""+sourceMap.categories.length} name="selectCategories" id="selectCategories" disabled={loading} multiple>
                        { sourceMap.categories.map((category) => (
                            <option key={category.id} value={category.id}>{category.name.en}</option>
                        ))}
                        </Input>
                    </FormGroup>
                : null }

                { sourceMap ?
                    <FormGroup className="merge">
                        <Button type="button" color="primary" size="lg" onClick={handleMerge} title="Add places of selected categories in source map to target map" disabled={loading || (selectedCategories.length === 0)} name="merge" id="merge">MERGE</Button>
                    </FormGroup>
                : null }

                { sourceMap ?
                    <FormGroup className="undo">
                        <Button type="button" color="secondary" outline onClick={handleUndo} title="Delete places added in last MERGE" disabled={loading || !importId} name="undo" id="undo">UNDO</Button>
                    </FormGroup>
                : null }
            </Form>

            { progress ?
            <>
                <div className="merge-progress">
                    <>
                        <div className="text-center">{progress.collecting < 100 ? "Collecting data ..." : (progress.importing < 100 ? "Importing data ..." : "")}</div>
                        <Progress multi>
                            <Progress bar color="success" value={progress.collecting / 2} />
                            <Progress bar color="danger" value={progress.importing / 2} />
                        </Progress>
                    </>
                </div>
                { progress.collecting === 100 && progress.importing === 100 ?
                    <a href={targetMap.url} className="progress-link" target="_blank" rel="noopener noreferrer">Open {targetMap.name} in new tab.</a>
                    : null
                }
            </>
            : null }
        </div>
    );
};

export default Merge;