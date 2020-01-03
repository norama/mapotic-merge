function parseLocation(location) {
    const lonlat = location.split(',');
    return {
        lon: parseFloat(lonlat[0]),
        lat: parseFloat(lonlat[1])
    };
}

class Scraper {
    constructor(type) {
        this.type = type;
    }

    scrape() {
        switch (this.type) {
            case "searchresults":
                return this.scrapeSearchResults();
            case "hotel":
                return this.scrapeHotels();
            default:
                return null;
        }
    }

    scrapeSearchResults() {
        const hotelsHtml = [...document.querySelectorAll('div.sr_item')];
        const hotelsData = hotelsHtml.map((hotelHtml) => {
            const link = hotelHtml.querySelector('a.sr_item_photo_link.sr_hotel_preview_track');
            const url = "https://www.booking.com" + link.getAttribute("href");
            const img = link.querySelector('img.hotel_image').getAttribute("src");
            const content = hotelHtml.querySelector('div.sr_item_content');
            const room = content.querySelector('div.room_details');
            let price = '-';
            if (room) {
                const roomPrice = room.querySelector('div.roomPrice');
                if (roomPrice) {
                    const priceText = roomPrice.querySelector('span.bui-u-sr-only');
                    if (priceText) {
                        price = priceText.textContent.trim();
                    }
                }
            }
            const name = content.querySelector('span.sr-hotel__name').textContent.trim();
            const address = hotelHtml.querySelector('div.sr_card_address_line');
            const a = address.querySelector('a.bui-link');
            const place = a.getAttribute('data-tooltip-text');
            const { lon, lat } = parseLocation(a.getAttribute('data-coords'));
            const soldOut = !!content.querySelector('span.sold_out_property');
    
            return {
                name, place, url, img, lon, lat, price, soldOut
            };
        });
    
        return hotelsData;
    }

    // TODO
    scrapeHotel() {
        return [];
    }
}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.message === "clicked_page_action" ) {
            console.log('type', request.type);
            const hotels = new Scraper(request.type).scrape();
            console.log(hotels);
            sendResponse(hotels);
        }
    }
);