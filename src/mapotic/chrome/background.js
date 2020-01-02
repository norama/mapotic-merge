
chrome.runtime.onInstalled.addListener(function() {
    console.log('xxx');
});

chrome.pageAction.onClicked.addListener(function(tab) {
    console.log('clicked');
    chrome.tabs.sendMessage(tab.id, { message: 'clicked_page_action', url: tab.url });
});

function isBookingUrl(url) {
    return url.startsWith('https://www.booking.com/searchresults') ||
        url.startsWith('https://www.booking.com/hotel');
}


// Called when the url of a tab changes.
function pageAction(tabId, changeInfo, tab) {
    // If the tabs url starts with "http://specificsite.com"...
    if (isBookingUrl(tab.url)) {
        // ... show the page action.
        chrome.pageAction.show(tabId);

        if (tab.url.startsWith('https://www.booking.com/hotel')) {
            chrome.pageAction.setPopup({ tabId, popup: "chrome/options.html" });
        } else {
            chrome.pageAction.setPopup({ tabId, popup: "" });
        }
    } else {
        chrome.pageAction.hide(tabId);
    }
};

// Listen for any changes to the URL of any tab.
chrome.tabs.onUpdated.addListener(pageAction);