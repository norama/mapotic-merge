import { login } from '../api/Api.js';

function showLoginForm() {
    document.getElementById("loginForm").style.display = "block";
    document.getElementById("optionsForm").style.display = "none";
}

function showOptionsForm() {
    document.getElementById("loginForm").style.display = "none";
    document.getElementById("optionsForm").style.display = "block";
}

function initFromStorage() {
    chrome.storage.sync.get(["distance", "display", "email", "mapoticAuth"], function(stored) {
        document.getElementById("distanceInput").value = stored.distance ? stored.distance : 50;
        document.getElementById("newTab").checked = (stored.display !== "window");
        document.getElementById("newWindow").checked = (stored.display === "window");
        document.getElementById("userEmail").innerText = stored.email ? stored.email : "";

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

        const distance = document.getElementById("distanceInput").value;
        const newTab = document.getElementById("newTab").checked;

        chrome.storage.sync.set({
            distance,
            display: newTab ? "tab" : "window"
        }, function () {
            window.close();
        });
    });
}

function setLogoutHandler() {
    document.getElementById("logout").addEventListener("click", function() {
        chrome.storage.sync.remove(["distance", "display", "email", "mapoticAuth"], initFromStorage);
    });
}

function setLoginHandler() {
    document.getElementById("login").addEventListener("click", function(event) {
        if (!document.getElementById("loginForm").checkValidity()) {
            return;
        }

        event.preventDefault();

        const email = document.getElementById("emailInput").value;
        const password = document.getElementById("passwordInput").value;
        const onError = chrome.extension.getBackgroundPage().alert;

        login(email, password, onError).then((mapoticAuth) => {
            if (mapoticAuth) {
                console.log('auth', mapoticAuth);
                chrome.storage.sync.set({
                    email,
                    mapoticAuth
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
        "distance"
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