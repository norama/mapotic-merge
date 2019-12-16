import React, { useState } from 'react';

import Login from './Login';
import Merge from './Merge';

const Main = () => {

    const [ api, setApi ] = useState(null);
    const [ targetMap, setTargetMap ] = useState(null);

    const handleLogin = (api, targetMap) => {
        setApi(api);
        setTargetMap(targetMap);
    };

    return api && targetMap ? (
        <Merge api={api} targetMap={targetMap} />
    ) : (
        <Login onLogin={handleLogin} />
    );
};

export default Main;