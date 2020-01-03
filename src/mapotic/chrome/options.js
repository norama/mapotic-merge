import { login } from '../api/Api.js';

import config from './config.js';

const DEFAULT_OPTIONS = {
    distance: 50,
    display: "tab",
    collections: config.collections.map((collection) => (collection.name))
};

function showLoginForm() {
    document.getElementById("loginForm").style.display = "block";
    document.getElementById("optionsForm").style.display = "none";
}

function showOptionsForm() {
    document.getElementById("loginForm").style.display = "none";
    document.getElementById("optionsForm").style.display = "block";
}

function initFromStorage() {
    chrome.storage.sync.get(["collections", "distance", "display", "email", "mapoticAuth"], function(stored) {
        const options = stored.mapoticAuth ? stored : DEFAULT_OPTIONS;
        document.getElementById("distanceInput").value = options.distance;
        document.getElementById("newTab").checked = (options.display !== "window");
        document.getElementById("newWindow").checked = (options.display === "window");
        document.getElementById("userEmail").innerText = options.email ? options.email : "";
        config.collections.forEach((collection) => {
            document.getElementById(collection.name + "Input").checked =
                options.collections.includes(collection.name);
        });

        if (stored.mapoticAuth) {
            showOptionsForm();
        } else {
            showLoginForm();
        }

    });
}

function setSaveHandler() {
    document.getElementById("save").addEventListener("click", function() {
        if (!document.getElementById("optionsForm").checkValidity()) {
            return;
        }

        const collections = config.collections.reduce((acc, coll) => {
            if (document.getElementById(coll.name + "Input").checked) {
                acc.push(coll.name);
            }
            return acc;
        }, []);
        const distance = document.getElementById("distanceInput").value;
        const newTab = document.getElementById("newTab").checked;

        chrome.storage.sync.set({
            collections,
            distance,
            display: newTab ? "tab" : "window"
        }, function () {
            window.close();
        });
    });
}

function setLogoutHandler() {
    document.getElementById("logout").addEventListener("click", function() {
        chrome.storage.sync.clear(initFromStorage);
    });
}

function handleError(error) {
    chrome.notifications.create({ title: 'ERROR', message: error, iconUrl: "icons/icon48.png", type: "basic" });
}

function setLoginHandler() {
    document.getElementById("login").addEventListener("click", function(event) {
        if (!document.getElementById("loginForm").checkValidity()) {
            return;
        }

        event.preventDefault();

        const email = document.getElementById("emailInput").value;
        const password = document.getElementById("passwordInput").value;
        const onError = handleError; //chrome.extension.getBackgroundPage().alert;

        login(email, password, onError).then((mapoticAuth) => {
            if (mapoticAuth) {
                console.log('auth', mapoticAuth);
                chrome.storage.sync.set({
                    email,
                    mapoticAuth,
                    ...DEFAULT_OPTIONS
                }, initFromStorage);
            }
        });
    });
}

function setLocalizedTexts() {
    const ids = [
        "mapoticLogin",
        "email",
        "password",
        "login",
        "logout",
        "openedIn",
        "inNewTab",
        "inNewWindow",
        "save",
        "distance",
        "collections",
        "swimming",
        "skiing",
        "nature",
        "culture",
        "drinking",
        "shopping"
    ];
    ids.forEach((id) => {
        document.getElementById(id).innerHTML = chrome.i18n.getMessage(id);
    });
}

function onLoad() {
    setLocalizedTexts();

    initFromStorage();
    setSaveHandler();
    setLogoutHandler();
    setLoginHandler();
}

document.addEventListener("DOMContentLoaded", onLoad);