export function categoryEqual(cat1, cat2) {
    return cat1.name.en.trim() === cat2.name.en.trim() &&
        cat1.icon === cat2.icon;
}

function empty(x) {
    return x === "{}" || x === "[]" || x === "null" || x === "[null]";
}

function settingsEqual(settings1, settings2) {
    const s1 = JSON.stringify(settings1);
    const s2 = JSON.stringify(settings2);
    return (s1 === s2) || (empty(s1) && empty(s2));
}

export function attributeEqual(attr1, attr2) {
    return attr1.name.en.trim() === attr2.name.en.trim() &&
        attr1.attribute_type === attr2.attribute_type &&
        settingsEqual(attr1.settings, attr2.settings);
}