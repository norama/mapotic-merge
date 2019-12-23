import React, { useState } from 'react';

import { toast } from 'react-toastify';

import { Button, Form, FormGroup, Label, Input, FormText } from 'reactstrap';
import Api from '../network/Api';

import './Login.css';

const Login = ({ onLogin }) => {

    const [ targetMapUrl, setTargetMapUrl ] = useState('');
    const [ email, setEmail ] = useState('');
    const [ password, setPassword ] = useState('');

    const handleSubmit = () => {
        fetch(process.env.REACT_APP_MAPOTIC_API + '/auth/login/', {
            method: "POST",
            headers: { accept: 'application/json', 'content-type': 'application/json' },
            body: JSON.stringify({ email, password })
        }).then((response) => {
            if (!response.ok) {
                throw response;
            }
            return response.json();
        }).then((response) => {
            console.log(response);
            handleTargetMap(new Api('Token ' + response.auth_token));
        }).catch((error) => {
            toast.error('Error');
            console.error(error);
        }).finally(() => {
        });
    };

    const failureGoogle = (error) => {
        toast.error("Google login failure");
        console.log(error);
    }

    const handleTargetMapUrlChange = (event) => {
        setTargetMapUrl(event.target.value);
    };

    const handleEmailChange = (event) => {
        setEmail(event.target.value);
    };

    const handlePasswordChange = (event) => {
        setPassword(event.target.value);
    };

    const handleTargetMap = (api) => {
        api.fetchJson('/auth/me/').then((response) => {
            if (!response) {
                return;
            }
            if (response.maps && response.maps.my) {
                const targetMap = response.maps.my.find(map => map.url === targetMapUrl);
                if (targetMap) {
                    onLogin(api, targetMap);
                } else {
                    toast.error('URL: ' + targetMapUrl + ' is not among user maps.');
                }
            } else {
                toast.error('No maps for user.');
            }
        });
    };

    return (
        <div className="__Login__">
            <Form className="login-form">
                <FormGroup>
                    <Input type="url" name="targetMapUrl" value={targetMapUrl} onChange={handleTargetMapUrlChange} id="targetMapUrl" placeholder="Target map URL" />
                </FormGroup>
                <FormGroup>
                    <Input type="email" name="email" value={email} onChange={handleEmailChange} id="email" placeholder="E-mail" />
                    <Input type="password" name="password" value={password} onChange={handlePasswordChange} id="password" placeholder="Password" />
                </FormGroup>
                <FormGroup>
                    <Button onClick={handleSubmit}>Mapotic login</Button>
                </FormGroup>
            </Form>
        </div>
    );
};

export default Login;