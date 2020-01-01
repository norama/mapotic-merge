import React from 'react';
import { useCookies } from 'react-cookie';

import { toast } from 'react-toastify';

import Api from '../network/Api';

import Login from './Login';
import User from './User';
import Merge from './Merge';

const month = 30 * 24 * 60 * 60;

const CookieOptions = {
    path: '/',
    maxAge: month
};

const Main = () => {

    const [ cookies, setCookie, removeCookie ] = useCookies(['mapoticEmail', 'mapoticAuth', 'mapoticTargetMap']);

    const handleLogin = (email, api, targetMap) => {
        setCookie('mapoticEmail', email, CookieOptions);
        setCookie('mapoticAuth', api.authorization, CookieOptions);
        setCookie('mapoticTargetMap', targetMap, CookieOptions);
    };

    const handleLogout = () => {
        removeCookie('mapoticEmail');
        removeCookie('mapoticAuth');
        removeCookie('mapoticTargetMap');
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