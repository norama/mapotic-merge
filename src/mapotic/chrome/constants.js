export const HOTEL_ATTRIBUTE = {
    attribute_type: "number",
    icon: "im-map-pin",
    name: { en: "__Hotel__" },
    permission: "user",
    is_required: false,
    settings: {}
};

export const ATTRIBUTES = [{
    attribute_type: "inputtext",
    icon: "im-bus-stop",
    name: { en: "Název" },
    permission: "user",
    is_required: false,
    settings: {}
}, {
    attribute_type: "inputtext",
    icon: "im-office2",
    name: { en: "Místo" },
    permission: "user",
    is_required: false,
    settings: {}
}, {
    attribute_type: "inputtext",
    icon: "im-earth2",
    name: { en: "Web" },
    permission: "user",
    is_required: false,
    settings: {}
}, {
    attribute_type: "inputtext",
    icon: "im-dollar2",
    name: { en: "Cena" },
    permission: "user",
    is_required: false,
    settings: {}
}, HOTEL_ATTRIBUTE];

export const CATEGORIES = [{
    name: { en: "Hotel" },
    color: "ff3a36",
    icon: "im-bed"
}, {
    name: { en: "Hotel - už je pozdě" },
    color: "ff3a36",
    icon: "im-clock-o"
}];

export const BASE_DEFINITION = [{
    "type": "name",
    "name": "Název místa"
}, {
    "type": "category",
    "name": "Kategorie"
}, {
    "type": "lon",
    "name": "Zeměpisná délka"
}, {
    "type": "lat",
    "name": "Zeměpisná šířka"
}, {
    "type": "id",
    "name": "ID záznamu"
}, {
    "type": "image_url",
    "name": "Adresa obrázku"
}];

export const CENTER = {
    type: "Point",
    coordinates: [14.427178, 50.081764]
};