import React from 'react';
import { Button, InputGroupText, FormGroup, Label, Input, InputGroup, InputGroupAddon } from 'reactstrap';

import './Area.css';

const Area = ({ area, onChange }) => {

    const handleLatChange = (event) => {
        onChange({
            lat: event.target.value,
            lon: area.lon,
            dist: area.dist
        });
    };

    const handleLonChange = (event) => {
        onChange({
            lat: area.lat,
            lon: event.target.value,
            dist: area.dist
        });
    };

    const handleDistChange = (event) => {
        onChange({
            lat: area.lat,
            lon: area.lon,
            dist: event.target.value
        });
    };

    return (
        <FormGroup className="__Area__">
            <InputGroup>
                <InputGroupAddon addonType="prepend">
                    <InputGroupText>Lat</InputGroupText>
                </InputGroupAddon>
                <Input type="number" step="0.000001" placeholder="latitude" value={area.lat} onChange={handleLatChange} />
            </InputGroup>

            <InputGroup className="lon">
                <InputGroupAddon addonType="prepend">
                    <InputGroupText>Lon</InputGroupText>
                </InputGroupAddon>
                <Input type="number" step="0.000001" placeholder="longitude" value={area.lon} onChange={handleLonChange} />
            </InputGroup>

            <InputGroup>
                <InputGroupAddon addonType="prepend">
                    <InputGroupText>Dist (km)</InputGroupText>
                </InputGroupAddon>
                <Input type="number" placeholder="distance" value={area.dist} onChange={handleDistChange} />
            </InputGroup>
        </FormGroup>
    );
};

export default Area;