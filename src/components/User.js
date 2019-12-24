import React from 'react';
import { Button, Badge } from 'reactstrap';

import './User.css';

const User = ({ email, onLogout }) => (
    <div className="__User__">
        <Badge color="light" className="email">{email}</Badge>
        <Button color="link" onClick={onLogout} className="logout-button">Logout</Button>
    </div>
);

export default User;
