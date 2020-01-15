function parseLonLat(location) {
    const lonlat = location.split(',');
    return {
        lon: parseFloat(lonlat[0]),
        lat: parseFloat(lonlat[1])
    };
}

function parseLatLon(location) {
    const latlon = location.split(',');
    return {
        lat: parseFloat(latlon[0]),
        lon: parseFloat(latlon[1])
    };
}

function normalize(str) {
    str = str.trim();
    if (str.startsWith('"') || str.startsWith("'")) {
        str = str.substring(1);
    }
    if (str.startsWith('"') || str.startsWith("'")) {
        str = str.substring(0, str.length - 1);
    }
    return str.trim();
}

function normalizeName(str) {
    return normalize(str).replace(/\n/g, " ");
}

function toInt(str) {
    const parts = str.match(/\d+/g);
    return parts.length ? parseInt(parts.join('')) : null;
}

function toPriceString(priceNum) {
    return priceNum ? "" + priceNum + " Kč" : "-";
}

function toPriceIntervalString(minPriceNum, maxPriceNum) {
    return minPriceNum === maxPriceNum ?
        toPriceString(minPriceNum) :
        "" + minPriceNum + " - " + maxPriceNum + " Kč";
}

class Scraper {
    constructor(type, url) {
        this.type = type;
        this.url = url;
    }

    scrape(hotelId) {
        switch (this.type) {
            case "searchresults":
                return this.scrapeSearchResults(hotelId);
            case "hotel":
                return this.scrapeHotel();
            default:
                return null;
        }
    }

    scrapeSearchResults(hotelId) {
        const hotelsHtml = hotelId ?
            [document.querySelector(`div.sr_item[data-hotelid="${hotelId}"]`)] :
            [...document.querySelectorAll('div.sr_item')];

        const hotelsData = hotelsHtml.map((hotelHtml) => {
            const id = hotelHtml.getAttribute('data-hotelid');
            const link = hotelHtml.querySelector('a.sr_item_photo_link.sr_hotel_preview_track');
            const url = "https://www.booking.com" + link.getAttribute('href');
            const img = link.querySelector('img.hotel_image').getAttribute('src');
            const content = hotelHtml.querySelector('div.sr_item_content');
            const room = content.querySelector('div.room_details');
            let priceNum = null;
            if (room) {
                const roomPrice = room.querySelector('div.roomPrice');
                if (roomPrice) {
                    const priceText = roomPrice.querySelector('span.bui-u-sr-only');
                    if (priceText) {
                        priceNum = toInt(priceText.textContent);
                    }
                }
            }
            const price = toPriceString(priceNum);
            const name = normalizeName(content.querySelector('span.sr-hotel__name').textContent);
            const address = hotelHtml.querySelector('div.sr_card_address_line');
            const a = address.querySelector('a.bui-link');
            const place = a.getAttribute('data-tooltip-text');
            const { lon, lat } = parseLonLat(a.getAttribute('data-coords'));
            const soldOut = !!content.querySelector('span.sold_out_property');

            return {
                id, name, place, url, img, lon, lat, price, soldOut
            };
        });

        return hotelsData;
    }

    scrapeHotel() {
        const form = document.querySelector('form#top-book');
        const id = form.querySelector('input[name="hotel_id"]').getAttribute('value');
        const name = normalizeName(document.querySelector('#hp_hotel_name').textContent);
        const place = normalize(document.querySelector('#showMap2 span[data-source=top_link]').textContent);
        const url = this.url;
        const img = document.querySelector('#hotel_main_content a img').getAttribute('src');
        const { lon, lat } = parseLatLon(document.querySelector('#hotel_header').getAttribute('data-atlas-latlng'));
        const priceStrings = [...document.querySelectorAll('.bui-price-display__value span')].map((node) => (node.innerText));
        let minPriceNum = null, maxPriceNum = null;
        if (priceStrings.length) {
            const priceNums = priceStrings.map(toInt);
            minPriceNum = priceNums.reduce((acc, curr) => (Math.min(acc, curr)), priceNums[0]);
            maxPriceNum = priceNums.reduce((acc, curr) => (Math.max(acc, curr)), priceNums[0]);
        }
        const price = toPriceIntervalString(minPriceNum, maxPriceNum);
        const soldOut = !priceStrings.length;
        return [{
            id, name, place, url, img, lon, lat, price, soldOut
        }];
    }
}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.message === "clicked_page_action" ) {
            const hotels = new Scraper(request.type, request.url).scrape(request.hotelId);
            sendResponse(hotels);
        }
    }
);

function addMapClickListeners() {
    const mapLinks = [];

    const mapIds = [
        'b_google_map_thumbnail',
        'map-header-cta',
        'hotel_sidebar_static_map',
        'hotel_header'
    ];
    mapIds.forEach((mapId) => {
        const mapLink = document.getElementById(mapId);
        if (mapLink) {
            mapLinks.push({ link: mapLink });
        }
    });

    [...document.querySelectorAll('a.show_map')].forEach((mapLink) => {
        if (!mapIds.includes(mapLink.getAttribute('id'))) {
            mapLinks.push({ link: mapLink });
        }
    });

    const hotelsHtml = [...document.querySelectorAll('div.sr_item')];
    hotelsHtml.forEach((hotelHtml) => {
        const hotelId = hotelHtml.getAttribute('data-hotelid');
        const mapLink = hotelHtml.querySelector('.bui-link');
        if (mapLink) {
            mapLinks.push({ link: mapLink, hotelId });
        }
    });

    mapLinks.forEach((mapLink) => {
        mapLink.link.addEventListener('click', function(event) {
            event.preventDefault();
            event.stopPropagation();
            chrome.runtime.sendMessage({ message: 'clicked_map', hotelId: mapLink.hotelId });
        });
    });
}

document.addEventListener('DOMContentLoaded', function() {
    chrome.storage.sync.get(["mapoticForBooking"], function(stored) {
        if (stored.mapoticForBooking) {
            addMapClickListeners();
        }
    });
});