import React, { useState } from 'react';
import { toast } from 'react-toastify';

import { Button, Form, FormGroup, Label, Input, InputGroup, InputGroupAddon } from 'reactstrap';

import Mapotic from '../network/Mapotic';

import './Merge.css';

const Merge = ({ api, targetMap }) => {

    const [ sourceMapUrl, setSourceMapUrl ] = useState('');
    const [ sourceMap, setSourceMap ] = useState(null);
    const [ selectedCategories, setSelectedCategories ] = useState([]);
    const [ loading, setLoading ] = useState(false);

    const handleSourceMapUrlChange = (event) => {
        setSourceMapUrl(event.target.value);
        setSourceMap(null);
        setSelectedCategories([]);
    };

    const handleCategoriesChange = (event) => {
        setSelectedCategories([...event.target.selectedOptions].map((option) => (
            sourceMap.categories.find((cat) => (String(cat.id) === option.value))
        )));
    };

    const loadSource = () => {
        const k = sourceMapUrl.lastIndexOf('/');
        if (k > -1) {
            const sourceMapSlug = sourceMapUrl.substring(k + 1);
            api.getJson('/maps/by-slug/' + sourceMapSlug + '/').then((map) => {
                console.log('sourceMap', map);
                const mapotic = new Mapotic(api, map.id);
                mapotic.loadMap().then(setSourceMap);
            });
        } else {
            toast.error('URL should contain "/" character.');
        }
    };

    const handleLoad = () => {
        loadSource();
    };

    const handleMerge = (event) => {
        event.preventDefault();

        setLoading(true);
        const mapotic = new Mapotic(api, targetMap.id);
        mapotic.merge(sourceMap.attributes, selectedCategories, sourceMap.places).then(({
            addedCategories,
            addedPlaces
        }) => {
            toast.success('Categories added: ' + addedCategories.map((category) => (category.name.en)));

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

                { sourceMap ?
                    <FormGroup>
                        <Label for="selectCategories">Select Multiple Categories</Label>
                        <Input type="select" onChange={handleCategoriesChange} size={""+sourceMap.categories.length} name="selectCategories" id="selectCategories" disabled={loading} multiple>
                        { sourceMap.categories.map((category) => (
                            <option key={category.id} value={category.id}>{category.name.en}</option>
                        ))}
                        </Input>
                    </FormGroup>
                : null }

                { sourceMap ?
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