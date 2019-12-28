import { toast } from 'react-toastify';

class Api {

    constructor(authorization) {
        this.authorization = authorization;
        this.headers = { accept: 'application/json', 'content-type': 'application/json', authorization };
        this.dsHeaders = { accept: 'application/json', authorization };
    }

    fetchJson(url, method="GET", body=null) {
        return fetch(process.env.REACT_APP_MAPOTIC_API + url, {
            method,
            headers: this.headers,
            body: body ? JSON.stringify(body) : null
        }).then((response) => {
            if (!response.ok) {
                throw response;
            }
            return method === "DELETE" ? response.text() : response.json();
        }).catch((error) => {
            toast.error('Error');
            console.error(error);
            return null;
        });
    }

    getJson(url) {
        return this.fetchJson(url);
    }

    postJson(url, body) {
        return this.fetchJson(url, "POST", body);
    }

    putJson(url, body) {
        return this.fetchJson(url, "PUT", body);
    }

    patchJson(url, body) {
        return this.fetchJson(url, "PATCH", body);
    }

    deleteJson(url) {
        return this.fetchJson(url, "DELETE").then((res) => {
            console.log('res', res);
        });
    }

    fetchDataSource(url, method="GET", body=null) {
        return fetch(process.env.REACT_APP_MAPOTIC_API + url, {
            method,
            headers: this.dsHeaders,
            body
        }).then((response) => {
            if (!response.ok) {
                throw response;
            }
            return method === "DELETE" ? response.text() : response.json();
        }).catch((error) => {
            toast.error('Error');
            console.error(error);
            return null;
        });
    }

    postDataSource(url, body) {
        return this.fetchDataSource(url, "POST", body);
    }
}

export default Api;