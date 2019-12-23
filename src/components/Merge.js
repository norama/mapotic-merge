import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

import { Button, Form, FormGroup, Label, Input, FormText, InputGroup, InputGroupAddon } from 'reactstrap';

import './Merge.css';

const Merge = ({ api, targetMap }) => {

    const [ targetCategories, setTargetCategories ] = useState(null);
    const [ sourceMapUrl, setSourceMapUrl ] = useState('');
    const [ sourceMap, setSourceMap ] = useState(null);
    const [ sourceCategories, setSourceCategories ] = useState(null);
    const [ selectedCategories, setSelectedCategories ] = useState([]);

    useEffect(() => {
        api.fetchJson('/maps/' + targetMap.id + '/public-categories/').then((categories) => {
            setTargetCategories(categories);
            console.log('targetCategories', categories);
        });
    }, []);

    const handleChange = (event) => {
        setSourceMapUrl(event.target.value);
    };

    const handleCategoriesChange = (event) => {
        setSelectedCategories([...event.target.selectedOptions].map((option) => (
            sourceCategories.find((cat) => (String(cat.id) === option.value))
        )));
    };

    const loadSourceCategories = () => {
        const k = sourceMapUrl.lastIndexOf('/');
        if (k > -1) {
            const sourceMapSlug = sourceMapUrl.substring(k + 1);
            api.fetchJson('/maps/by-slug/' + sourceMapSlug + '/').then((map) => {
                setSourceMap(map);
                console.log('sourceMap', map);
                api.fetchJson('/maps/' + map.id + '/public-categories/').then((categories) => {
                    setSourceCategories(categories);
                    console.log('sourceCategories', categories);
                });
            });
        } else {
            toast.error('URL should contain "/" character.');
        }
    };

    const handleMerge = (event) => {
        event.preventDefault();
        const categories = selectedCategories.filter((category) => (
            !targetCategories.find((targetCategory) => (targetCategory.name.en === category.name.en))
        ));
        Promise.all(categories.map((category) => (
            api.fetchJson('/maps/' + targetMap.id + '/categories/', "POST", {
                name: category.name,
                color: category.color,
                icon: category.icon
            })
        ))).then((newCategories) => {
            console.log(newCategories);
            toast.success('Categories added: ' + newCategories.map((category) => (category.name.en)));
            setTargetCategories((categories) => ([...categories, ...newCategories]));
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
                        <Input type="url" name="sourceMapUrl" value={sourceMapUrl} onChange={handleChange} id="sourceMapUrl" placeholder="source map URL" />
                        <InputGroupAddon addonType="append"><Button onClick={loadSourceCategories}>Load categories</Button></InputGroupAddon>
                    </InputGroup>
                </FormGroup>

                { sourceCategories ?
                    <FormGroup>
                        <Label for="selectCategories">Select Multiple Categories</Label>
                        <Input type="select" onChange={handleCategoriesChange} size={""+sourceCategories.length} name="selectCategories" id="selectCategories" multiple>
                        { sourceCategories.map((category) => (
                            <option key={category.id} value={category.id}>{category.name.en}</option>
                        ))}
                        </Input>
                    </FormGroup>
                : null }

                { sourceCategories ?
                    <FormGroup>
                        <div className="merge-label">Add places of selected categories in source map to target map.</div>
                        <Button type="button" color="primary" size="lg" onClick={handleMerge} disabled={selectedCategories.length === 0} name="merge" id="merge">MERGE</Button>
                    </FormGroup>
                : null }
            </Form>
        </div>
    );
};

export default Merge;