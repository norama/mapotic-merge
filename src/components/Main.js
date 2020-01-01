import React from 'react';
import { useCookies } from 'react-cookie';

import { toast } from 'react-toastify';

import Api from '../mapotic/api/Api';

import Login from './Login';
import User from './User';
import Merge from './Merge';

const month = 30 * 24 * 60 * 60;

export const CookieOptions = {
    path: '/',
    maxAge: month
};


// Vaslavske nam, 100km
export const DefaultArea = {
    lat: 50.081764,
    lon: 14.427178,
    dist: 100
};

const Main = () => {

    const [ cookies, setCookie, removeCookie ] = useCookies(['mapoticEmail', 'mapoticAuth', 'mapoticTargetMap', 'mapoticArea']);

    const handleLogin = (email, api, targetMap) => {
        setCookie('mapoticEmail', email, CookieOptions);
        setCookie('mapoticAuth', api.authorization, CookieOptions);
        setCookie('mapoticTargetMap', targetMap, CookieOptions);
        setCookie('mapoticArea', DefaultArea, CookieOptions);
    };

    const handleLogout = () => {
        removeCookie('mapoticEmail');
        removeCookie('mapoticAuth');
        removeCookie('mapoticTargetMap');
        removeCookie('mapoticArea');
    }

    return cookies.mapoticEmail && cookies.mapoticAuth && cookies.mapoticTargetMap ? (
        <>
            <User email={cookies.mapoticEmail} onLogout={handleLogout} />
            <Merge api={new Api(cookies.mapoticAuth, toast.error)} targetMap={cookies.mapoticTargetMap} />
        </>
    ) : (
        <Login onLogin={handleLogin} />
    );
};

export default Main;