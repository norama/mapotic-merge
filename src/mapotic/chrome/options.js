function setValuesFromStorage() {
    chrome.storage.sync.get(["display", "popup"], function(stored) {
        document.getElementById("newTab").checked = (stored.display !== "window");
        document.getElementById("newWindow").checked = (stored.display === "window");
    });
}

function setSaveHandler() {
    document.getElementById("save").addEventListener("click", function() {
        if (!document.getElementById("options").checkValidity()) {
            return;
        }
        const newTab = document.getElementById("newTab").checked;


        chrome.storage.sync.set({
            display: newTab ? "tab" : "window"
        }, function () {
            window.close();
        });
    });
}

function setLocalizedTexts() {
    const ids = ["openedIn", "inNewTab", "inNewWindow", "save"];
    ids.forEach((id) => {
        document.getElementById(id).innerHTML = chrome.i18n.getMessage(id);
    });
}

function onLoad() {
    setLocalizedTexts();

    setValuesFromStorage();
    setSaveHandler();
}

document.addEventListener("DOMContentLoaded", onLoad);