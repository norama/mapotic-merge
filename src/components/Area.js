import React from 'react';
import { InputGroupText, FormGroup, Input, InputGroup, InputGroupAddon } from 'reactstrap';
import { LATLON_PATTERN } from '../mapotic/api/util/geo';

import './Area.css';

const Area = ({ area, onChange }) => {

    const handleLatLonChange = (event) => {
        const latlon = event.target.value.split(',');
        onChange({
            lat: parseFloat(latlon[0]),
            lon: parseFloat(latlon[1]),
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
            <InputGroup className="location">
                <InputGroupAddon addonType="prepend">
                    <InputGroupText>Location (lat,lon)</InputGroupText>
                </InputGroupAddon>
                <Input
                    type="text"
                    placeholder="lat,lon"
                    title="comma-separated lat,lon coordinates, copy from Mapotic"
                    pattern={LATLON_PATTERN}
                    value={"" + area.lat + "," + area.lon}
                    onChange={handleLatLonChange}
                />
            </InputGroup>

            <InputGroup>
                <InputGroupAddon addonType="prepend">
                    <InputGroupText>Dist (km)</InputGroupText>
                </InputGroupAddon>
                <Input
                    type="number"
                    min="1"
                    placeholder="distance"
                    title="max distance from location in km"
                    value={area.dist}
                    onChange={handleDistChange}
                />
            </InputGroup>
        </FormGroup>
    );
};

export default Area;