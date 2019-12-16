import React, { useState } from 'react';

import GoogleLogin from 'react-google-login';
import GoogleButton from 'react-google-button';
import { toast } from 'react-toastify';

import { Button, Form, FormGroup, Label, Input, FormText } from 'reactstrap';
import Api from '../network/Api';

import './Login.css';


const GOOGLE_CLIENT_ID = "18175686909-9ruee794234g1q8qsc3rdps0flr3ddnp.apps.googleusercontent.com";

const Login = ({ onLogin }) => {

    const [ targetMapUrl, setTargetMapUrl ] = useState('');
    const [ token, setToken ] = useState('');

    const responseGoogle = (response) => {
        console.log('accessToken', response.accessToken);

        fetch(process.env.REACT_APP_MAPOTIC_API + '/auth/social/login/google/', {
            method: "POST",
            headers: { accept: 'application/json' },
            body: { access_token: response.accessToken }
        }).then((response) => {
            if (!response.ok) {
                throw response;
            }
            return response.json();
        }).then((response) => {
            console.log(response);
            handleTargetMap(new Api('Token ' + response.token));
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

    const handleChange = (event) => {
        setTargetMapUrl(event.target.value);
    };

    const handleTokenChange = (event) => {
        setToken(event.target.value);
    };

    const handleSubmit = () => {
        handleTargetMap(new Api('Token ' + token));
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
                    <Input type="url" name="targetMapUrl" value={targetMapUrl} onChange={handleChange} id="targetMapUrl" placeholder="target map URL" />
                </FormGroup>
                <FormGroup>
                    <Input type="text" name="token" value={token} onChange={handleTokenChange} id="token" placeholder="Mapotic token copied from mapotic network" />
{/*
                    <GoogleLogin
                        clientId={GOOGLE_CLIENT_ID}
                        render={(renderProps) => (
                            <GoogleButton onClick={renderProps.onClick} label="login with Google" />
                        )}
                        onSuccess={responseGoogle}
                        onFailure={failureGoogle}
                        cookiePolicy={'single_host_origin'}
                    />
*/}
                </FormGroup>

                <FormGroup>
                    <Button onClick={handleSubmit}>Submit</Button>
                </FormGroup>
            </Form>
        </div>
    );
};

export default Login;