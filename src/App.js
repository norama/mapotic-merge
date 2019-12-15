import React from 'react';
import { ToastContainer } from 'react-toastify';

import Main from './components/Main';
import './App.css';

const App = () => (
    <div className="App">
        <Main />
        <ToastContainer position="bottom-center" autoCloe={8000} />
    </div>
);

export default App;
