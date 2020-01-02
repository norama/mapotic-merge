class Scraper {
    constructor() {
    }

    scrapeHotels() {
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
            const location = a.getAttribute('data-coords');
    
            return {
                name, place, url, img, location, price
            };
        });
    
        return hotelsData;
    }
}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.message === "clicked_page_action" ) {
            console.log('url', request.url);
            const hotelsData = new Scraper().scrapeHotels();
            console.log(hotelsData);
        }
    }
);