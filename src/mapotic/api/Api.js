export const handleError = (response, onError) => {
    if (response.status === 500) {
        onError('Server error, see console.');
        throw error;
    } else {
        return response.json().then((error) => {
            onError(JSON.stringify(error));
            throw error;
        });
    }
};

const MAPOTIC_API = "https://www.mapotic.com/api/v1";

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
        console.error(error);
        return null;
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
            console.error(error);
            return null;
        });
    }
}

export default Api;