import Api from '../api/Api.js';

function bookingType(url) {
    if (url.startsWith("https://www.booking.com/searchresults")) {
        return "searchresults";
    }
    if (url.startsWith("https://www.booking.com/hotel")) {
        return "hotel";
    }
    return null;
}

chrome.runtime.onInstalled.addListener(function() {
    console.log('xxx');
});

chrome.pageAction.onClicked.addListener(function(tab) {
    console.log('clicked');
    chrome.tabs.sendMessage(tab.id, { message: 'clicked_page_action', url: tab.url });
});

function pageActionPopup(tabId) {
    chrome.storage.sync.get(["mapoticAuth"], function(stored) {
    
        if (stored.mapoticAuth) {
            chrome.pageAction.setPopup({ tabId, popup: "" });
        } else {
            chrome.pageAction.setPopup({ tabId, popup: "chrome/options.html" });
        }

    });
}

// Called when the url of a tab changes.
function pageAction(tabId, changeInfo, tab) {
    const type = bookingType(tab.url);
    if (type) {
        chrome.pageAction.show(tabId);
        pageActionPopup(tabId);
    } else {
        chrome.pageAction.hide(tabId);
    }
};

// Listen for any changes to the URL of any tab.
chrome.tabs.onUpdated.addListener(pageAction);
chrome.tabs.onActivated.addListener(({ tabId }) => {
    pageActionPopup(tabId);
})

function doInCurrentTab(tabCallback) {
    chrome.tabs.query(
        { currentWindow: true, active: true },
        function (tabArray) { tabCallback(tabArray[0]); }
    );
}

function storageAction(changes, area) {
    if (area === "sync") {
        const changedItems = Object.keys(changes);
        if (changedItems.includes("mapoticAuth")) {
            doInCurrentTab((tab) => {
                pageActionPopup(tab.id);
            });
        }
    }
}

chrome.storage.onChanged.addListener(storageAction);

