import { toast } from 'react-toastify';

class Api {

    constructor(authorization) {
        this.authorization = authorization;
    }

    fetchJson(url, method="GET", body=null) {
        return fetch(process.env.REACT_APP_MAPOTIC_API + url, {
            method,
            headers: { accept: 'application/json', 'content-type': 'application/json', authorization: this.authorization },
            body: body ? JSON.stringify(body) : null
        }).then((response) => {
            if (!response.ok) {
                throw response;
            }
            return response.json();
        }).catch((error) => {
            toast.error('Error');
            console.error(error);
            return null;
        });
    }
}

export default Api;