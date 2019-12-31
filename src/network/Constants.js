export const PARENT_ATTRIBUTE = {
    name: { en: "__Parent__" },
    attribute_type: "inputtext",
    settings: [null],
    icon: "im-openid",
    permission: "user",
    is_required: false,
    can_edit: false,
    id: -1
};

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
    "type": "rating",
    "name": "Hodnocení"
}, {
    "type": "image_url",
    "name": "Adresa obrázku"
}];