import { MAPOTIC_API } from './util/url.js';

export const handleError = (response, onError) => {
    if (onError) {
        if (response.status === 500) {
            onError('Server error, see console.');
            throw response;
        } else {
            return response.json().then((error) => {
                onError(JSON.stringify(error));
                throw error;
            });
        }
    } else {
        throw response;
    }
};

export function login(email, password, onError) {
    return fetch(MAPOTIC_API + '/auth/login/', {
        method: "POST",
        headers: { accept: 'application/json', 'content-type': 'application/json' },
        body: JSON.stringify({ email, password })
    }).then((response) => {
        if (!response.ok) {
            return handleError(response, onError);
        }
        return response.json();
    }).then((response) => {
        return 'Token ' + response.auth_token;
    }).catch((error) => {
        if (onError) {
            console.error(error);
            return null;
        } else {
            throw error;
        }
    });
}

class Api {

    constructor(authorization, onError) {
        this.authorization = authorization;
        this.onError = onError;
        this.headers = { accept: 'application/json', 'content-type': 'application/json', authorization };
        this.dsHeaders = { accept: 'application/json', authorization };
    }

    fetchJson(url, method="GET", body=null) {
        return fetch(MAPOTIC_API + url, {
            method,
            headers: this.headers,
            body: body ? JSON.stringify(body) : null
        }).then((response) => {
            if (!response.ok) {
                return handleError(response, this.onError);
            }
            return method === "DELETE" ? response.text() : response.json();
        }).catch((error) => {
            if (this.onError) {
                console.error(error);
                return null;
            } else {
                throw error;
            }
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
        return this.fetchJson(url, "DELETE");
    }

    postDataSource(url, body) {
        return fetch(MAPOTIC_API + url, {
            method: "POST",
            headers: this.dsHeaders,
            body
        }).then((response) => {
            if (!response.ok) {
                return handleError(response, this.onError);
            }
            return response.json();
        }).catch((error) => {
            if (this.onError) {
                console.error(error);
                return null;
            } else {
                throw error;
            }
        });
    }
}

export default Api;