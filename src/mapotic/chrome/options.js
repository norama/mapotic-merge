import { login } from '../api/Api.js';

import config from './config.js';

const DEFAULT_OPTIONS = {
    distance: 50,
    display: "tab",
    collections: config.collections.map((collection) => (collection.name)),
    mapoticForBooking: true,
    customTargetMap: false
};

function showLoginForm(customTargetMap) {
    document.getElementById("loginForm").style.display = "block";
    document.getElementById("optionsForm").style.display = "none";
    document.getElementById("targetMapUrlInput").style.visibility = customTargetMap ? "visible" : "hidden";
    document.getElementById("targetMapUrlInput").required = customTargetMap ? true : false;
    document.getElementById("targetMapUrl").style.visibility = customTargetMap ? "visible" : "hidden";
}

function showOptionsForm() {
    document.getElementById("loginForm").style.display = "none";
    document.getElementById("optionsForm").style.display = "block";
}

function initFromStorage() {
    chrome.storage.sync.get(["collections", "distance", "display", "mapoticForBooking", "customTargetMap", "targetMapUrl", "email", "mapoticAuth"], function(stored) {
        const options = stored.mapoticAuth ? stored : DEFAULT_OPTIONS;
        document.getElementById("distanceInput").value = options.distance;
        document.getElementById("mapoticForBookingInput").checked = !!options.mapoticForBooking;
        document.getElementById("newTab").checked = (options.display !== "window");
        document.getElementById("newWindow").checked = (options.display === "window");
        document.getElementById("customTargetMapInput").checked = !!options.customTargetMap;
        document.getElementById("targetMapUrlInput").innerText = options.targetMapUrl && options.customTargetMap ? options.targetMapUrl : "";
        document.getElementById("userEmail").innerText = options.email ? options.email : "";
        config.collections.forEach((collection) => {
            document.getElementById(collection.name + "Input").checked =
                options.collections.includes(collection.name);
        });

        if (stored.mapoticAuth) {
            showOptionsForm();
        } else {
            showLoginForm(stored.customTargetMap);
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
        const mapoticForBooking = document.getElementById("mapoticForBookingInput").checked;

        chrome.storage.sync.set({
            collections,
            distance,
            display: newTab ? "tab" : "window",
            mapoticForBooking
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
    document.getElementById("customTargetMapInput").addEventListener("change", function(event) {
        const targetMapUrlInput = document.getElementById("targetMapUrlInput");
        targetMapUrlInput.value = "";
        targetMapUrlInput.style.visibility = event.target.checked ? "visible" : "hidden";
        targetMapUrlInput.required = event.target.checked ? true : false;
        document.getElementById("targetMapUrl").style.visibility = event.target.checked ? "visible" : "hidden";
    });

    document.getElementById("login").addEventListener("click", function(event) {
        if (!document.getElementById("loginForm").checkValidity()) {
            return;
        }

        event.preventDefault();

        const customTargetMap = document.getElementById("customTargetMapInput").checked;
        const targetMapUrl = document.getElementById("targetMapUrlInput").value.trim();
        const email = document.getElementById("emailInput").value;
        const password = document.getElementById("passwordInput").value;
        const onError = handleError; //chrome.extension.getBackgroundPage().alert;

        login(email, password, onError).then((mapoticAuth) => {
            if (mapoticAuth) {
                chrome.storage.sync.set({
                    customTargetMap,
                    targetMapUrl,
                    email,
                    mapoticAuth,
                    ...DEFAULT_OPTIONS
                }, initFromStorage);
            }
        });
    });
}

function setCollectionsChangeHandler() {
    const nothingSelected = () => config.collections.every((coll) => (
        !document.getElementById(coll.name + "Input").checked
    ));

    const setAllSelected = () => config.collections.forEach((collection) => {
        document.getElementById(collection.name + "Input").checked = true;
    });

    config.collections.forEach((collection) => {
        document.getElementById(collection.name + "Input").addEventListener("change", function() {
            if (nothingSelected()) {
                setAllSelected();
            }
        });
    });
}

function setLocalizedTexts() {
    const ids = [
        "mapoticLogin",
        "mapoticTargetMap",
        "customTargetMap",
        "targetMapUrl",
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
        "shopping",
        "usage",
        "mapoticForBooking"
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
    setCollectionsChangeHandler();
}

document.addEventListener("DOMContentLoaded", onLoad);