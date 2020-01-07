import Api from '../api/Api.js';
import createTargetMap from './createTargetMap.js';
import importHotels from './importHotels.js';

import loadSources from './loadSources.js';
import importPlaces from './importPlaces.js';

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

function openMap(targetMap, display) {
    const url = "https://www.mapotic.com/" + targetMap.slug;
    if (display === "window") {
        chrome.windows.create({ url });
    } else {
        chrome.tabs.create({ url });
    }
}

function handleError(error, title='ERROR') {
    chrome.notifications.create({ title, message: error, iconUrl: "icons/icon48.png", type: "basic" });
}

function hotelsToMap(hotels, stored, callback) {
    const api = new Api(stored.mapoticAuth, handleError);
    chrome.notifications.create({ title: "Adding hotels to map...", message: "please wait", iconUrl: "icons/icon48.png", type: "progress", progress: 0 }, (notificationId) => {
        const setProgress = (progress) => {
            chrome.notifications.update(notificationId, { progress: progress.importing });
        };

        importHotels(hotels, stored.targetMap, api, setProgress).then(() => {
            chrome.notifications.clear(notificationId);
        }).finally(callback);
    });
}

function placesToMap(areas, stored, callback) {
    chrome.notifications.create({ title: "Importing ...", message: "loading sources", iconUrl: "icons/icon48.png", type: "progress", progress: 0, requireInteraction: true }, (notificationId) => {
        const updateProgress = ({ progress, title, message }, progressCallback) => {
            chrome.notifications.update(notificationId, {
                progress,
                title,
                message
            }, progressCallback);
        };

        loadSources(stored.collections, new Api(stored.mapoticAuth)).then((sources) => {
            console.log('sources', sources);

            updateProgress({ progress: 2, message: "importing places"});

            return importPlaces(
                sources,
                areas,
                stored.targetMap,
                new Api(stored.mapoticAuth, handleError),
                updateProgress
            );
        }).catch((error) => {
            console.error(error);
            handleError('Could not load sources.', 'Try to change collections in options.');
        }).finally(() => {
            chrome.notifications.clear(notificationId);
            callback()
        });
    });
}

function map(hotels, callback) {
    chrome.storage.sync.get(["mapoticAuth", "targetMap", "collections", "distance", "display"], function(stored) {
        if (!stored.targetMap) {
            const api = new Api(stored.mapoticAuth);
            createTargetMap(api).then(({ targetMap, attributes }) => {
                console.log('targetMap', targetMap);
                attributes = attributes.map((attr) => (
                    { id: attr.id, name: attr.name.en }
                ));
                console.log('attributes', attributes);
                chrome.storage.sync.set({
                    targetMap: {
                        id: targetMap.id,
                        name: targetMap.name,
                        slug: targetMap.slug,
                        attributes
                    }
                }, function () {
                    map(hotels, callback);
                });
            }).catch((error) => {
                console.error(error);
                handleError('Could not create target map.', 'Try to login again.');
            });
        } else {
            const areas = hotels.map((hotel) => ({ lat: hotel.lat, lon: hotel.lon, dist: stored.distance }));

            hotelsToMap(hotels, stored, () => (placesToMap(areas, stored, () => {
                openMap(stored.targetMap, stored.display);
                callback();
            })));
        }
    });
}

chrome.pageAction.onClicked.addListener(function(tab) {
    chrome.tabs.sendMessage(tab.id, { message: 'clicked_page_action', type: bookingType(tab.url) }, (hotels) => {
        chrome.pageAction.hide(tab.id);

        console.log('hotels', hotels);

        if (hotels && hotels.length) {
            map(hotels, () => {
                chrome.pageAction.show(tab.id);
            });
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

