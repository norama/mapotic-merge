import React from 'react';
import { ToastContainer, toast } from 'react-toastify';

import Main from './Main';
import './App.css';

const App = () => (
    <div className="App">
        <Main />
        <ToastContainer position="bottom-center" autoCloe={8000} />
    </div>
);

export default App;
