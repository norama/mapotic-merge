import Api from '../api/Api.js';
import createTargetMap from './createTargetMap.js';

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
    console.log('mapotic booking installed');
});

function avg(arr) {
    const sum = arr.reduce((acc, x) => acc + x, 0);
    return sum / arr.length;
}

function center(hotels) {
    return {
        lon: avg(hotels.map(hotel => hotel.lon)),
        lat: avg(hotels.map(hotel => hotel.lat))
    };
}

function hotelsToMap(hotels, stored) {
    //chrome.notifications.create({ title: 'title', message: 'message', iconUrl: "icons/icon48.png", type: "basic" });
}

function handleError(error, title='ERROR') {
    chrome.notifications.create({ title, message: error, iconUrl: "icons/icon48.png", type: "basic" });
}

function map(hotels) {
    chrome.storage.sync.get(["mapoticAuth", "targetMap", "collections", "distance", "display"], function(stored) {
        const api = new Api(stored.mapoticAuth);
        if (!stored.targetMap) {
            createTargetMap(center(hotels), api).then((targetMap) => {
                console.log('targetMap', targetMap);
                chrome.storage.sync.set({
                    targetMap: {
                        id: targetMap.id,
                        name: targetMap.name,
                        slug: targetMap.slug
                    }
                }, function () {
                    hotelsToMap(hotels, stored);
                });
            }).catch((error) => {
                console.error(error);
                handleError('Try to logout/login.', 'Could not create target map.');
            });
        } else {
            hotelsToMap(hotels, stored);
        }
    });
}

chrome.pageAction.onClicked.addListener(function(tab) {
    chrome.tabs.sendMessage(tab.id, { message: 'clicked_page_action', type: bookingType(tab.url) }, (hotels) => {
        console.log('hotels', hotels);

        if (hotels && hotels.length) {
            map(hotels);
        }
    });
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

