export const handleError = (response, onError) => {
    return response.json().then((error) => {
        onError(JSON.stringify(error));
        throw error;
    });
};

class Api {

    constructor(authorization, onError) {
        this.authorization = authorization;
        this.onError = onError;
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
        return fetch(process.env.REACT_APP_MAPOTIC_API + url, {
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